import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/checkbox';

test.describe('Checkbox', () => {
  test('toggles from a label click and from the keyboard, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const box = page.getByLabel('Send a weekly summary', { exact: true });
    await expect(box).not.toBeChecked();
    await page.getByText('Send a weekly summary', { exact: true }).click();
    await expect(box).toBeChecked();
    await expect(box.locator('xpath=ancestor::label')).toHaveAttribute('data-state', 'checked');
    await box.focus();
    await page.keyboard.press('Space');
    await expect(box).not.toBeChecked();
    expect(errors).toEqual([]);
  });

  test('the check mark draws in (stroke-dashoffset 1 to 0)', async ({ page }) => {
    await openDoc(page, PAGE);
    const label = page.getByText('Send a weekly summary', { exact: true });
    const check = example(page, 0).locator('label', { has: label }).locator('.ui-checkbox-check');
    const offset = () => check.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset));
    expect(await offset()).toBe(1);
    await label.click();
    await settle(page);
    expect(await offset()).toBe(0);
  });

  test('disabled checkboxes ignore clicks', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = page.getByLabel('Beta features', { exact: true });
    await expect(box).toBeDisabled();
    await page.getByText('Beta features', { exact: true }).click({ force: true });
    await expect(box).not.toBeChecked();
  });

  test('invalid state follows the controlled value', async ({ page }) => {
    await openDoc(page, PAGE);
    const terms = page.getByLabel('I accept the terms of service', { exact: true });
    await expect(terms).toHaveAttribute('aria-invalid', 'true');
    await terms.check();
    await expect(terms).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('indeterminate parent reflects and drives its children', async ({ page }) => {
    await openDoc(page, PAGE);
    const all = page.getByLabel('All activity', { exact: true });
    const isMixed = () => all.evaluate((el: HTMLInputElement) => el.indeterminate);
    expect(await isMixed()).toBe(true);
    await all.click();
    await expect(page.getByLabel('Mentions', { exact: true })).toBeChecked();
    await expect(page.getByLabel('Deployments', { exact: true })).toBeChecked();
    expect(await isMixed()).toBe(false);
    await expect(all).toBeChecked();
    await page.getByLabel('Mentions', { exact: true }).uncheck();
    expect(await isMixed()).toBe(true);
    // Clicking the mixed box checks everything
    await all.click();
    await expect(page.getByLabel('Mentions', { exact: true })).toBeChecked();
  });

  test('choice cards select from anywhere on the card', async ({ page }) => {
    await openDoc(page, PAGE);
    const card = example(page, 3).locator('label', { hasText: 'Extra seats' });
    await expect(card).toHaveAttribute('data-state', 'unchecked');
    await card.getByText('Add 5 more teammates to your workspace.').click();
    await expect(card).toHaveAttribute('data-state', 'checked');
    await settle(page);
    const border = await card.evaluate((el) => getComputedStyle(el).borderTopColor);
    const plain = await example(page, 3).locator('label', { hasText: 'Audit log' }).evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(border).not.toBe(plain);
  });

  test('sizes render 16 / 20 / 24px boxes', async ({ page }) => {
    await openDoc(page, PAGE);
    const sizes = await example(page, 2).locator('.ui-checkbox-box').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(sizes).toEqual([16, 20, 24]);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
