import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/context-menu';

const row = (page: Page, name: string) => page.locator('.ui-context-menu-trigger', { hasText: name });
const menu = (page: Page) => page.getByRole('menu').first();
const item = (page: Page, name: string | RegExp) => page.getByRole('menuitem', { name }).first();
const REPORT = 'Quarterly report.pdf';

test.describe('Context menu', () => {
  test('right-click opens the menu at the pointer', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const target = row(page, REPORT);
    const box = (await target.boundingBox())!;
    await target.click({ button: 'right', position: { x: 60, y: 14 } });
    await expect(menu(page)).toBeVisible();
    await expect(menu(page)).toHaveAttribute('data-state', 'open');
    await settle(page);

    const m = (await menu(page).boundingBox())!;
    expect(Math.abs(m.x - (box.x + 60))).toBeLessThanOrEqual(3);
    expect(Math.abs(m.y - (box.y + 14 + 2))).toBeLessThanOrEqual(3);
    // opened with the pointer: focus is on the menu, nothing highlighted yet
    await expect(menu(page)).toBeFocused();
    await expect(item(page, /Open/)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('a second right-click moves the menu and only one is open', async ({ page }) => {
    await openDoc(page, PAGE);
    await row(page, REPORT).click({ button: 'right', position: { x: 40, y: 10 } });
    await expect(menu(page)).toBeVisible();
    await row(page, 'Invoice 0042.pdf').click({ button: 'right', position: { x: 80, y: 10 } });
    await expect(page.getByRole('menu')).toHaveCount(1);
    await expect(menu(page)).toBeVisible();
  });

  test('keyboard: Shift+F10 opens on the first item, arrows move, Esc returns focus to the row', async ({ page }) => {
    await openDoc(page, PAGE);
    const target = row(page, REPORT);
    await target.focus();
    await page.keyboard.press('Shift+F10');
    await expect(menu(page)).toBeVisible();
    await expect(item(page, /Open/)).toBeFocused();
    await expect(item(page, /Open/)).toHaveAttribute('data-highlighted', '');

    await page.keyboard.press('ArrowDown');
    await expect(item(page, /Rename/)).toBeFocused();
    await page.keyboard.press('End');
    await expect(item(page, /Move to trash/)).toBeFocused();
    await page.keyboard.press('ArrowDown'); // wraps
    await expect(item(page, /Open/)).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(target).toBeFocused();
  });

  test('choosing an item runs it and closes the menu', async ({ page }) => {
    await openDoc(page, PAGE);
    await row(page, REPORT).click({ button: 'right' });
    await item(page, /Duplicate/).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText(`Duplicated ${REPORT}`);
  });

  test('submenu opens with ArrowRight and closes with ArrowLeft', async ({ page }) => {
    await openDoc(page, PAGE);
    await row(page, REPORT).focus();
    await page.keyboard.press('ContextMenu');
    await expect(menu(page)).toBeVisible();
    await item(page, /Share/).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'Copy link' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('menuitem', { name: 'Copy link' })).toHaveCount(0);
    await expect(item(page, /Share/)).toBeFocused();
  });

  test('a click outside closes it', async ({ page }) => {
    await openDoc(page, PAGE);
    await row(page, REPORT).click({ button: 'right' });
    await expect(menu(page)).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('long press with touch opens it after 500ms and not before', async ({ page }) => {
    await openDoc(page, PAGE);
    const target = row(page, REPORT);
    const box = (await target.boundingBox())!;
    const init = { pointerType: 'touch', pointerId: 7, isPrimary: true, clientX: box.x + 50, clientY: box.y + 12, bubbles: true };
    await target.dispatchEvent('pointerdown', init);
    await page.waitForTimeout(250);
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(menu(page)).toBeVisible({ timeout: 1500 });
    await target.dispatchEvent('pointerup', init);
    await expect(menu(page)).toBeVisible();
  });

  test('moving the finger cancels the long press', async ({ page }) => {
    await openDoc(page, PAGE);
    const target = row(page, REPORT);
    const box = (await target.boundingBox())!;
    const x = box.x + 50;
    const y = box.y + 12;
    const init = { pointerType: 'touch', pointerId: 8, isPrimary: true, bubbles: true };
    await target.dispatchEvent('pointerdown', { ...init, clientX: x, clientY: y });
    await target.dispatchEvent('pointermove', { ...init, clientX: x + 40, clientY: y });
    await page.waitForTimeout(800);
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('has no serious accessibility violations while open', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await row(page, REPORT).click({ button: 'right' });
    await settle(page);
    await expectNoA11yViolations(page);
  });
});
