import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/usage-meter';

test.describe('Usage meter', () => {
  test('exposes meter values and a readable value text', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const panel = example(page, 0);
    const meter = panel.getByRole('meter', { name: 'Storage' });
    await expect(meter).toHaveAttribute('aria-valuenow', '7.2');
    await expect(meter).toHaveAttribute('aria-valuemin', '0');
    await expect(meter).toHaveAttribute('aria-valuemax', '10');
    await expect(meter).toHaveAttribute('aria-valuetext', '7.2 GB of 10 GB (72%)');
    await expect(meter).toHaveAccessibleDescription('Upgrade to Pro for 100 GB.');
    await expect(panel.locator('.ui-usage-meter')).toHaveAttribute('data-tone', 'default');
    await expect(panel.locator('.ui-usage-meter-summary')).toHaveText('7.2 GB of 10 GB');
    expect(errors).toEqual([]);
  });

  test('the fill grows in on mount and settles at the value', async ({ page }) => {
    await openDoc(page, PAGE);
    await settle(page);
    const track = example(page, 0).locator('.ui-usage-meter-track');
    const [trackW, fillW, height] = await track.evaluate((el) => [
      el.getBoundingClientRect().width,
      el.querySelector('.ui-usage-meter-fill')!.getBoundingClientRect().width,
      el.getBoundingClientRect().height,
    ]);
    expect(fillW / trackW).toBeCloseTo(0.72, 2);
    expect(Math.round(height)).toBe(8);
    // The mount animation has finished
    const running = await track.locator('.ui-usage-meter-fill').evaluate((el) =>
      el.getAnimations().filter((a) => a.playState === 'running').length,
    );
    expect(running).toBe(0);
  });

  test('thresholds shift the tone and show a status', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 1);
    const root = panel.locator('.ui-usage-meter').first();
    const meter = panel.getByRole('meter', { name: 'API requests' });
    const use = panel.getByRole('button', { name: 'Use 1,000 requests' });

    await expect(root).toHaveAttribute('data-tone', 'default');
    await expect(meter).toHaveAttribute('aria-valuetext', '7,000 of 10,000 (70%)');
    await expect(root.locator('.ui-usage-meter-status')).toHaveCount(0);

    await use.click();
    await expect(root).toHaveAttribute('data-tone', 'warning');
    await expect(root.locator('.ui-usage-meter-status')).toHaveText('Approaching limit');
    await expect(meter).toHaveAttribute('aria-valuetext', '8,000 of 10,000 (80%), approaching limit');

    await use.click();
    await expect(root).toHaveAttribute('data-tone', 'destructive');
    await expect(root.locator('.ui-usage-meter-status')).toHaveText('Near limit');

    await use.click();
    await expect(root.locator('.ui-usage-meter-status')).toHaveText('Limit reached');
    await expect(meter).toHaveAttribute('aria-valuenow', '10000');

    await panel.getByRole('button', { name: 'Reset' }).click();
    await expect(root).toHaveAttribute('data-tone', 'default');

    const seats = panel.locator('.ui-usage-meter').nth(1);
    await expect(seats).toHaveAttribute('data-tone', 'destructive');
    await expect(seats.locator('.ui-usage-meter-status')).toHaveText('Limit reached');
    await expect(seats.locator('.ui-usage-meter-track')).toHaveCSS('height', '4px');
  });

  test('segmented: one segment per category, proportional, with a legend', async ({ page }) => {
    await openDoc(page, PAGE);
    await settle(page);
    const panel = example(page, 2);
    const meter = panel.getByRole('meter', { name: 'Drive storage' });
    await expect(meter).toHaveAttribute('aria-valuenow', '8.6');
    await expect(meter).toHaveCSS('height', '12px');
    const segments = panel.locator('.ui-usage-meter-segment');
    await expect(segments).toHaveCount(4);
    const widths = await segments.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
    // Photos 3.4 > Videos 2.9 > Documents 1.5 > Mail 0.8
    expect(widths[0]).toBeGreaterThan(widths[1]);
    expect(widths[1]).toBeGreaterThan(widths[2]);
    expect(widths[2]).toBeGreaterThan(widths[3]);
    // Each segment takes a different series colour
    const colours = await segments.evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
    expect(new Set(colours).size).toBe(4);
    const items = panel.getByRole('listitem');
    await expect(items).toHaveCount(4);
    await expect(items.first()).toContainText('Photos');
    await expect(items.first()).toContainText('3.4 GB');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
