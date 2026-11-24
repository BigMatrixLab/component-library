import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

test.describe('Action button', () => {
  test('morphs idle → pending → success → idle and springs its width', async ({ page }) => {
    const { errors } = await openDoc(page, '/docs/components/action-button');
    const btn = page.getByRole('button', { name: 'Save draft' });
    const idleWidth = (await btn.boundingBox())!.width;

    await btn.click();
    await expect(btn).toHaveAttribute('aria-busy', 'true');
    await expect(btn).toHaveAttribute('data-state', 'pending');
    await expect(btn).toBeFocused();

    const done = page.getByRole('button', { name: 'Draft saved' });
    await expect(done).toHaveAttribute('data-state', 'success', { timeout: 4000 });
    await expect.poll(async () => Math.round((await done.boundingBox())!.width)).not.toBe(Math.round(idleWidth));

    // Returns to idle after ~1.6s
    await expect(page.getByRole('button', { name: 'Save draft' })).toHaveAttribute('data-state', 'idle', { timeout: 4000 });
    expect(errors).toEqual([]);
  });

  test('announces each state in a polite live region', async ({ page }) => {
    await openDoc(page, '/docs/components/action-button');
    const live = example(page, 0).locator('[role="status"]').first();
    await expect(live).toHaveAttribute('aria-live', 'polite');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(live).toHaveText('Saving…');
    await expect(live).toHaveText('Draft saved', { timeout: 4000 });
  });

  test('ignores clicks while pending', async ({ page }) => {
    await openDoc(page, '/docs/components/action-button');
    const btn = page.getByRole('button', { name: 'Sync contacts' });
    await btn.click();
    await btn.click({ force: true });
    await expect(page.getByRole('button', { name: 'Sync failed' })).toHaveAttribute('data-state', 'error', { timeout: 4000 });
  });

  test('a rejected action shows the error state, then recovers', async ({ page }) => {
    await openDoc(page, '/docs/components/action-button');
    const btn = page.getByRole('button', { name: 'Sync contacts' });
    await btn.click();
    const failed = page.getByRole('button', { name: 'Sync failed' });
    await expect(failed).toHaveAttribute('data-state', 'error', { timeout: 4000 });
    await expect(page.getByRole('button', { name: 'Sync contacts' })).toHaveAttribute('data-state', 'idle', { timeout: 4000 });
    // Second attempt succeeds
    await page.getByRole('button', { name: 'Sync contacts' }).click();
    await expect(page.getByRole('button', { name: 'Contacts synced' })).toHaveAttribute('data-state', 'success', { timeout: 4000 });
  });

  test('reduced motion: no width animation is started', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDoc(page, '/docs/components/action-button');
    const btn = page.getByRole('button', { name: 'Save draft' });
    await btn.click();
    const animated = await btn.evaluate((el) => el.getAnimations().some((a) => a.effect?.getTiming().duration === 550));
    expect(animated).toBe(false);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, '/docs/components/action-button');
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, '/docs/components/action-button', { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: idle (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, '/docs/components/action-button', { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`action-button-idle-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
