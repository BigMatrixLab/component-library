import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

test.describe('Confirm morph', () => {
  test('idle → confirm → pending → done with Undo', async ({ page }) => {
    const { errors } = await openDoc(page, '/docs/components/confirm-morph');
    const box = example(page, 0).locator('.ui-confirm');
    await expect(box).toHaveAttribute('data-phase', 'idle');
    const idleWidth = (await box.boundingBox())!.width;

    await page.getByRole('button', { name: 'Delete 3 files' }).click();
    await expect(box).toHaveAttribute('data-phase', 'confirm');
    await expect(page.getByRole('button', { name: 'Cancel' }).first()).toBeFocused();
    await expect.poll(async () => (await box.boundingBox())!.width).toBeGreaterThan(idleWidth + 40);

    await example(page, 0).getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(box).toHaveAttribute('data-phase', 'pending');
    await expect(box).toHaveAttribute('data-phase', 'done', { timeout: 4000 });
    await expect(box.getByText('3 files deleted')).toBeVisible();

    await box.getByRole('button', { name: 'Undo' }).click();
    await expect(box).toHaveAttribute('data-phase', 'idle');
    await expect(box.getByRole('button', { name: 'Delete 3 files' })).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('Esc cancels and returns focus to the trigger', async ({ page }) => {
    await openDoc(page, '/docs/components/confirm-morph');
    const box = example(page, 0).locator('.ui-confirm');
    await page.getByRole('button', { name: 'Delete 3 files' }).click();
    await expect(box).toHaveAttribute('data-phase', 'confirm');
    await page.keyboard.press('Escape');
    await expect(box).toHaveAttribute('data-phase', 'idle');
    await expect(box.getByRole('button', { name: 'Delete 3 files' })).toBeFocused();
  });

  test('a failing action shows the error with Retry, which succeeds', async ({ page }) => {
    await openDoc(page, '/docs/components/confirm-morph');
    const box = example(page, 1).locator('.ui-confirm');
    await box.getByRole('button', { name: 'Remove member' }).click();
    await box.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(box).toHaveAttribute('data-phase', 'error', { timeout: 4000 });
    await box.getByRole('button', { name: 'Retry' }).click();
    await expect(box).toHaveAttribute('data-phase', 'done', { timeout: 4000 });
  });

  test('announces the question in a live region', async ({ page }) => {
    await openDoc(page, '/docs/components/confirm-morph');
    const live = example(page, 0).locator('.ui-confirm-live');
    await page.getByRole('button', { name: 'Delete 3 files' }).click();
    await expect(live).toHaveText('Delete 3 files?');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, '/docs/components/confirm-morph');
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, '/docs/components/confirm-morph', { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: idle (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, '/docs/components/confirm-morph', { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`confirm-morph-idle-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
