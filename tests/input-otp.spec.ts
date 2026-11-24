import { expect, test, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PATH = '/docs/components/input-otp';
const slotsText = (scope: import('@playwright/test').Locator) => scope.locator('.ui-otp-slot').allTextContents().then((t) => t.join(''));

/** Paste text into the focused element through a real ClipboardEvent. */
async function paste(page: Page, text: string) {
  await page.evaluate((value) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', value);
    document.activeElement?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, text);
}

test.describe('Input OTP', () => {
  test('is one real one-time-code input with a box per character', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const otp = example(page, 0);
    await expect(otp.locator('input')).toHaveCount(1);
    await expect(otp.locator('.ui-otp-slot')).toHaveCount(6);
    const input = otp.getByLabel('Verification code');
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(errors).toEqual([]);
  });

  test('typing fills boxes, rejects letters, shows the caret and completes', async ({ page }) => {
    await openDoc(page, PATH);
    const otp = example(page, 0);
    const input = otp.getByLabel('Verification code');
    await input.focus();
    await expect(otp.locator('.ui-otp-slot[data-active]')).toHaveCount(1);
    await expect(otp.locator('.ui-otp-caret')).toHaveCount(1);
    await page.keyboard.type('4a8');
    expect(await slotsText(otp)).toBe('48');
    await expect(otp.locator('.ui-otp-slot').nth(2)).toHaveAttribute('data-active', 'true');
    await page.keyboard.type('291');
    await expect(otp.getByText('That code is incorrect')).toBeVisible();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(otp.locator('.ui-otp')).toHaveAttribute('data-invalid', 'true');
  });

  test('the right code verifies', async ({ page }) => {
    await openDoc(page, PATH);
    const otp = example(page, 0);
    await otp.getByLabel('Verification code').focus();
    await page.keyboard.type('482913');
    await expect(otp.getByText('Verified')).toBeVisible();
  });

  test('backspace removes the last digit and arrows move the active box', async ({ page }) => {
    await openDoc(page, PATH);
    const otp = example(page, 0);
    await otp.getByLabel('Verification code').focus();
    await page.keyboard.type('123');
    await page.keyboard.press('Backspace');
    expect(await slotsText(otp)).toBe('12');
    await page.keyboard.press('ArrowLeft');
    await expect(otp.locator('.ui-otp-slot').nth(1)).toHaveAttribute('data-active', 'true');
    await page.keyboard.press('Home');
    await expect(otp.locator('.ui-otp-slot').nth(0)).toHaveAttribute('data-active', 'true');
    // Typing over the selected character replaces it and moves on
    await page.keyboard.type('9');
    expect(await slotsText(otp)).toBe('92');
  });

  test('paste fills every box and ignores separators', async ({ page }) => {
    await openDoc(page, PATH);
    const otp = example(page, 0);
    await otp.getByLabel('Verification code').focus();
    await paste(page, ' 482-913 ');
    expect(await slotsText(otp)).toBe('482913');
    await expect(otp.getByText('Verified')).toBeVisible();
  });

  test('clicking a box moves the caret there', async ({ page }) => {
    await openDoc(page, PATH);
    const otp = example(page, 0);
    await otp.getByLabel('Verification code').focus();
    await paste(page, '1234');
    await otp.locator('.ui-otp-slot').nth(1).click();
    await expect(otp.locator('.ui-otp-slot').nth(1)).toHaveAttribute('data-active', 'true');
  });

  test('groups render a separator between boxes', async ({ page }) => {
    await openDoc(page, PATH);
    const otp = example(page, 1);
    await expect(otp.locator('.ui-otp-group')).toHaveCount(2);
    await expect(otp.locator('.ui-otp-separator')).toHaveCount(1);
  });

  test('alphanumeric accepts letters and submits with the form name', async ({ page }) => {
    await openDoc(page, PATH);
    const otp = example(page, 2);
    const input = otp.getByLabel('Invite code');
    await expect(input).toHaveAttribute('name', 'invite');
    await expect(input).toHaveAttribute('inputmode', 'text');
    await input.focus();
    await page.keyboard.type('ab12-cd34');
    expect(await slotsText(otp)).toBe('AB12CD34');
  });

  test('sizes have the documented box dimensions and disabled blocks input', async ({ page }) => {
    await openDoc(page, PATH);
    const otp = example(page, 3);
    const sizes = await otp.locator('.ui-otp').evaluateAll((els) =>
      els.map((e) => {
        const r = e.querySelector('.ui-otp-slot')!.getBoundingClientRect();
        return [Math.round(r.width), Math.round(r.height)];
      }),
    );
    expect(sizes).toEqual([[32, 40], [40, 48], [48, 56], [40, 48]]);
    await expect(otp.getByLabel('Disabled code')).toBeDisabled();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PATH);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PATH, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
