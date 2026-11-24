import { expect, test, type Locator, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/slider';
const now = (thumb: Locator) => thumb.evaluate((el) => Number(el.getAttribute('aria-valuenow')));

/** Pointer position at a 0–1 ratio along a horizontal slider (thumb centre travels length − thumb). */
async function pointAt(root: Locator, ratio: number) {
  const box = (await root.boundingBox())!;
  const thumb = 20;
  return { x: box.x + thumb / 2 + (box.width - thumb) * ratio, y: box.y + box.height / 2 };
}

async function dragOrTap(page: Page, root: Locator, thumb: Locator, ratio: number, touch: boolean) {
  const target = await pointAt(root, ratio);
  if (touch) {
    await page.touchscreen.tap(target.x, target.y);
    return;
  }
  const t = (await thumb.boundingBox())!;
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 8 });
  await expect(thumb.locator('.ui-slider-tooltip')).toHaveCSS('opacity', '1');
  await page.mouse.up();
}

test.describe('Slider', () => {
  test('keyboard: arrows, page keys, Home and End', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'hardware keyboard only');
    const { errors } = await openDoc(page, PAGE);
    const thumb = page.getByRole('slider', { name: 'Volume' });
    await expect(thumb).toHaveAttribute('aria-valuenow', '40');
    await expect(thumb).toHaveAttribute('aria-valuetext', '40%');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    expect(await now(thumb)).toBe(41);
    await page.keyboard.press('ArrowUp');
    expect(await now(thumb)).toBe(42);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    expect(await now(thumb)).toBe(40);
    await page.keyboard.press('PageUp');
    expect(await now(thumb)).toBe(50);
    await page.keyboard.press('PageDown');
    expect(await now(thumb)).toBe(40);
    await page.keyboard.press('End');
    expect(await now(thumb)).toBe(100);
    await page.keyboard.press('Home');
    expect(await now(thumb)).toBe(0);
    // the live readout follows
    await expect(page.getByText('0%', { exact: true }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('pointer: dragging (or tapping the track on touch) sets the value and fills the track', async ({ page, hasTouch }) => {
    await openDoc(page, PAGE);
    const root = example(page, 0).locator('.ui-slider');
    const thumb = page.getByRole('slider', { name: 'Volume' });
    await root.scrollIntoViewIfNeeded();
    await dragOrTap(page, root, thumb, 0.75, hasTouch);
    expect(Math.abs((await now(thumb)) - 75)).toBeLessThanOrEqual(1);
    // the fill ends under the thumb: its width is about 75% of the span
    const fill = await root.locator('.ui-slider-range').boundingBox();
    const track = await root.locator('.ui-slider-track').boundingBox();
    expect(Math.abs(fill!.width / track!.width - 0.75)).toBeLessThan(0.05);
    // the hidden form input carries the value
    const hidden = await root.locator('input[type="hidden"][name="volume"]').inputValue();
    expect(Number(hidden)).toBe(await now(thumb));
  });

  test('range: two named thumbs, they cannot cross and keep the minimum gap', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'hardware keyboard only');
    await openDoc(page, PAGE);
    const min = page.getByRole('slider', { name: 'Minimum price' });
    const max = page.getByRole('slider', { name: 'Maximum price' });
    await expect(page.getByRole('group', { name: 'Price range' })).toBeVisible();
    expect([await now(min), await now(max)]).toEqual([120, 640]);
    await max.focus();
    await page.keyboard.press('Home');
    // gap = 5 steps of 10
    expect(await now(max)).toBe(170);
    await expect(max).toHaveAttribute('aria-valuemin', '170');
    await min.focus();
    await page.keyboard.press('End');
    expect(await now(min)).toBe(120);
    await expect(page.getByText('$120 – $170')).toBeVisible();
  });

  test('range: dragging the minimum thumb moves only that thumb', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'mouse drag only');
    await openDoc(page, PAGE);
    const root = example(page, 1).locator('.ui-slider');
    const min = page.getByRole('slider', { name: 'Minimum price' });
    const max = page.getByRole('slider', { name: 'Maximum price' });
    await root.scrollIntoViewIfNeeded();
    await dragOrTap(page, root, min, 0.3, false);
    expect(Math.abs((await now(min)) - 300)).toBeLessThanOrEqual(10);
    expect(await now(max)).toBe(640);
  });

  test('steps: value text names the level', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'hardware keyboard only');
    await openDoc(page, PAGE);
    const thumb = page.getByRole('slider', { name: 'Export quality' });
    await expect(thumb).toHaveAttribute('aria-valuetext', 'Standard');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuetext', 'High');
    await page.keyboard.press('End');
    await expect(thumb).toHaveAttribute('aria-valuetext', 'Maximum');
    await page.keyboard.press('ArrowRight');
    expect(await now(thumb)).toBe(3);
  });

  test('vertical: Up raises the value and the thumb', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'hardware keyboard only');
    await openDoc(page, PAGE);
    const bass = page.getByRole('slider', { name: 'Bass' });
    await expect(bass).toHaveAttribute('aria-orientation', 'vertical');
    await bass.scrollIntoViewIfNeeded();
    const y0 = (await bass.boundingBox())!.y;
    await bass.focus();
    await page.keyboard.press('PageUp');
    expect(await now(bass)).toBe(70);
    expect((await bass.boundingBox())!.y).toBeLessThan(y0);
  });

  test('vertical: a tap or click on the track moves the nearest thumb', async ({ page, hasTouch }) => {
    await openDoc(page, PAGE);
    const mid = page.getByRole('slider', { name: 'Mid' });
    const root = mid.locator('xpath=ancestor::*[contains(@class,"ui-slider")][1]');
    await root.scrollIntoViewIfNeeded();
    const box = (await root.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 10 + (box.height - 20) * 0.1; // near the top = about 90
    if (hasTouch) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
    expect(Math.abs((await now(mid)) - 90)).toBeLessThanOrEqual(2);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
