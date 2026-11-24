import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/dialog';

test.describe('Dialog', () => {
  test('opens as a modal, focuses the autofocus field, closes on Esc and returns focus', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const trigger = page.getByRole('button', { name: 'Edit profile' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Edit profile' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-state', 'open');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
    expect(errors).toEqual([]);
  });

  test('closes on a backdrop click, not on a click inside the panel', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Edit profile' }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit profile' });
    await dialog.locator('.ui-dialog-panel').click({ position: { x: 20, y: 20 } });
    await expect(dialog).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(dialog).toHaveCount(0);
  });

  test('alertdialog ignores Esc and backdrop; Cancel closes it', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Delete project' }).click();
    const alert = page.getByRole('alertdialog', { name: /Delete/ });
    await expect(alert).toBeVisible();
    await page.keyboard.press('Escape');
    await page.mouse.click(10, 10);
    await expect(alert).toBeVisible();
    await alert.getByRole('button', { name: 'Cancel' }).click();
    await expect(alert).toHaveCount(0);
  });

  test('has no serious accessibility violations while open', async ({ page }) => {
    test.slow(); // axe is slow in Firefox
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Edit profile' }).click();
    await settle(page);
    await expectNoA11yViolations(page, 'dialog');
  });

  for (const dark of [false, true]) {
    test(`visual: open dialog (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PAGE, { dark });
      await page.getByRole('button', { name: 'Edit profile' }).click();
      await settle(page);
      await expect(page.locator('.ui-dialog-panel')).toHaveScreenshot(`dialog-open-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
