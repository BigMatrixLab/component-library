import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/stat';

test.describe('Stat & metric', () => {
  test('KPI row shows four stats in one bordered surface, with tabular values', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const group = example(page, 0).getByRole('group', { name: 'Key metrics' });
    await expect(group.locator('.ui-stat')).toHaveCount(4);

    const surface = await group.evaluate((el) => {
      const s = getComputedStyle(el);
      return { border: s.borderTopWidth, overflow: s.overflow };
    });
    expect(surface.border).toBe('1px');
    expect(surface.overflow).toBe('hidden');

    const value = group.locator('.ui-stat-value').first();
    expect(await value.evaluate((el) => getComputedStyle(el).fontVariantNumeric)).toContain('tabular-nums');
    expect(await value.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(26);

    // Sparklines render
    await expect(group.locator('svg').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('stats wrap instead of overflowing on a phone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openDoc(page, PAGE);
    const group = example(page, 0).getByRole('group', { name: 'Key metrics' });
    const boxes = await group.locator('.ui-stat').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().x));
    // One column: every stat starts at the same x
    expect(new Set(boxes.map((x) => Math.round(x))).size).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('delta tone follows meaning, and carries hidden direction text', async ({ page }) => {
    await openDoc(page, PAGE);
    const deltas = example(page, 1).locator('.ui-stat-delta');
    await expect(deltas).toHaveCount(3);
    // Outstanding went up but is bad: negative tone
    await expect(deltas.nth(0)).toHaveAttribute('data-tone', 'negative');
    await expect(deltas.nth(0)).toContainText('Up');
    await expect(deltas.nth(1)).toHaveAttribute('data-tone', 'positive');
    await expect(deltas.nth(2)).toHaveAttribute('data-tone', 'neutral');

    const colours = await deltas.locator('.ui-stat-delta-value').evaluateAll((els) => els.map((e) => getComputedStyle(e).color));
    expect(new Set(colours).size).toBe(3);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: KPI row (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`stat-kpis-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
