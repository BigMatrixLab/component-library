import { expect, test, type Locator } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PATH = '/docs/components/toggle-group';

/** The pill's box must match the checked item's box (within subpixel rounding). */
async function expectPillOnActive(seg: Locator) {
  const pill = await seg.locator('.ui-seg-pill').boundingBox();
  const active = await seg.locator('.ui-seg-item[aria-checked="true"]').boundingBox();
  expect(pill).not.toBeNull();
  expect(active).not.toBeNull();
  for (const k of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(pill![k] - active![k])).toBeLessThanOrEqual(1);
}

test.describe('Segmented control', () => {
  test('pill sits on the active item from the first render, without animation', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const seg = example(page, 0).getByRole('radiogroup', { name: 'Billing period' });
    await expect(seg.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true');
    await expectPillOnActive(seg);
    expect(errors).toEqual([]);
  });

  test('clicking moves the pill (it glides), then rests on the new item', async ({ page }) => {
    await openDoc(page, PATH);
    const seg = example(page, 0).getByRole('radiogroup', { name: 'Billing period' });
    const before = (await seg.locator('.ui-seg-pill').boundingBox())!;
    await seg.getByRole('radio', { name: 'Yearly' }).click();
    await expect(seg.getByRole('radio', { name: 'Yearly' })).toHaveAttribute('aria-checked', 'true');
    // Mid-flight the pill is still travelling (CSS transition on transform)
    const transition = await seg.locator('.ui-seg-pill').evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transition).toContain('transform');
    await settle(page);
    const after = (await seg.locator('.ui-seg-pill').boundingBox())!;
    expect(after.x).toBeGreaterThan(before.x + 20);
    await expectPillOnActive(seg);
    await expect(example(page, 0).getByText('$240 / year')).toBeVisible();
  });

  test('arrow keys move and select (radiogroup), Home/End jump, one tab stop', async ({ page }) => {
    await openDoc(page, PATH);
    const seg = example(page, 0).getByRole('radiogroup', { name: 'Billing period' });
    await expect(seg.locator('.ui-seg-item[tabindex="0"]')).toHaveCount(1);
    await seg.getByRole('radio', { name: 'Monthly' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(seg.getByRole('radio', { name: 'Yearly' })).toHaveAttribute('aria-checked', 'true');
    await expect(seg.getByRole('radio', { name: 'Yearly' })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(seg.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true');
    await settle(page);
    await expectPillOnActive(seg);
  });

  test('sizes: heights, disabled items are skipped, full width fills the container', async ({ page, isMobile }) => {
    await openDoc(page, PATH);
    const scope = example(page, 1);
    const heights = await scope.locator('.ui-seg').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    if (!isMobile) expect(heights).toEqual([32, 38, 46]);
    const board = scope.getByRole('radiogroup', { name: 'View' });
    await board.getByRole('radio', { name: 'Board' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(board.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true'); // Timeline is disabled → wraps
    const full = scope.getByRole('radiogroup', { name: 'Layout (full width)' });
    const [outer, inner] = await Promise.all([full.boundingBox(), full.locator('.ui-seg-item').first().boundingBox()]);
    expect(outer!.width).toBeGreaterThan(inner!.width * 2.5);
    await expectPillOnActive(full);
  });
});

test.describe('Toggle and toggle group', () => {
  test('a toggle flips aria-pressed on click and keyboard', async ({ page }) => {
    await openDoc(page, PATH);
    const t = example(page, 2).getByRole('button', { name: 'Favourite' });
    await expect(t).toHaveAttribute('aria-pressed', 'false');
    await t.click();
    await expect(t).toHaveAttribute('aria-pressed', 'true');
    await t.focus();
    await page.keyboard.press('Space');
    await expect(t).toHaveAttribute('aria-pressed', 'false');
    const muted = example(page, 2).getByRole('button', { name: /Mute thread/ });
    await muted.click();
    await expect(example(page, 2).getByRole('button', { name: 'Muted' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('toggle sizes are 32, 36 and 44px high', async ({ page, isMobile }) => {
    await openDoc(page, PATH);
    const scope = example(page, 2);
    const h = async (name: string) => Math.round((await scope.getByRole('button', { name }).boundingBox())!.height);
    if (!isMobile) {
      expect(await h('Small')).toBe(32);
      expect(await h('Large')).toBe(44);
    }
  });

  test('multiple group keeps several items pressed; arrows move focus without pressing', async ({ page }) => {
    await openDoc(page, PATH);
    const group = example(page, 3).getByRole('group', { name: 'Text formatting' });
    await expect(group.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
    await group.getByRole('button', { name: 'Italic' }).click();
    await expect(group.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true');
    await expect(group.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
    await expect(group.locator('.ui-toggle[tabindex="0"]')).toHaveCount(1);
    await group.getByRole('button', { name: 'Bold' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(group.getByRole('button', { name: 'Italic' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(group.getByRole('button', { name: 'Underline' })).toBeFocused();
    await expect(group.getByRole('button', { name: 'Underline' })).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('ArrowRight');
    await expect(group.getByRole('button', { name: 'Bold' })).toBeFocused();
  });

  test('single group presses one item at a time', async ({ page }) => {
    await openDoc(page, PATH);
    const group = example(page, 3).getByRole('group', { name: 'Text alignment' });
    await expect(group.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'true');
    await group.getByRole('button', { name: 'Right' }).click();
    await expect(group.getByRole('button', { name: 'Right' })).toHaveAttribute('aria-pressed', 'true');
    await expect(group.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('icon group presses the system item by default', async ({ page }) => {
    await openDoc(page, PATH);
    const group = example(page, 4).getByRole('group', { name: 'Theme' });
    await expect(group.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true');
    await group.getByRole('button', { name: 'Dark' }).click();
    await expect(group.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PATH);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PATH, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
