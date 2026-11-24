import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/command';

/** The inline palette is the second example on the page. */
const inline = (page: Page) => page.locator('.ui-command').filter({ hasText: 'Dashboard' }).first();
const option = (page: Page, name: string | RegExp) => page.getByRole('option', { name });
const active = (page: Page) =>
  page.evaluate(() => {
    const id = document.querySelector('[role="combobox"]')?.getAttribute('aria-activedescendant');
    return id ? (document.getElementById(id)?.textContent?.trim() ?? '') : '';
  });

test.describe('Command palette (inline)', () => {
  test('lists grouped items with the first highlighted and focus in the field', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const box = inline(page);
    await box.scrollIntoViewIfNeeded();
    const field = box.getByRole('combobox');
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await expect(box.getByRole('listbox')).toBeVisible();
    await expect(field).toHaveAttribute('aria-controls', (await box.getByRole('listbox').getAttribute('id'))!);
    await expect(box.getByRole('group', { name: 'Pages' })).toBeVisible();
    await expect(box.getByRole('option', { name: 'Dashboard' })).toHaveAttribute('aria-selected', 'true');
    const h = (await box.getByRole('option', { name: 'Dashboard' }).boundingBox())!;
    expect(Math.round(h.height)).toBe(36);
    expect(errors).toEqual([]);
  });

  test('typing filters; keywords find items; groups without a match hide', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = inline(page);
    const field = box.getByRole('combobox');
    await field.fill('dark mode');
    await expect(box.getByRole('option')).toHaveCount(1);
    await expect(box.getByRole('option', { name: 'Switch to dark theme' })).toBeVisible();
    await expect(box.getByRole('group', { name: 'Pages' })).toHaveCount(0);
    await expect(box.getByRole('separator')).toHaveCount(0);

    await field.fill('zzz');
    await expect(box.getByText('No results found.')).toBeVisible();
    await expect(box.getByRole('listbox')).toHaveCount(0);
    await expect(field).not.toHaveAttribute('aria-controls', /.+/);
    await expect(field).not.toHaveAttribute('aria-activedescendant', /.+/);

    await field.fill('');
    await expect(box.getByRole('option').first()).toBeVisible();
    await expect(box.getByRole('group', { name: 'Pages' })).toBeVisible();
  });

  test('ranks prefix above word start above substring, and highlights the best match', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = inline(page);
    await box.getByRole('combobox').fill('inv');
    // Actions group: "Invite teammate" (prefix) before "Download invoices" (word start)
    const names = await box.getByRole('group', { name: 'Actions' }).getByRole('option').allTextContents();
    expect(names[0]).toContain('Invite teammate');
    expect(names[1]).toContain('Download invoices');
    expect(await active(page)).toContain('Invite teammate');
  });

  test('arrows, Home / End move the highlight, skip disabled items and wrap; Enter runs it', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = inline(page);
    const field = box.getByRole('combobox');
    await field.focus();
    expect(await active(page)).toContain('Dashboard');
    await page.keyboard.press('ArrowDown');
    expect(await active(page)).toContain('Billing');
    await page.keyboard.press('End');
    expect(await active(page)).toContain('Notification settings'); // "Security keys" is disabled
    await page.keyboard.press('ArrowDown'); // wraps
    expect(await active(page)).toContain('Dashboard');
    await page.keyboard.press('ArrowUp'); // wraps back
    expect(await active(page)).toContain('Notification settings');
    await page.keyboard.press('Home');
    expect(await active(page)).toContain('Dashboard');
    await expect(field).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status').filter({ hasText: 'Ran' })).toContainText('Ran “Billing”');
  });

  test('clicking an item runs it', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = inline(page);
    await box.getByRole('option', { name: 'Team' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Ran' })).toContainText('Ran “Team”');
  });

  test('shortcut strings render as key caps', async ({ page }) => {
    await openDoc(page, PAGE);
    const row = inline(page).getByRole('option', { name: /New project/ });
    await expect(row.locator('kbd')).toHaveCount(2);
  });
});

test.describe('Command palette (dialog)', () => {
  const open = (page: Page) => page.getByRole('button', { name: /Search…/ });
  const dialog = (page: Page) => page.getByRole('dialog', { name: 'Command palette' });

  test('opens top-aligned and wide, focuses the field; Esc closes and returns focus', async ({ page }) => {
    await openDoc(page, PAGE);
    await open(page).click();
    await expect(dialog(page)).toBeVisible();
    await settle(page);
    await expect(dialog(page).getByRole('combobox')).toBeFocused();
    const panel = (await dialog(page).locator('.ui-dialog-panel').boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(panel.y).toBeLessThan(viewport.height / 3);
    expect(panel.width).toBeGreaterThan(Math.min(viewport.width - 24, 600));
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    await expect(open(page)).toBeFocused();
  });

  test('Ctrl/⌘ + K toggles it', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.keyboard.press('ControlOrMeta+k');
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('ControlOrMeta+k');
    await expect(dialog(page)).toHaveCount(0);
  });

  test('typing then Enter runs the best match and closes the dialog; the search resets', async ({ page }) => {
    await openDoc(page, PAGE);
    await open(page).click();
    await dialog(page).getByRole('combobox').fill('prefer');
    await expect(option(page, /Preferences/)).toBeVisible();
    await expect(dialog(page).getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Ran' }).first()).toContainText('Ran “Preferences”');

    await open(page).click();
    await expect(dialog(page).getByRole('combobox')).toHaveValue('');
  });

  test('has no serious accessibility violations while open', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await open(page).click();
    await settle(page);
    await expectNoA11yViolations(page, 'dialog');
  });
});
