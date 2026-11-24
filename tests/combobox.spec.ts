import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/combobox';

const country = (page: Page) => page.getByRole('combobox', { name: 'Billing country' });
const framework = (page: Page) => page.getByRole('combobox', { name: 'Primary framework' });
const list = (page: Page) => page.getByRole('listbox');
const option = (page: Page, name: string | RegExp) => page.getByRole('option', { name });

test.describe('Combobox', () => {
  test('shows the selected label, opens below the field and lists every option', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const input = country(page);
    await expect(input).toHaveValue('Ireland');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await expect(page.locator('input[type="hidden"][name="country"]')).toHaveValue('IE');

    await input.click();
    await expect(list(page)).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('option')).toHaveCount(18);
    await expect(option(page, 'Ireland')).toHaveAttribute('aria-selected', 'true');
    await settle(page);

    const group = (await input.locator('xpath=ancestor::div[contains(@class,"ui-input-group")]').boundingBox())!;
    const panel = (await page.locator('.ui-listbox').boundingBox())!;
    expect(Math.abs(panel.y - (group.y + group.height + 6))).toBeLessThanOrEqual(2);
    expect(panel.width).toBeGreaterThanOrEqual(group.width - 1);
    await expect(input).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('filters ignoring case and accents, highlights the match, and Enter picks the first result', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = country(page);
    await input.click();
    await input.fill('turk');
    await expect(page.getByRole('option')).toHaveCount(1);
    await expect(option(page, 'Türkiye')).toHaveAttribute('data-highlighted', '');
    await expect(option(page, 'Türkiye').locator('mark')).toHaveText('Türk');
    await expect(input).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(list(page)).toHaveCount(0);
    await expect(input).toHaveValue('Türkiye');
    await expect(page.locator('input[type="hidden"][name="country"]')).toHaveValue('TR');
  });

  test('group headings hide when none of their options match', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = country(page);
    await input.click();
    await expect(page.getByRole('group')).toHaveCount(3);
    await input.fill('japan');
    await expect(page.locator('.ui-listbox-group:visible')).toHaveCount(1);
    await expect(page.getByRole('option')).toHaveCount(1);
  });

  test('shows the empty message when nothing matches', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = country(page);
    await input.click();
    await input.fill('zzz');
    await expect(page.getByText('No country matches your search.')).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(0);
    await expect(list(page)).toHaveCount(0);
  });

  test('keyboard: ArrowDown opens, arrows move the highlight and focus stays in the input', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = country(page);
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(list(page)).toBeVisible();
    await expect(option(page, 'Ireland')).toHaveAttribute('data-highlighted', '');
    const id = await option(page, 'Ireland').getAttribute('id');
    await expect(input).toHaveAttribute('aria-activedescendant', id!);

    await page.keyboard.press('ArrowDown');
    await expect(option(page, 'India')).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(option(page, 'France')).toHaveAttribute('data-highlighted', '');
    await expect(input).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('France');
    await expect(list(page)).toHaveCount(0);
  });

  test('Esc restores the selected label; Esc again clears; clear button empties the value', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = country(page);
    await input.click();
    await input.fill('ger');
    await page.keyboard.press('Escape');
    await expect(list(page)).toHaveCount(0);
    await expect(input).toHaveValue('Ireland');

    await page.keyboard.press('Escape');
    await expect(input).toHaveValue('');
    await expect(page.locator('input[type="hidden"][name="country"]')).toHaveValue('');

    await input.click();
    await option(page, 'Canada').click();
    await expect(input).toHaveValue('Canada');
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
  });

  test('clicking outside closes the list and restores the label', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = country(page);
    await input.click();
    await input.fill('swe');
    await page.mouse.click(5, 300);
    await expect(list(page)).toHaveCount(0);
    await expect(input).toHaveValue('Ireland');
  });

  test('create: an unmatched name offers a Create row that adds and selects it', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = framework(page);
    await expect(input).toHaveValue('Next.js');
    await input.click();
    await input.fill('Solid');
    await expect(option(page, /Create .Solid./)).toBeVisible();
    await expect(option(page, /Create .Solid./)).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Solid');

    await input.click();
    await expect(option(page, 'Solid')).toHaveAttribute('aria-selected', 'true');
    await input.fill('Solid');
    await expect(page.getByRole('option', { name: /Create/ })).toHaveCount(0); // exact match: no create row

    await input.fill('Astro');
    await expect(page.getByRole('option', { name: /Create/ })).toHaveCount(0);
  });

  test('axe: no serious violations, closed and open, light and dark', async ({ page }) => {
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page);
    await country(page).click();
    await settle(page);
    await expectNoA11yViolations(page);

    const dark = await page.context().newPage();
    await openDoc(dark, PAGE, { dark: true });
    await dark.getByRole('combobox', { name: 'Billing country' }).click();
    await settle(dark);
    await expectNoA11yViolations(dark);
    await dark.close();
  });
});
