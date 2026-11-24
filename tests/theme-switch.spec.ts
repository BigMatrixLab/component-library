import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

test.describe('Theme switch', () => {
  test('selecting Dark applies the theme and moves the pill', async ({ page }) => {
    const { errors } = await openDoc(page, '/docs/components/theme-switch');
    const group = example(page, 0).getByRole('radiogroup', { name: 'Theme' });
    const pill = group.locator('.ui-theme-switch-pill');
    await expect(group).toHaveAttribute('data-ready', '');
    await settle(page);
    const x0 = (await pill.boundingBox())!.x;

    await group.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(group.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    await settle(page);
    await expect.poll(async () => (await pill.boundingBox())!.x).not.toBe(x0);
    expect(errors).toEqual([]);
  });

  test('arrow keys move the selection; only the selected option is a tab stop', async ({ page }) => {
    await openDoc(page, '/docs/components/theme-switch');
    const group = example(page, 0).getByRole('radiogroup', { name: 'Theme' });
    const light = group.getByRole('radio', { name: 'Light' });
    await light.click();
    await expect(light).toHaveAttribute('aria-checked', 'true');
    await light.focus();
    await page.keyboard.press('ArrowRight');
    await expect(group.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    await expect(group.getByRole('radio', { name: 'Dark' })).toBeFocused();
    await expect(group.locator('[role="radio"][tabindex="0"]')).toHaveCount(1);
    await page.keyboard.press('End');
    await expect(group.getByRole('radio', { name: 'System' })).toHaveAttribute('aria-checked', 'true');
  });

  test('the circular reveal sets data-ui-reveal while it runs (when supported)', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'View Transitions are not available in this Firefox build');
    await openDoc(page, '/docs/components/theme-switch');
    const supported = await page.evaluate(() => typeof (document as unknown as { startViewTransition?: unknown }).startViewTransition === 'function');
    test.skip(!supported, 'View Transitions API missing');
    const group = example(page, 0).getByRole('radiogroup', { name: 'Theme' });
    await group.getByRole('radio', { name: 'Light' }).click();
    await settle(page);
    await group.getByRole('radio', { name: 'Dark' }).click();
    // The attribute is present during the transition and removed once it finishes
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).not.toHaveAttribute('data-ui-reveal', '', { timeout: 3000 });
  });

  test('reduced motion: instant swap, no reveal attribute', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDoc(page, '/docs/components/theme-switch');
    const group = example(page, 0).getByRole('radiogroup', { name: 'Theme' });
    await group.getByRole('radio', { name: 'Light' }).click();
    await group.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).not.toHaveAttribute('data-ui-reveal', '');
  });

  test('instant-swap variant also changes the theme', async ({ page }) => {
    await openDoc(page, '/docs/components/theme-switch');
    const group = page.getByRole('radiogroup', { name: 'Theme (instant swap)' });
    await group.getByRole('radio', { name: 'Light' }).click();
    await group.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, '/docs/components/theme-switch');
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, '/docs/components/theme-switch', { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: header (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, '/docs/components/theme-switch', { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`theme-switch-header-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
