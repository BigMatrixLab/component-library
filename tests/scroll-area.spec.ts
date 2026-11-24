import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/scroll-area';

const thumbY = (thumb: import('@playwright/test').Locator) =>
  thumb.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);

test.describe('Scroll area', () => {
  test('is a labelled, focusable region that overflows and has a thumb', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const area = example(page, 0).locator('.ui-scroll-area');
    const region = area.getByRole('region', { name: 'Changelog' });
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(area).toHaveAttribute('data-overflow-y', '');
    const m = await region.evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight }));
    expect(m.scroll).toBeGreaterThan(m.client + 50);
    expect(Math.round(m.client)).toBeGreaterThan(300);
    const thumb = (await area.locator('.ui-scroll-area-thumb').first().boundingBox())!;
    expect(thumb.height).toBeGreaterThanOrEqual(28);
    // Native scrollbar is hidden: the viewport is as wide as the root
    const widths = await area.evaluate((el) => [el.clientWidth, el.querySelector('.ui-scroll-area-viewport')!.clientWidth]);
    expect(widths[1]).toBe(widths[0]);
    expect(errors).toEqual([]);
  });

  test('edge fades only appear on the side that has more content', async ({ page }) => {
    await openDoc(page, PAGE);
    const area = example(page, 0).locator('.ui-scroll-area');
    const region = area.getByRole('region', { name: 'Changelog' });
    await expect(area).not.toHaveAttribute('data-fade-top', '');
    await expect(area).toHaveAttribute('data-fade-bottom', '');
    await region.evaluate((el) => el.scrollTo({ top: el.scrollHeight / 2, behavior: 'instant' as ScrollBehavior }));
    await expect(area).toHaveAttribute('data-fade-top', '');
    await expect(area).toHaveAttribute('data-fade-bottom', '');
    await region.evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' as ScrollBehavior }));
    await expect(area).toHaveAttribute('data-fade-top', '');
    await expect(area).not.toHaveAttribute('data-fade-bottom', '');
  });

  test('the thumb follows the scroll position', async ({ page }) => {
    await openDoc(page, PAGE);
    const area = example(page, 0).locator('.ui-scroll-area');
    const thumb = area.locator('.ui-scroll-area-thumb').first();
    expect(await thumbY(thumb)).toBeCloseTo(0, 0);
    await area.getByRole('region', { name: 'Changelog' }).evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' as ScrollBehavior }));
    await expect.poll(() => thumbY(thumb)).toBeGreaterThan(50);
    // Thumb bottom meets the track bottom at the end of the scroll
    const t = (await thumb.boundingBox())!;
    const track = (await area.locator('.ui-scroll-area-track').first().boundingBox())!;
    expect(Math.abs(t.y + t.height - (track.y + track.height - 2))).toBeLessThan(2);
  });

  test('keyboard scrolls the focused region', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone' || info.project.name === 'android', 'no hardware keyboard');
    await openDoc(page, PAGE);
    const region = example(page, 0).getByRole('region', { name: 'Changelog' });
    await region.focus();
    await page.keyboard.press('PageDown');
    await expect.poll(() => region.evaluate((el) => el.scrollTop)).toBeGreaterThan(50);
  });

  test('dragging the thumb scrolls the content', async ({ page }, info) => {
    test.skip(!!info.project.use.isMobile || info.project.name === 'iphone' || info.project.name === 'android', 'mouse drag');
    await openDoc(page, PAGE);
    const area = example(page, 0).locator('.ui-scroll-area');
    const region = area.getByRole('region', { name: 'Changelog' });
    await area.hover();
    const thumb = area.locator('.ui-scroll-area-thumb').first();
    const box = (await thumb.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 60, { steps: 6 });
    await expect(area).toHaveAttribute('data-dragging', '');
    await page.mouse.up();
    expect(await region.evaluate((el) => el.scrollTop)).toBeGreaterThan(60);
    await expect(area).not.toHaveAttribute('data-dragging', '');
  });

  test('horizontal: overflows sideways with only a horizontal thumb and a right fade', async ({ page }) => {
    await openDoc(page, PAGE);
    const area = example(page, 1).locator('.ui-scroll-area');
    await expect(area).toHaveAttribute('data-orientation', 'horizontal');
    await expect(area.locator('.ui-scroll-area-track[data-orientation="vertical"]')).toHaveCount(0);
    await expect(area).toHaveAttribute('data-overflow-x', '');
    await expect(area).toHaveAttribute('data-fade-right', '');
    await expect(area).not.toHaveAttribute('data-fade-left', '');
    const region = area.getByRole('region', { name: 'Recent files' });
    await region.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' as ScrollBehavior }));
    await expect(area).toHaveAttribute('data-fade-left', '');
    await expect(area).not.toHaveAttribute('data-fade-right', '');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
