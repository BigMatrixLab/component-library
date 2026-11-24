import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/progress';

test.describe('Progress', () => {
  test('exposes progressbar attributes and thicknesses 4 / 8 / 12px', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const bar = example(page, 0).getByRole('progressbar', { name: 'Storage' });
    await expect(bar).toHaveAttribute('aria-valuenow', '62');
    await expect(bar).toHaveAttribute('aria-valuemin', '0');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');
    const seats = example(page, 0).getByRole('progressbar', { name: 'Seats' });
    await expect(seats).toHaveAttribute('aria-valuemax', '12');
    await expect(seats).toHaveAttribute('aria-valuetext', '92%');
    const heights = await example(page, 0)
      .getByRole('progressbar', { name: /^(Small|Medium|Large)$/ })
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights).toEqual([4, 8, 12]);
    expect(errors).toEqual([]);
  });

  test('the indicator is clipped to the value', async ({ page }) => {
    await openDoc(page, PAGE);
    const bar = example(page, 0).getByRole('progressbar', { name: 'Storage' });
    const track = (await bar.boundingBox())!;
    const shown = await bar.locator('.ui-progress-indicator').evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return el.getBoundingClientRect().width + m.m41;
    });
    expect(shown / track.width).toBeCloseTo(0.62, 1);
  });

  test('circular shows the percentage in the centre', async ({ page }) => {
    await openDoc(page, PAGE);
    const ring = example(page, 1).getByRole('progressbar', { name: 'Storage used' });
    await expect(ring).toHaveAttribute('aria-valuenow', '62');
    await expect(ring).toContainText('62%');
    const box = (await ring.boundingBox())!;
    expect(Math.round(box.width)).toBe(64);
  });

  test('live: indeterminate has no value, then updates while running', async ({ page }) => {
    await openDoc(page, PAGE);
    const live = example(page, 2);
    const bar = live.getByRole('progressbar', { name: 'Upload progress' }).last();
    await expect(bar).not.toHaveAttribute('aria-valuenow', /.*/);
    await expect(bar).toHaveAttribute('data-state', 'indeterminate');
    await live.getByRole('button', { name: 'Start upload' }).click();
    await expect(bar).toHaveAttribute('aria-valuenow', /\d+/);
    await expect(bar).toHaveAttribute('data-state', 'loading');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
