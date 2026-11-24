import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

test.describe('Inline edit', () => {
  test('the text does not move when editing starts', async ({ page }) => {
    const { errors } = await openDoc(page, '/docs/components/inline-edit');
    const root = example(page, 0).locator('.ui-inline-edit');
    const display = root.locator('.ui-inline-edit-display');
    const before = await display.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { x: r.left, y: r.top, fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontFamily: cs.fontFamily };
    });

    await display.click();
    const input = root.locator('input');
    await expect(input).toBeFocused();
    const after = await input.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLInputElement);
      const r = el.getBoundingClientRect();
      return {
        x: r.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth),
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        fontFamily: cs.fontFamily,
      };
    });
    expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
    expect(after.fontSize).toBe(before.fontSize);
    expect(after.lineHeight).toBe(before.lineHeight);
    expect(after.fontFamily).toBe(before.fontFamily);
    expect(errors).toEqual([]);
  });

  test('Enter saves, Esc cancels', async ({ page }) => {
    await openDoc(page, '/docs/components/inline-edit');
    const root = example(page, 0).locator('.ui-inline-edit');
    await root.getByRole('button').click();
    await page.keyboard.type('Launch plan v2');
    await page.keyboard.press('Enter');
    await expect(root).toHaveAttribute('data-pending', '');
    await expect(root.getByRole('button', { name: /Launch plan v2/ })).toBeVisible({ timeout: 4000 });
    await expect(root.getByRole('button')).toBeFocused();

    await root.getByRole('button').click();
    await page.keyboard.type('Discarded');
    await page.keyboard.press('Escape');
    await expect(root.getByRole('button', { name: /Launch plan v2/ })).toBeVisible();
    await expect(root.getByRole('button')).toBeFocused();
  });

  test('blur saves', async ({ page }) => {
    await openDoc(page, '/docs/components/inline-edit');
    const root = example(page, 1).locator('.ui-inline-edit').first();
    await root.getByRole('button').click();
    await page.keyboard.type('Priya Nair');
    await page.locator('main h1').first().click();
    await expect(root.getByRole('button', { name: /Priya Nair/ })).toBeVisible();
  });

  test('validation blocks saving and shows an error', async ({ page }) => {
    await openDoc(page, '/docs/components/inline-edit');
    const root = example(page, 0).locator('.ui-inline-edit');
    await root.getByRole('button').click();
    await page.keyboard.type('ab');
    await page.keyboard.press('Enter');
    const input = root.locator('input');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(root.getByRole('alert')).toHaveText('Use at least 3 characters');
    await expect(input).toBeFocused();
  });

  test('a rejected save keeps the field open with the message', async ({ page }) => {
    await openDoc(page, '/docs/components/inline-edit');
    const root = example(page, 0).locator('.ui-inline-edit');
    await root.getByRole('button').click();
    await page.keyboard.type('Untitled');
    await page.keyboard.press('Enter');
    await expect(root.getByRole('alert')).toHaveText('That name is reserved', { timeout: 4000 });
    await expect(root.locator('input')).toHaveAttribute('aria-invalid', 'true');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, '/docs/components/inline-edit');
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, '/docs/components/inline-edit', { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: view mode (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, '/docs/components/inline-edit', { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`inline-edit-view-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
