import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/input';

test.describe('Input', () => {
  test('sizes are 32 / 36 / 44px tall', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const heights = await example(page, 1)
      .locator('input')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights).toEqual([32, 36, 44]);
    expect(errors).toEqual([]);
  });

  test('focus draws a ring; invalid uses the destructive border; disabled and read-only', async ({ page }) => {
    await openDoc(page, PAGE);
    const name = page.getByLabel('Project name', { exact: true });
    await name.focus();
    const shadow = await name.evaluate((e) => getComputedStyle(e).boxShadow);
    expect(shadow).not.toBe('none');
    await expect(name).toBeFocused();

    const sub = page.getByLabel('Subdomain', { exact: true });
    await expect(sub).toHaveAttribute('aria-invalid', 'true');
    expect(await sub.evaluate((e) => getComputedStyle(e).borderTopColor)).not.toBe(
      await name.evaluate((e) => getComputedStyle(e).borderTopColor),
    );
    await expect(page.getByLabel('Workspace id', { exact: true })).toBeDisabled();
    await expect(page.getByLabel('Invoice number', { exact: true })).toHaveAttribute('readonly', '');
  });

  test('group: clicking the addon focuses the input; clear action empties the search', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByText('https://', { exact: true }).click();
    await expect(page.getByLabel('Website', { exact: true })).toBeFocused();

    const search = page.getByLabel('Search', { exact: true });
    await expect(search).toHaveValue('quarterly invoices');
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(search).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Clear search' })).toBeHidden();

    const group = example(page, 2).locator('.ui-input-group').first();
    expect(Math.round((await group.boundingBox())!.height)).toBe(36);
  });

  test('group focus ring sits on the group, not the inner input', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByLabel('Amount', { exact: true }).focus();
    const group = example(page, 2).locator('.ui-input-group').nth(2);
    expect(await group.evaluate((e) => getComputedStyle(e).boxShadow)).not.toBe('none');
    expect(await page.getByLabel('Amount', { exact: true }).evaluate((e) => getComputedStyle(e).boxShadow)).toBe('none');
  });

  test('password reveal toggles type and aria-pressed with the keyboard', async ({ page }) => {
    await openDoc(page, PAGE);
    const input = page.getByLabel('Password', { exact: true });
    const toggle = page.getByRole('button', { name: 'Show password' });
    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await input.focus();
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(input).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(input).toHaveValue('correct horse battery');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
