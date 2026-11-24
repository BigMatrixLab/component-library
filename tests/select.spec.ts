import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/select';

const zone = (page: Page) => page.getByRole('combobox', { name: 'Time zone' });
const list = (page: Page) => page.getByRole('listbox');
const option = (page: Page, name: string | RegExp) => page.getByRole('option', { name });

test.describe('Select', () => {
  test('shows the selected label, opens below the trigger as wide as it, with the pattern attributes', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const trigger = zone(page);
    await expect(trigger).toContainText('London (GMT+0)');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');

    await trigger.click();
    await expect(list(page)).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls', /.+/);
    await settle(page);

    const t = (await trigger.boundingBox())!;
    const panel = (await page.locator('.ui-listbox').boundingBox())!;
    expect(panel.width).toBeGreaterThanOrEqual(t.width - 1);
    expect(Math.abs(panel.y - (t.y + t.height + 6))).toBeLessThanOrEqual(2);
    expect(Math.abs(panel.x - t.x)).toBeLessThanOrEqual(2);

    // pointer open: the selected option is highlighted, and the trigger keeps focus
    await expect(option(page, /London/)).toHaveAttribute('aria-selected', 'true');
    await expect(option(page, /London/)).toHaveAttribute('data-highlighted', '');
    await expect(trigger).toBeFocused();
    const activeId = await option(page, /London/).getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', activeId!);
    expect(errors).toEqual([]);
  });

  test('clicking an option selects it, closes the list and keeps focus on the trigger', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = zone(page);
    await trigger.click();
    await option(page, /Tokyo/).click();
    await expect(list(page)).toHaveCount(0);
    await expect(trigger).toContainText('Tokyo (GMT+9)');
    await expect(trigger).toBeFocused();
    await expect(page.locator('input[type="hidden"][name="timezone"]')).toHaveValue('Asia/Tokyo');
  });

  test('keyboard: arrows, Home / End, typeahead, Enter selects', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = zone(page);
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(list(page)).toBeVisible();
    await expect(option(page, /London/)).toHaveAttribute('data-highlighted', '');

    await page.keyboard.press('ArrowDown');
    await expect(option(page, /Berlin/)).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('End');
    await expect(option(page, /Sydney/)).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Home');
    await expect(option(page, /London/)).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('n');
    await expect(option(page, /New York/)).toHaveAttribute('data-highlighted', '');
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(list(page)).toHaveCount(0);
    await expect(trigger).toContainText('New York');
    await expect(trigger).toBeFocused();
  });

  test('ArrowUp opens on the selected option; Space selects; typeahead works while closed', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = zone(page);
    await trigger.focus();
    await page.keyboard.press('ArrowUp');
    await expect(option(page, /London/)).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press(' ');
    await expect(trigger).toContainText('Berlin');

    await page.keyboard.press('t');
    await expect(list(page)).toBeVisible();
    await expect(option(page, /Tokyo/)).toHaveAttribute('data-highlighted', '');
  });

  test('Esc closes without changing the value and returns focus; an outside click closes without stealing focus', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = zone(page);
    await trigger.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(list(page)).toHaveCount(0);
    await expect(trigger).toContainText('London');
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(list(page)).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(list(page)).toHaveCount(0);
    await expect(trigger).not.toBeFocused();
  });

  test('the label focuses the trigger; groups are labelled; a long list scrolls inside the panel', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByText('Time zone', { exact: true }).first().click();
    await expect(zone(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('group', { name: 'North America' })).toBeVisible();
    const scroller = list(page);
    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('End');
    await expect(option(page, /Sydney/)).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
    expect(await scroller.evaluate((el) => el.scrollHeight >= el.clientHeight)).toBe(true);
  });

  test('sizes are 32 / 36 / 44px tall', async ({ page }) => {
    await openDoc(page, PAGE);
    const heights = [];
    for (const size of ['sm', 'md', 'lg']) {
      const box = (await page.getByRole('combobox', { name: `Billing period, ${size}` }).boundingBox())!;
      heights.push(Math.round(box.height));
    }
    expect(heights).toEqual([32, 36, 44]);
  });

  test('states: error shows until a role is chosen; disabled item is skipped; disabled field locks the trigger', async ({ page }) => {
    await openDoc(page, PAGE);
    const role = page.getByRole('combobox', { name: /Workspace role/ });
    await expect(role).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Choose a role for this member.')).toBeVisible();
    await role.click();
    await expect(option(page, /Owner/)).toHaveAttribute('aria-disabled', 'true');
    await role.press('End');
    await expect(option(page, 'Admin')).toHaveAttribute('data-highlighted', '');
    await role.press('Enter');
    await expect(role).toContainText('Admin');
    await expect(role).not.toHaveAttribute('aria-invalid', 'true');

    await expect(page.getByRole('combobox', { name: 'Region' })).toBeDisabled();
  });

  test('axe: no serious violations, closed and open, light and dark', async ({ page }) => {
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page);
    await zone(page).click();
    await settle(page);
    await expectNoA11yViolations(page);

    const dark = await page.context().newPage();
    await openDoc(dark, PAGE, { dark: true });
    await dark.getByRole('combobox', { name: 'Time zone' }).click();
    await settle(dark);
    await expectNoA11yViolations(dark);
    await dark.close();
  });
});
