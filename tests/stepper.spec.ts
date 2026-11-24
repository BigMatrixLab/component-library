import { expect, test, type Locator } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/stepper';

/** Horizontal scale of a separator's fill (the ::after element). */
const fill = (sep: Locator) =>
  sep.evaluate((el) => new DOMMatrix(getComputedStyle(el, '::after').transform).a);

test.describe('Stepper', () => {
  test('complete, current and upcoming steps look and read correctly', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const stepper = example(page, 0).getByRole('list', { name: 'Checkout progress' });
    const items = stepper.locator('.ui-stepper-item');
    await expect(items).toHaveCount(4);
    await expect(items.nth(0)).toHaveAttribute('data-state', 'complete');
    await expect(items.nth(1)).toHaveAttribute('data-state', 'current');
    await expect(items.nth(2)).toHaveAttribute('data-state', 'upcoming');
    await expect(stepper.locator('[aria-current="step"]')).toHaveCount(1);
    await expect(stepper.locator('[aria-current="step"]')).toContainText('Shipping');
    // number becomes a check when complete
    await expect(items.nth(0).locator('.ui-stepper-check')).toHaveCount(1);
    await expect(items.nth(1).locator('.ui-stepper-indicator')).toHaveText('2');
    await expect(items.nth(0)).toContainText('(completed)');
    // upcoming steps cannot be chosen
    await expect(items.nth(2).getByRole('button')).toBeDisabled();
    expect(errors).toEqual([]);
  });

  test('the line fills when a step completes and empties when going back', async ({ page }) => {
    await openDoc(page, PAGE);
    const preview = example(page, 0);
    const seps = preview.locator('.ui-stepper-separator');
    await settle(page);
    expect(await fill(seps.nth(0))).toBeCloseTo(1, 2);
    expect(await fill(seps.nth(1))).toBeCloseTo(0, 2);

    await preview.getByRole('button', { name: 'Continue' }).click();
    await settle(page);
    expect(await fill(seps.nth(1))).toBeCloseTo(1, 2);
    await expect(preview.locator('.ui-stepper-item').nth(2)).toHaveAttribute('data-state', 'current');

    await preview.getByRole('button', { name: 'Back' }).click();
    await settle(page);
    expect(await fill(seps.nth(1))).toBeCloseTo(0, 2);
  });

  test('the fill moves without overshooting (smooth spring)', async ({ page }) => {
    await openDoc(page, PAGE);
    const preview = example(page, 0);
    await settle(page);
    await preview.getByRole('button', { name: 'Continue' }).click();
    const samples = await page.evaluate(async () => {
      const el = document.querySelectorAll('[role="tabpanel"]')[0]!.querySelectorAll('.ui-stepper-separator')[1]!;
      const out: number[] = [];
      for (let i = 0; i < 40; i++) {
        out.push(new DOMMatrix(getComputedStyle(el, '::after').transform).a);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
      return out;
    });
    expect(Math.max(...samples)).toBeLessThanOrEqual(1.001);
    expect(samples[samples.length - 1]).toBeCloseTo(1, 2);
  });

  test('clicking a completed step goes back to it', async ({ page }) => {
    await openDoc(page, PAGE);
    const preview = example(page, 0);
    await preview.getByRole('button', { name: /Cart/ }).click();
    await expect(preview.locator('.ui-stepper-item').nth(0)).toHaveAttribute('data-state', 'current');
    await expect(preview.getByRole('button', { name: 'Back' })).toBeDisabled();
    await expect(preview.locator('.ui-stepper-item').nth(1)).toHaveAttribute('data-state', 'upcoming');
  });

  test('keyboard: arrows move between selectable steps and skip disabled ones', async ({ page }) => {
    await openDoc(page, PAGE);
    const stepper = example(page, 0).getByRole('list', { name: 'Checkout progress' });
    const cart = stepper.getByRole('button', { name: /Cart/ });
    const shipping = stepper.getByRole('button', { name: /Shipping/ });
    await cart.focus();
    await page.keyboard.press('ArrowRight');
    await expect(shipping).toBeFocused();
    await page.keyboard.press('ArrowRight'); // Payment and Review are disabled: wraps to Cart
    await expect(cart).toBeFocused();
    await page.keyboard.press('End');
    await expect(shipping).toBeFocused();
    await page.keyboard.press('Home');
    await expect(cart).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(stepper.locator('.ui-stepper-item').nth(0)).toHaveAttribute('data-state', 'current');
  });

  test('finishing the flow completes every step', async ({ page }) => {
    await openDoc(page, PAGE);
    const preview = example(page, 0);
    await preview.getByRole('button', { name: 'Continue' }).click();
    await preview.getByRole('button', { name: 'Continue' }).click();
    await expect(preview.getByRole('button', { name: 'Place order' })).toBeVisible();
    await preview.getByRole('button', { name: 'Place order' }).click();
    await expect(preview.getByText('Order #48213 placed.')).toBeVisible();
    await expect(preview.locator('.ui-stepper-item[data-state="complete"]')).toHaveCount(4);
    await expect(preview.locator('[aria-current="step"]')).toHaveCount(0);
  });

  test('vertical: plain text steps, the line runs downwards, nothing overflows', async ({ page }) => {
    await openDoc(page, PAGE);
    const stepper = example(page, 1).getByRole('list', { name: 'Order tracking' });
    await expect(stepper).toHaveAttribute('data-orientation', 'vertical');
    await expect(stepper.getByRole('button')).toHaveCount(0);
    await expect(stepper.locator('[aria-current="step"]')).toContainText('Out for delivery');
    const sep = stepper.locator('.ui-stepper-separator').first();
    const box = (await sep.boundingBox())!;
    expect(Math.round(box.width)).toBe(2);
    expect(box.height).toBeGreaterThan(20);
    await settle(page);
    expect(await fill(sep)).toBeCloseTo(1, 2);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('the horizontal stepper fits on a phone', async ({ page }) => {
    await openDoc(page, PAGE);
    const stepper = example(page, 0).getByRole('list', { name: 'Checkout progress' });
    const box = (await stepper.boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(box.x + box.width).toBeLessThanOrEqual(vw + 1);
    if (vw < 640) {
      // upcoming text is visually clipped to 1px but stays in the accessibility tree
      const text = (await stepper.locator('.ui-stepper-item[data-state="upcoming"] .ui-stepper-text').first().boundingBox())!;
      expect(text.width).toBeLessThanOrEqual(1);
      await expect(stepper.getByRole('button', { name: /Cart/ })).toBeVisible();
    }
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expectNoA11yViolations(page, 'main');
    });
  }
});
