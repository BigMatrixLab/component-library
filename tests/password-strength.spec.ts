import { expect, test, type Locator } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PATH = '/docs/components/password-strength';

async function filled(root: Locator) {
  return root.locator('.ui-password-strength-segment[data-filled]').count();
}

test.describe('Password strength', () => {
  test('starts empty and is wired to the input, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const scope = example(page, 0);
    const root = scope.locator('.ui-password-strength');
    await expect(root).toHaveAttribute('data-level', 'empty');
    expect(await filled(root)).toBe(0);
    await expect(root.locator('.ui-password-strength-label')).toHaveText('');
    await expect(root.locator('.ui-password-strength-requirement[data-met]')).toHaveCount(0);
    const id = await root.getAttribute('id');
    const describedBy = await scope.getByLabel('Create a password', { exact: true }).getAttribute('aria-describedby');
    expect(describedBy?.split(' ')).toContain(id);
    expect(errors).toEqual([]);
  });

  test('scores as you type: meter, word and checklist follow', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 0);
    const input = scope.getByLabel('Create a password', { exact: true });
    const root = scope.locator('.ui-password-strength');
    const meter = root.getByRole('meter', { name: 'Password strength' });

    await input.fill('password');
    await expect(root).toHaveAttribute('data-level', 'weak');
    expect(await filled(root)).toBe(1);
    await expect(root.locator('.ui-password-strength-label')).toHaveText('Weak');
    await expect(root.locator('[data-id="length"]')).toHaveAttribute('data-met', '');

    await input.fill('Tr0ub4dor&3');
    await expect(root).toHaveAttribute('data-level', 'good');
    expect(await filled(root)).toBe(3);
    await expect(meter).toHaveAttribute('aria-valuenow', '3');
    await expect(meter).toHaveAttribute('aria-valuetext', 'Good');
    await expect(root.locator('.ui-password-strength-requirement[data-met]')).toHaveCount(4);
    await expect(root.locator('[data-id="symbol"] .ui-password-strength-sr')).toHaveText('Met:');

    await settle(page);
    // The fill has grown to the full segment width
    const scale = await root
      .locator('.ui-password-strength-segment[data-filled]')
      .first()
      .evaluate((el) => getComputedStyle(el, '::after').transform);
    expect(scale === 'none' || scale.startsWith('matrix(1, 0, 0, 1')).toBe(true);

    await input.fill('');
    await expect(root).toHaveAttribute('data-level', 'empty');
    expect(await filled(root)).toBe(0);
  });

  test('the level word is the only live region', async ({ page }) => {
    await openDoc(page, PATH);
    const root = example(page, 0).locator('.ui-password-strength');
    await expect(root.locator('[aria-live]')).toHaveCount(1);
    await expect(root.locator('.ui-password-strength-label')).toHaveAttribute('aria-live', 'polite');
  });

  test('meter only: custom words and a submit gated by the same score', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 1);
    const input = scope.getByLabel('New password', { exact: true });
    const submit = scope.getByRole('button', { name: 'Update password' });
    await expect(scope.locator('.ui-password-strength-checklist')).toHaveCount(0);
    await expect(submit).toBeDisabled();
    await input.fill('qwerty12');
    await expect(scope.locator('.ui-password-strength-label')).toHaveText('Too weak');
    await expect(submit).toBeDisabled();
    await input.fill('Xk9#mP2$vL7!qR4w');
    await expect(scope.locator('.ui-password-strength-label')).toHaveText('Excellent');
    await expect(submit).toBeEnabled();
  });

  test('custom requirements tick independently', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 2);
    const rows = scope.locator('.ui-password-strength-requirement');
    await expect(rows).toHaveCount(3);
    const input = scope.getByLabel('Workspace passphrase', { exact: true });
    await input.fill('northwind harbor');
    await expect(scope.locator('[data-id="name"]')).not.toHaveAttribute('data-met', '');
    await expect(scope.locator('[data-id="words"]')).toHaveAttribute('data-met', '');
    await input.fill('violet harbor sunrise');
    await expect(scope.locator('.ui-password-strength-requirement[data-met]')).toHaveCount(3);
  });

  test('reduced motion: no stagger and no tick pop', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDoc(page, PATH);
    const scope = example(page, 0);
    await scope.getByLabel('Create a password', { exact: true }).fill('Tr0ub4dor&3');
    const delays = await scope
      .locator('.ui-password-strength-segment')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el, '::after').transitionDelay));
    for (const d of delays) expect(d).toMatch(/^0s(, 0s)*$/);
    const mark = await scope.locator('.ui-password-strength-mark').first().evaluate((el) => getComputedStyle(el).animationName);
    expect(mark).toBe('none');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    for (const dark of [false, true]) {
      await openDoc(page, PATH, { dark });
      await example(page, 0).getByLabel('Create a password', { exact: true }).fill('Password1');
      await expectNoA11yViolations(page, 'main');
    }
  });

  for (const dark of [false, true]) {
    test(`visual: sign-up, fair (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PATH, { dark });
      await example(page, 0).getByLabel('Create a password', { exact: true }).fill('Tr0ub4dor');
      await page.mouse.click(1, 1);
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`password-strength-sign-up-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
