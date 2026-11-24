import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PATH = '/docs/components/text-shimmer';

const shimmerStyle = (el: Element) => {
  const s = getComputedStyle(el);
  return {
    clip: s.backgroundClip || s.getPropertyValue('-webkit-background-clip'),
    webkitClip: s.getPropertyValue('-webkit-background-clip'),
    animation: s.animationName,
    duration: s.animationDuration,
    image: s.backgroundImage,
    position: s.backgroundPosition,
  };
};

test.describe('Text shimmer', () => {
  test('sweeps a gradient clipped to the text, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const label = example(page, 0).locator('.ui-text-shimmer');
    await expect(label).toHaveAttribute('data-state', 'active');
    const first = await label.evaluate(shimmerStyle);
    expect([first.clip, first.webkitClip]).toContain('text');
    expect(first.animation).toBe('ui-text-shimmer');
    expect(first.image).toContain('linear-gradient');
    await page.waitForTimeout(400);
    const later = await label.evaluate(shimmerStyle);
    expect(later.position).not.toBe(first.position);
    expect(errors).toEqual([]);
  });

  test('stops into plain text when inactive', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 0);
    await scope.getByRole('button', { name: 'Stop' }).click();
    const label = scope.locator('.ui-text-shimmer');
    await expect(label).toHaveAttribute('data-state', 'idle');
    await expect(scope.getByRole('status')).toHaveText('Thought for 6 seconds');
    const style = await label.evaluate(shimmerStyle);
    expect(style.animation).toBe('none');
    expect(style.image).toBe('none');
    await scope.getByRole('button', { name: 'Ask again' }).click();
    await expect(label).toHaveAttribute('data-state', 'active');
  });

  test('asChild shimmers a heading; duration sets the sweep length', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 1);
    await expect(scope.getByRole('heading', { name: 'Generating your Q4 report' })).toHaveClass(/ui-text-shimmer/);
    const slow = scope.getByText(/slower sweep/);
    expect(await slow.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--ui-text-shimmer-duration'))).toBe('3200ms');
    expect((await slow.evaluate(shimmerStyle)).duration).toBe('3.2s');
  });

  test('reduced motion: static text, no gradient', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDoc(page, PATH);
    const style = await example(page, 0).locator('.ui-text-shimmer').evaluate(shimmerStyle);
    expect(style.animation).toBe('none');
    expect(style.image).toBe('none');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PATH);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PATH, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
