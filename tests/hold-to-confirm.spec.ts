import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const NAME = 'Hold to delete workspace';

test.describe('Hold to confirm', () => {
  test('a quick click does not confirm', async ({ page }) => {
    const { errors } = await openDoc(page, '/docs/components/hold-to-confirm');
    const btn = page.getByRole('button', { name: NAME });
    await btn.click();
    await page.waitForTimeout(300);
    await expect(btn).toHaveAttribute('data-state', 'idle');
    await expect(page.getByText('(demo only)')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('holding the pointer for the full duration confirms', async ({ page }) => {
    await openDoc(page, '/docs/components/hold-to-confirm');
    const btn = page.getByRole('button', { name: NAME });
    const box = (await btn.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(btn).toHaveAttribute('data-state', 'holding');
    await expect(page.getByRole('button', { name: 'Workspace deleted' })).toHaveAttribute('data-state', 'done', { timeout: 3000 });
    await page.mouse.up();
    await expect(page.getByText('(demo only)')).toBeVisible();
  });

  test('releasing early drains the fill and does not confirm', async ({ page }) => {
    await openDoc(page, '/docs/components/hold-to-confirm');
    const btn = page.getByRole('button', { name: NAME });
    const box = (await btn.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(600);
    // Roughly half-way: the fill's clip-path is mid-sweep
    const clip = await btn.locator('.ui-hold-fill').evaluate((el) => getComputedStyle(el).clipPath);
    expect(clip).not.toBe('inset(0px 100% 0px 0px)');
    await page.mouse.up();
    await expect(btn).toHaveAttribute('data-state', 'idle');
    await page.waitForTimeout(600);
    await expect(page.getByText('(demo only)')).toHaveCount(0);
  });

  test('keyboard: holding Space confirms; releasing early cancels', async ({ page }) => {
    await openDoc(page, '/docs/components/hold-to-confirm');
    const btn = page.getByRole('button', { name: NAME });
    await btn.focus();
    await page.keyboard.down('Space');
    await expect(btn).toHaveAttribute('data-state', 'holding');
    await page.waitForTimeout(300);
    await page.keyboard.up('Space');
    await expect(btn).toHaveAttribute('data-state', 'idle');

    await page.keyboard.down('Enter');
    await expect(page.getByRole('button', { name: 'Workspace deleted' })).toHaveAttribute('data-state', 'done', { timeout: 3000 });
    await page.keyboard.up('Enter');
  });

  test('has an accessible description of the hold', async ({ page }) => {
    await openDoc(page, '/docs/components/hold-to-confirm');
    const btn = page.getByRole('button', { name: NAME });
    await expect(btn).toHaveAccessibleDescription(/Press and hold for 1\.2 seconds/);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, '/docs/components/hold-to-confirm');
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, '/docs/components/hold-to-confirm', { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: idle (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, '/docs/components/hold-to-confirm', { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`hold-to-confirm-idle-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
