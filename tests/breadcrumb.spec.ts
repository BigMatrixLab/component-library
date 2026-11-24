import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/breadcrumb';

test.describe('Breadcrumb', () => {
  test('marks the current page and keeps the separators out of the accessibility tree', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const nav = example(page, 0).getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Atlas redesign');
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/docs');
    const separators = nav.locator('li.ui-breadcrumb-separator');
    await expect(separators).toHaveCount(2);
    await expect(separators.first()).toHaveAttribute('aria-hidden', 'true');
    await expect(nav.locator('.ui-breadcrumb-chevron').first()).toBeVisible();
    await expect(nav.locator('.ui-breadcrumb-slash').first()).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('the slash separator replaces the chevron', async ({ page }) => {
    await openDoc(page, PAGE);
    const nav = example(page, 1).getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav).toHaveAttribute('data-separator', 'slash');
    await expect(nav.locator('.ui-breadcrumb-slash').first()).toBeVisible();
    await expect(nav.locator('.ui-breadcrumb-chevron').first()).toBeHidden();
  });

  test('the collapsed middle opens a menu with the hidden levels and returns focus', async ({ page }) => {
    await openDoc(page, PAGE);
    const nav = example(page, 2).getByRole('navigation', { name: 'Breadcrumb' });
    const more = nav.getByRole('button', { name: 'Show hidden pages' });
    await more.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem')).toHaveCount(3);
    await expect(menu.getByRole('menuitem', { name: 'Acme Inc' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(more).toBeFocused();
  });

  test('long trails never overflow the page', async ({ page }) => {
    await openDoc(page, PAGE);
    await settle(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('links are focusable and show a focus ring from the keyboard', async ({ page }) => {
    await openDoc(page, PAGE);
    const link = example(page, 0).getByRole('link', { name: 'Home' });
    await link.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    const shadow = await link.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expectNoA11yViolations(page, 'main');
    });
  }
});
