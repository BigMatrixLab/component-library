import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

test.describe('Button', () => {
  test('renders every variant at the right height, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, '/docs/components/button');
    const sizes = example(page, 1);
    const heights = await sizes.locator('button').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights).toEqual([28, 32, 36, 44]);
    const square = page.getByRole('button', { name: 'Settings' });
    const box = await square.boundingBox();
    expect(Math.round(box!.width)).toBe(Math.round(box!.height));
    expect(errors).toEqual([]);
  });

  test('loading keeps width and focus, and ignores clicks', async ({ page }) => {
    await openDoc(page, '/docs/components/button');
    const btn = page.getByRole('button', { name: 'Save draft' });
    const before = (await btn.boundingBox())!.width;
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-busy', 'true');
    expect((await btn.boundingBox())!.width).toBeCloseTo(before, 0);
    await expect(btn).toBeFocused();
    await expect(btn).not.toHaveAttribute('aria-busy', 'true', { timeout: 4000 });
  });

  test('asChild renders a real link', async ({ page }) => {
    await openDoc(page, '/docs/components/button');
    const link = page.getByRole('link', { name: 'Read the dialog docs' });
    await expect(link).toHaveClass(/ui-btn ui-btn-outline/);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow(); // axe is slow in Firefox
    await openDoc(page, '/docs/components/button');
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, '/docs/components/button', { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: variants (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, '/docs/components/button', { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`button-variants-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
