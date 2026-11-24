import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/skeleton';

test.describe('Skeleton', () => {
  test('shapes measure as specified and are hidden from assistive tech', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const sk = example(page, 0).locator('.ui-skeleton');
    const line = (await sk.first().boundingBox())!;
    expect(Math.round(line.height)).toBe(16);
    const circle = (await example(page, 0).locator('.ui-skeleton-circle').first().boundingBox())!;
    expect(Math.round(circle.width)).toBe(Math.round(circle.height));
    await expect(sk.first()).toHaveAttribute('aria-hidden', 'true');
    expect(errors).toEqual([]);
  });

  test('shimmers, and stands still with reduced motion', async ({ page }) => {
    await openDoc(page, PAGE);
    const sk = example(page, 0).locator('.ui-skeleton').first();
    await expect(sk).toHaveCSS('animation-name', 'ui-shimmer');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(sk).toHaveCSS('animation-name', 'none');
  });

  test('toggling the profile swaps skeletons for content', async ({ page }) => {
    await openDoc(page, PAGE);
    const profile = example(page, 1);
    await expect(profile.locator('.ui-skeleton').first()).toBeVisible();
    await profile.getByRole('button', { name: 'Show loaded content' }).click();
    await expect(profile.getByText('Amina Rahman')).toBeVisible();
    await expect(profile.locator('.ui-skeleton')).toHaveCount(0);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
