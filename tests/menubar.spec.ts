import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/menubar';

const bar = (page: Page) => page.getByRole('menubar', { name: 'Application' });
const title = (page: Page, name: string) => bar(page).getByRole('menuitem', { name, exact: true });
const menu = (page: Page) => page.getByRole('menu').first();
const item = (page: Page, name: string | RegExp) => page.getByRole('menu').getByRole('menuitem', { name }).first();

test.describe('Menubar', () => {
  test('renders a menubar with one tab stop and menu-button attributes', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    await expect(bar(page)).toBeVisible();
    await expect(title(page, 'File')).toHaveAttribute('aria-haspopup', 'menu');
    await expect(title(page, 'File')).toHaveAttribute('aria-expanded', 'false');
    await expect(title(page, 'File')).toHaveAttribute('tabindex', '0');
    await expect(title(page, 'Edit')).toHaveAttribute('tabindex', '-1');
    await expect(title(page, 'View')).toHaveAttribute('tabindex', '-1');
    expect(errors).toEqual([]);
  });

  test('click opens a menu below its title; clicking again closes it', async ({ page }) => {
    await openDoc(page, PAGE);
    const file = title(page, 'File');
    await file.click();
    await expect(menu(page)).toBeVisible();
    await expect(file).toHaveAttribute('aria-expanded', 'true');
    await settle(page);
    const b = (await file.boundingBox())!;
    const m = (await menu(page).boundingBox())!;
    expect(Math.abs(m.y - (b.y + b.height + 6))).toBeLessThanOrEqual(2);
    expect(Math.abs(m.x - b.x)).toBeLessThanOrEqual(2);
    await file.click();
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('keyboard: arrows move between titles, Down opens on the first item, Esc returns focus', async ({ page }) => {
    await openDoc(page, PAGE);
    await title(page, 'File').focus();
    await page.keyboard.press('ArrowRight');
    await expect(title(page, 'Edit')).toBeFocused();
    await expect(title(page, 'Edit')).toHaveAttribute('tabindex', '0');
    await page.keyboard.press('End');
    await expect(title(page, 'View')).toBeFocused();
    await page.keyboard.press('ArrowRight'); // wraps
    await expect(title(page, 'File')).toBeFocused();
    await page.keyboard.press('ArrowLeft'); // wraps back
    await expect(title(page, 'View')).toBeFocused();
    await page.keyboard.press('Home');
    await expect(title(page, 'File')).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(menu(page)).toBeVisible();
    await expect(item(page, /New file/)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(title(page, 'File')).toBeFocused();
  });

  test('ArrowUp on a title opens on the last item', async ({ page }) => {
    await openDoc(page, PAGE);
    await title(page, 'Edit').focus();
    await page.keyboard.press('ArrowUp');
    await expect(item(page, /Paste/)).toBeFocused();
  });

  test('with a menu open, Right / Left switch to the neighbouring menu', async ({ page }) => {
    await openDoc(page, PAGE);
    await title(page, 'File').focus();
    await page.keyboard.press('ArrowDown');
    await expect(item(page, /New file/)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(title(page, 'Edit')).toHaveAttribute('aria-expanded', 'true');
    await expect(title(page, 'File')).toHaveAttribute('aria-expanded', 'false');
    await expect(item(page, /Undo/)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(item(page, /New file/)).toBeFocused();
    await expect(page.getByRole('menu')).toHaveCount(1);
  });

  test('a submenu consumes Right and Left before the bar does', async ({ page }) => {
    await openDoc(page, PAGE);
    await title(page, 'File').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(item(page, /Open recent/)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'roadmap.md' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(item(page, /Open recent/)).toBeFocused();
    await expect(title(page, 'File')).toHaveAttribute('aria-expanded', 'true');
  });

  test('hovering another title while a menu is open switches to it', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover switching is for pointer devices');
    await openDoc(page, PAGE);
    await title(page, 'File').click();
    await expect(menu(page)).toBeVisible();
    await title(page, 'View').hover();
    await expect(title(page, 'View')).toHaveAttribute('aria-expanded', 'true');
    await expect(title(page, 'File')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('menuitemcheckbox', { name: 'Show sidebar' })).toBeVisible();
  });

  test('hovering a title does nothing while no menu is open', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover switching is for pointer devices');
    await openDoc(page, PAGE);
    await title(page, 'Edit').hover();
    await page.waitForTimeout(250);
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('choosing an item runs it, closes the bar and returns focus to the title', async ({ page }) => {
    await openDoc(page, PAGE);
    await title(page, 'Edit').click();
    await item(page, /Copy/).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText('Copy');
  });

  test('checkbox items keep their state across opens', async ({ page }) => {
    await openDoc(page, PAGE);
    await title(page, 'View').click();
    const status = page.getByRole('menuitemcheckbox', { name: 'Show status bar' });
    await expect(status).toHaveAttribute('aria-checked', 'false');
    await status.click();
    await title(page, 'View').click();
    await expect(page.getByRole('menuitemcheckbox', { name: 'Show status bar' })).toHaveAttribute('aria-checked', 'true');
  });

  test('has no serious accessibility violations while open', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await title(page, 'File').click();
    await settle(page);
    await expectNoA11yViolations(page);
  });
});
