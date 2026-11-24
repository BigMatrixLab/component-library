import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/timeline';

test.describe('Timeline', () => {
  test('groups events by day and draws a connector between items', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const tl = example(page, 0).locator('.ui-timeline');
    await expect(tl.getByRole('heading', { name: 'Today' })).toBeVisible();
    await expect(tl.getByRole('heading', { name: 'Yesterday' })).toBeVisible();
    const items = tl.locator('.ui-timeline-item');
    await expect(items).toHaveCount(6);
    // 3 items per day: the last one of each day has no connector
    const connectors = await items.evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el, '::before');
        return s.content !== 'none' && s.content !== 'normal' ? s.width : null;
      }),
    );
    expect(connectors).toEqual(['1px', '1px', null, '1px', '1px', null]);
    expect(errors).toEqual([]);
  });

  test('connector runs from the marker toward the next one', async ({ page }) => {
    await openDoc(page, PAGE);
    const items = example(page, 1).locator('.ui-timeline-item');
    const first = (await items.nth(0).locator('.ui-timeline-marker').boundingBox())!;
    const second = (await items.nth(1).locator('.ui-timeline-marker').boundingBox())!;
    const line = await items.nth(0).evaluate((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el, '::before');
      return { top: r.top + parseFloat(s.top), height: parseFloat(s.height), left: r.left + parseFloat(s.left) };
    });
    expect(line.top).toBeGreaterThanOrEqual(first.y + first.height - 1);
    expect(line.top + line.height).toBeLessThanOrEqual(second.y + 1);
    // Centred under the marker
    expect(Math.abs(line.left + 0.5 - (first.x + first.width / 2))).toBeLessThan(1.5);
  });

  test('markers: dot, icon and avatar; tones are exposed as data-tone', async ({ page }) => {
    await openDoc(page, PAGE);
    const items = example(page, 1).locator('.ui-timeline-item');
    await expect(items.nth(0)).toHaveAttribute('data-tone', 'success');
    await expect(items.nth(0).locator('.ui-timeline-marker')).toHaveAttribute('data-kind', 'icon');
    await expect(items.nth(2).locator('.ui-timeline-marker')).toHaveAttribute('data-kind', 'avatar');
    await expect(items.nth(3).locator('.ui-timeline-marker')).toHaveAttribute('data-kind', 'dot');
    const dot = (await items.nth(3).locator('.ui-timeline-dot').boundingBox())!;
    expect(Math.round(dot.width)).toBe(8);
    const iconMarker = (await items.nth(0).locator('.ui-timeline-marker').boundingBox())!;
    expect(Math.round(iconMarker.width)).toBe(24);
  });

  test('times are <time> elements with an ISO datetime', async ({ page }) => {
    await openDoc(page, PAGE);
    const times = example(page, 0).locator('time.ui-timeline-time');
    await expect(times).toHaveCount(6);
    await expect(times.first()).toHaveAttribute('datetime', '2026-11-24T14:32');
  });

  test('is a real list', async ({ page }) => {
    await openDoc(page, PAGE);
    const list = example(page, 1).getByRole('list', { name: 'Order history' });
    await expect(list.getByRole('listitem')).toHaveCount(4);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
