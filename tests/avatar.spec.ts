import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/avatar';

test.describe('Avatar', () => {
  test('sizes measure 24 / 32 / 40 / 48 / 64px, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const widths = await example(page, 0).locator('.ui-avatar').evaluateAll((els) => els.slice(0, 5).map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(widths).toEqual([24, 32, 40, 48, 64]);
    expect(errors).toEqual([]);
  });

  test('a loaded image hides the fallback; a broken image shows the initials', async ({ page }) => {
    await openDoc(page, PAGE);
    const first = example(page, 0).locator('.ui-avatar').first();
    await expect(first.locator('img')).toHaveAttribute('data-state', 'loaded');
    await expect(first.locator('.ui-avatar-fallback')).toHaveCSS('visibility', 'hidden');

    const fb = example(page, 1);
    await expect(fb.locator('img')).toHaveCount(0);
    await expect(fb.getByText('TH')).toBeVisible();
  });

  test('status dot has a name and the group collapses to +N', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(example(page, 2).getByRole('img', { name: 'Online' })).toBeVisible();
    const group = example(page, 3).getByRole('group', { name: 'Project members' });
    await expect(group.locator('.ui-avatar')).toHaveCount(5);
    await expect(group.getByText('+3')).toBeVisible();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
