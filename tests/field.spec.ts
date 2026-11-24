import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/field';

test.describe('Field', () => {
  test('label targets the control and hint is described by it', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const email = page.getByLabel('Work email', { exact: true });
    await expect(email).toHaveAttribute('required', '');
    const hint = page.getByText('We send invoices and receipts to this address.');
    const hintId = await hint.getAttribute('id');
    await expect(email).toHaveAttribute('aria-describedby', hintId!);
    await page.getByText('Work email').first().click();
    await expect(email).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('error appears on blur, sets aria-invalid, and clears when fixed', async ({ page }) => {
    await openDoc(page, PAGE);
    const email = example(page, 1).getByLabel('Email', { exact: true });
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const error = page.getByText('Enter an email like ada@northwind.com.');
    await expect(error).toBeVisible();
    expect(await error.evaluate((e) => getComputedStyle(e.closest('p')!).color)).not.toBe('');
    await email.fill('ada@northwind.com');
    await expect(error).toHaveCount(0);
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('submit validates the password and shows a status', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Create account' }).click();
    const password = example(page, 1).getByLabel('Password', { exact: true });
    await expect(password).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Use at least 12 characters.')).toBeVisible();
    await example(page, 1).getByLabel('Email', { exact: true }).fill('ada@northwind.com');
    await password.fill('correct horse battery');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('status')).toContainText('Account created for ada@northwind.com.');
  });

  test('horizontal layout puts the label beside the control on desktop', async ({ page }) => {
    await openDoc(page, PAGE);
    const field = example(page, 2);
    const label = field.getByText('Display name');
    const input = field.getByLabel('Display name', { exact: true });
    const [l, i] = [await label.boundingBox(), await input.boundingBox()];
    expect(l!.x + l!.width).toBeLessThanOrEqual(i!.x + 1);
    expect(Math.abs(l!.y + l!.height / 2 - (i!.y + i!.height / 2))).toBeLessThan(4);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
