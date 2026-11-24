import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/badge';

test.describe('Badge', () => {
  test('sizes are 20 / 24 / 28px tall, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const heights = await example(page, 0).locator('.ui-badge').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights.slice(3)).toEqual([20, 24, 28]);
    expect(errors).toEqual([]);
  });

  test('status tones render a dot, and live pulses', async ({ page }) => {
    await openDoc(page, PAGE);
    const status = example(page, 1);
    await expect(status.locator('.ui-badge-success .ui-badge-dot').first()).toBeVisible();
    await expect(status.locator('.ui-badge[data-live] .ui-badge-dot')).toHaveCount(1);
  });

  test('removing a tag keeps the others', async ({ page }) => {
    await openDoc(page, PAGE);
    const tags = example(page, 2);
    await expect(tags.locator('.ui-badge')).toHaveCount(4);
    await tags.getByRole('button', { name: 'Remove Frontend' }).click();
    await expect(tags.locator('.ui-badge')).toHaveCount(3);
    await expect(tags.getByText('Frontend')).toHaveCount(0);
    await expect(tags.getByText('Design')).toBeVisible();
  });

  test('counter badge sits on the corner of its button', async ({ page }) => {
    await openDoc(page, PAGE);
    const anchor = example(page, 3).locator('.ui-badge-anchor').first();
    const btn = await anchor.getByRole('button').boundingBox();
    const badge = await anchor.locator('.ui-badge').boundingBox();
    expect(badge!.x + badge!.width / 2).toBeGreaterThan(btn!.x + btn!.width - 4);
    expect(badge!.y + badge!.height / 2).toBeLessThan(btn!.y + 6);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
