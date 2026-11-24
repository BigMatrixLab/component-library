import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/announcement-bar';
const KEY = 'northwind-announcement-pricing-2026';

test.describe('Announcement bar', () => {
  test('renders three variants as named regions with a dismiss button', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const panel = example(page, 0);
    const bars = panel.locator('.ui-announcement-bar');
    await expect(bars).toHaveCount(3);
    expect(await bars.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.variant))).toEqual([
      'neutral',
      'primary',
      'gradient-subtle',
    ]);
    await expect(panel.getByRole('region', { name: 'Product launch' })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Dismiss announcement' })).toHaveCount(3);
    await expect(panel.getByRole('link', { name: 'Read the changelog' })).toHaveAttribute('href', '#changelog');
    expect(errors).toEqual([]);
  });

  test('dismiss collapses the bar and the content below moves up', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    const first = panel.getByRole('region', { name: 'Maintenance notice' });
    const next = panel.getByRole('region', { name: 'Product launch' });
    const before = (await next.boundingBox())!.y;
    const height = (await first.boundingBox())!.height;
    await first.getByRole('button', { name: 'Dismiss announcement' }).click();
    await expect(first).toHaveCount(0);
    const after = (await next.boundingBox())!.y;
    expect(before - after).toBeGreaterThan(height - 2);
  });

  test('storageKey remembers the dismissal across reloads', async ({ page }) => {
    await openDoc(page, PAGE);
    const bar = example(page, 1).getByRole('region', { name: 'Pricing update' });
    await expect(bar).toBeVisible();
    await bar.getByRole('button', { name: 'Dismiss announcement' }).click();
    await expect(bar).toHaveCount(0);
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe('dismissed');

    // The server renders it; hydration removes it again
    await openDoc(page, PAGE);
    await expect(example(page, 1).getByRole('region', { name: 'Pricing update' })).toHaveCount(0);

    await example(page, 1).getByRole('button', { name: 'Show again' }).click();
    await expect(example(page, 1).getByRole('region', { name: 'Pricing update' })).toBeVisible();
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBeNull();
  });

  test('the dismiss button has a 44px touch target and a keyboard ring', async ({ page }) => {
    await openDoc(page, PAGE);
    const close = example(page, 0).getByRole('button', { name: 'Dismiss announcement' }).first();
    const target = await close.evaluate((el) => {
      const s = getComputedStyle(el, '::before');
      return el.getBoundingClientRect().width - parseFloat(s.left) - parseFloat(s.right);
    });
    expect(Math.round(target)).toBeGreaterThanOrEqual(44);
    // Reach it from the link before it, so :focus-visible applies
    await example(page, 0).getByRole('link', { name: 'Status page' }).focus();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await expect(close).not.toHaveCSS('box-shadow', 'none');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
