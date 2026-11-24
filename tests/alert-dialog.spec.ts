import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/alert-dialog';

test.describe('Alert dialog (Dialog pattern)', () => {
  test('ignores Esc and the overlay; Cancel closes it and focus returns', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const trigger = page.getByRole('button', { name: 'Revoke API key' });
    await trigger.click();
    const alert = page.getByRole('alertdialog', { name: /Revoke/ });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole('button', { name: 'Keep key' })).toBeFocused();
    await page.keyboard.press('Escape');
    await page.mouse.click(5, 5);
    await expect(alert).toBeVisible();
    await alert.getByRole('button', { name: 'Keep key' }).click();
    await expect(alert).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('type to confirm: the button stays disabled until the name matches', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Delete project' }).click();
    const alert = page.getByRole('alertdialog', { name: /Delete atlas-web/ });
    const confirm = alert.getByRole('button', { name: 'Delete project' });
    const input = alert.getByRole('textbox');
    await expect(input).toBeFocused();
    await expect(confirm).toBeDisabled();
    await input.fill('atlas');
    await expect(confirm).toBeDisabled();
    await input.fill('atlas-web');
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(alert).toHaveCount(0);

    // reopening starts empty
    await page.getByRole('button', { name: 'Delete project' }).click();
    await expect(page.getByRole('alertdialog').getByRole('textbox')).toHaveValue('');
  });

  test('async confirm: loading, a visible failure, then a successful retry', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Remove member' }).click();
    const alert = page.getByRole('alertdialog', { name: /Remove Grace/ });
    const confirm = alert.getByRole('button', { name: 'Remove member' });
    await confirm.click();
    await expect(confirm).toHaveAttribute('aria-busy', 'true');
    await expect(alert.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(alert).toBeVisible();
    // first attempt fails
    await expect(alert.getByRole('alert')).toContainText('couldn');
    const retry = alert.getByRole('button', { name: 'Try again' });
    await retry.click();
    await expect(alert).toHaveCount(0);
    await expect(page.getByText('Grace Hopper was removed from Atlas.')).toBeVisible();
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations while open (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await page.getByRole('button', { name: 'Delete project' }).click();
      await settle(page);
      await expectNoA11yViolations(page, 'dialog');
    });
  }
});
