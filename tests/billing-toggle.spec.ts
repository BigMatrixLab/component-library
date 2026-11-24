import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PATH = '/docs/components/billing-toggle';

test.describe('Billing toggle', () => {
  test('starts on monthly with the monthly price, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const scope = example(page, 0);
    const group = scope.getByRole('radiogroup', { name: 'Billing period' });
    await expect(group.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true');
    await expect(group.getByRole('radio', { name: /Yearly/ })).toHaveAccessibleName(/Yearly\s*Save 20%/);
    await expect(scope.locator('.ui-billing-price .ui-number-sr')).toHaveText('$30');
    await expect(scope.locator('.ui-billing-price')).toHaveAttribute('aria-live', 'polite');
    expect(errors).toEqual([]);
  });

  test('switching to yearly rolls the price and keeps its width steady', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 0);
    const price = scope.locator('.ui-billing-price-amount');
    const before = (await price.boundingBox())!.width;
    await scope.getByRole('radio', { name: /Yearly/ }).click();
    await expect(scope.getByRole('radio', { name: /Yearly/ })).toHaveAttribute('aria-checked', 'true');
    // The reel is mid-roll: a transform transition on the morph spring
    const transition = await scope.locator('.ui-number-reel').first().evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transition).toContain('transform');
    await expect(scope.locator('.ui-billing-price .ui-number-sr')).toHaveText('$24');
    await expect(scope.getByText('Billed $288 once a year')).toBeVisible();
    await settle(page);
    // $30 → $24: same number of cells, tabular figures
    expect(Math.abs((await price.boundingBox())!.width - before)).toBeLessThanOrEqual(1);
  });

  test('arrow keys switch the cycle (radiogroup, one tab stop) and every plan follows', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 1);
    const group = scope.getByRole('radiogroup', { name: 'Plan billing period' });
    await expect(group.locator('.ui-seg-item[tabindex="0"]')).toHaveCount(1);
    await expect(scope.locator('.ui-billing-price .ui-number-sr')).toHaveText(['$12', '$24', '$64']);
    await group.getByRole('radio', { name: /Yearly/ }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(group.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true');
    await expect(group.getByRole('radio', { name: 'Monthly' })).toBeFocused();
    await expect(scope.locator('.ui-billing-price .ui-number-sr')).toHaveText(['$15', '$30', '$80']);
    // Several prices at once: none of them is a live region
    await expect(scope.locator('.ui-billing-price[aria-live]')).toHaveCount(0);
  });

  test('formats by locale and currency, with decimals for non-whole amounts', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 2);
    const sr = scope.locator('.ui-billing-price .ui-number-sr');
    await expect(sr).toHaveText(/^9,99\s€$/);
    await scope.getByRole('radio', { name: /Jährlich/ }).click();
    await expect(sr).toHaveText(/^99,90\s€$/);
    await expect(scope.getByText('/ Jahr')).toBeVisible();
  });

  test('reduced motion: the price changes without a roll', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDoc(page, PATH);
    const scope = example(page, 0);
    await scope.getByRole('radio', { name: /Yearly/ }).click();
    const duration = await scope.locator('.ui-number-reel').first().evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(duration)).toBeLessThanOrEqual(0.001);
    await expect(scope.locator('.ui-billing-price .ui-number-sr')).toHaveText('$24');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PATH);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PATH, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: monthly or yearly (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PATH, { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`billing-toggle-basic-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
