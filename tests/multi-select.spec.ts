import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/multi-select';

const reviewers = (page: Page) => page.getByRole('combobox', { name: 'Reviewers' });
const channels = (page: Page) => page.getByRole('combobox', { name: 'Notify channels' });
const list = (page: Page) => page.getByRole('listbox');
const option = (page: Page, name: string | RegExp) => page.getByRole('option', { name });
const chips = (page: Page, label: string) =>
  page.locator('.ui-multi-select-control', { has: page.getByRole('combobox', { name: label }) }).locator('.ui-multi-select-chip');
const hidden = (page: Page, name: string) =>
  page.locator(`input[type="hidden"][name="${name}"]`).evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));

test.describe('Multi-select', () => {
  test('shows the default values as chips and opens a multiselectable list with checked options', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    await expect(chips(page, 'Reviewers')).toHaveText(['Ada Lovelace', 'Grace Hopper']);
    expect(await hidden(page, 'reviewers')).toEqual(['ada', 'grace']);
    await expect(reviewers(page)).toHaveAttribute('aria-expanded', 'false');

    await reviewers(page).click();
    await expect(list(page)).toBeVisible();
    await expect(list(page)).toHaveAttribute('aria-multiselectable', 'true');
    await expect(page.getByRole('option')).toHaveCount(8);
    await expect(page.locator('[role="option"][aria-selected="true"]')).toHaveCount(2);
    await expect(page.getByRole('status')).toHaveText('2 selected');
    await settle(page);

    const control = (await page.locator('.ui-multi-select-control').first().boundingBox())!;
    const panel = (await page.locator('.ui-listbox').boundingBox())!;
    expect(Math.abs(panel.y - (control.y + control.height + 6))).toBeLessThanOrEqual(2);
    expect(panel.width).toBeGreaterThanOrEqual(control.width - 1);
    await expect(reviewers(page)).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('choosing options toggles them and keeps the list open', async ({ page }) => {
    await openDoc(page, PAGE);
    await reviewers(page).click();
    await option(page, 'Katherine Johnson').click();
    await expect(list(page)).toBeVisible();
    await expect(chips(page, 'Reviewers')).toHaveText(['Ada Lovelace', 'Grace Hopper', 'Katherine Johnson']);
    await expect(option(page, 'Katherine Johnson')).toHaveAttribute('aria-selected', 'true');
    await option(page, 'Ada Lovelace').click();
    await expect(chips(page, 'Reviewers')).toHaveText(['Grace Hopper', 'Katherine Johnson']);
    expect(await hidden(page, 'reviewers')).toEqual(['grace', 'katherine']);
    await expect(reviewers(page)).toBeFocused();
  });

  test('typing filters, Enter toggles the first match and clears the search', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = reviewers(page);
    await input.click();
    await input.fill('ham');
    await expect(page.getByRole('option')).toHaveCount(1);
    await expect(option(page, 'Margaret Hamilton')).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Enter');
    await expect(chips(page, 'Reviewers')).toHaveCount(3);
    await expect(input).toHaveValue('');
    await expect(page.getByRole('option')).toHaveCount(8);
    await expect(list(page)).toBeVisible();
  });

  test('Backspace in the empty input removes the last chip; the chip x removes its own', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = reviewers(page);
    await input.focus();
    await page.keyboard.press('Backspace');
    await expect(chips(page, 'Reviewers')).toHaveText(['Ada Lovelace']);
    await page.getByRole('button', { name: 'Remove Ada Lovelace' }).click();
    await expect(chips(page, 'Reviewers')).toHaveCount(0);
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('placeholder', 'Add reviewers');
    expect(await hidden(page, 'reviewers')).toEqual([]);
  });

  test('keyboard: arrows open and move, Esc closes, focus stays in the input', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = reviewers(page);
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(list(page)).toBeVisible();
    await expect(option(page, 'Ada Lovelace')).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('ArrowDown');
    await expect(option(page, 'Grace Hopper')).toHaveAttribute('data-highlighted', '');
    const id = await option(page, 'Grace Hopper').getAttribute('id');
    await expect(input).toHaveAttribute('aria-activedescendant', id!);
    await page.keyboard.press('Escape');
    await expect(list(page)).toHaveCount(0);
    await expect(input).toBeFocused();
  });

  test('Clear all empties the selection', async ({ page }) => {
    await openDoc(page, PAGE);
    await reviewers(page).click();
    await page.getByRole('button', { name: 'Clear all' }).click();
    await expect(chips(page, 'Reviewers')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveCount(0);
  });

  test('max: extra chips collapse to +n more and the rest of the options lock once the limit is reached', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(chips(page, 'Notify channels')).toHaveText(['General', 'Design', '+1 more']);

    await channels(page).click();
    await expect(page.getByRole('status')).toHaveText('3 selected of 4');
    await option(page, 'Support').click();
    await expect(page.getByRole('status')).toHaveText('4 selected of 4');
    await expect(option(page, 'Finance')).toHaveAttribute('aria-disabled', 'true');
    await option(page, 'Finance').click({ force: true });
    await expect(page.getByRole('status')).toHaveText('4 selected of 4');

    await option(page, 'Support').click(); // uncheck frees a slot
    await expect(option(page, 'Finance')).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('a click outside closes the list and clears the search text', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = reviewers(page);
    await input.click();
    await input.fill('gra');
    await page.mouse.click(5, 300);
    await expect(list(page)).toHaveCount(0);
    await expect(input).toHaveValue('');
  });

  test('axe: no serious violations, closed and open, light and dark', async ({ page }) => {
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page);
    await reviewers(page).click();
    await settle(page);
    await expectNoA11yViolations(page);

    const dark = await page.context().newPage();
    await openDoc(dark, PAGE, { dark: true });
    await dark.getByRole('combobox', { name: 'Reviewers' }).click();
    await settle(dark);
    await expectNoA11yViolations(dark);
    await dark.close();
  });
});
