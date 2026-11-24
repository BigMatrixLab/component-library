import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/dropdown-menu';

const account = (page: Page) => page.getByRole('button', { name: 'Ada Lovelace' });
const menu = (page: Page) => page.getByRole('menu').first();
const item = (page: Page, name: string | RegExp) => page.getByRole('menuitem', { name }).first();
const activeText = (page: Page) => page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');

test.describe('Dropdown menu', () => {
  test('opens below the trigger with the menu pattern attributes', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const trigger = account(page);
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(menu(page)).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await settle(page);

    const b = (await trigger.boundingBox())!;
    const m = (await menu(page).boundingBox())!;
    expect(Math.abs(m.y - (b.y + b.height + 6))).toBeLessThanOrEqual(2);
    expect(Math.abs(m.x - b.x)).toBeLessThanOrEqual(2);
    const h = (await item(page, /Profile/).boundingBox())!;
    expect(Math.round(h.height)).toBe(32);
    // opened with the pointer: focus is on the menu, nothing highlighted yet
    await expect(menu(page)).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('keyboard: opens on the first item, arrows / Home / End / typeahead, Enter selects and returns focus', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = account(page);
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(menu(page)).toBeVisible();
    await expect(item(page, /Profile/)).toBeFocused();
    await expect(item(page, /Profile/)).toHaveAttribute('data-highlighted', '');

    await page.keyboard.press('ArrowDown');
    await expect(item(page, /Billing/)).toBeFocused();
    await page.keyboard.press('End');
    await expect(item(page, /Log out/)).toBeFocused();
    await page.keyboard.press('ArrowDown'); // wraps
    await expect(item(page, /Profile/)).toBeFocused();
    await page.keyboard.press('ArrowUp'); // wraps back
    await expect(item(page, /Log out/)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(item(page, /Profile/)).toBeFocused();
    await page.keyboard.press('s');
    await expect.poll(() => activeText(page)).toMatch(/^Settings/);

    await page.keyboard.press('Enter');
    await expect(menu(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('ArrowUp on the trigger opens on the last item; Esc closes and returns focus', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = account(page);
    await trigger.focus();
    await page.keyboard.press('ArrowUp');
    await expect(item(page, /Log out/)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('Tab closes the menu; an outside click closes it without taking focus', async ({ page }) => {
    await openDoc(page, PAGE);
    await account(page).focus();
    await page.keyboard.press('Enter');
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(menu(page)).toHaveCount(0);
    await account(page).click();
    await expect(menu(page)).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(menu(page)).toHaveCount(0);
    await expect(account(page)).not.toBeFocused();
  });

  test('highlight follows the pointer', async ({ page }) => {
    await openDoc(page, PAGE);
    await account(page).click();
    await expect(menu(page)).toBeVisible();
    await item(page, /Billing/).hover();
    await expect(item(page, /Billing/)).toHaveAttribute('data-highlighted', '');
    await item(page, /Settings/).hover();
    await expect(item(page, /Settings/)).toHaveAttribute('data-highlighted', '');
    await expect(item(page, /Billing/)).not.toHaveAttribute('data-highlighted', '');
  });

  test('submenu: hover opens it to the right; ArrowLeft closes only the submenu; choosing closes everything', async ({ page }) => {
    await openDoc(page, PAGE);
    await account(page).click();
    const sub = item(page, /Invite teammates/);
    await sub.hover();
    const subMenu = page.getByRole('menu').nth(1);
    await expect(subMenu).toBeVisible();
    await expect(sub).toHaveAttribute('aria-expanded', 'true');
    await settle(page);
    const s = (await sub.boundingBox())!;
    const m = (await subMenu.boundingBox())!;
    expect(m.x).toBeGreaterThanOrEqual(s.x + s.width - 6);
    expect(Math.abs(m.y - s.y)).toBeLessThanOrEqual(8);

    // into the submenu by pointer, then back by keyboard
    await item(page, 'By email').hover();
    await expect(item(page, 'By email')).toHaveAttribute('data-highlighted', '');
    await page.mouse.move(5, 5); // park the pointer away (WebKit fires a fake move when a panel unmounts under it)
    await page.mouse.move(5, 5); // park the pointer away (WebKit fires a fake move when a panel unmounts under it)
    await page.keyboard.press('ArrowLeft');
    await expect(subMenu).toHaveCount(0);
    await expect(menu(page)).toBeVisible();
    await expect(sub).toBeFocused();

    // keyboard: ArrowRight opens and focuses the first item
    await page.keyboard.press('ArrowRight');
    await expect(item(page, 'By email')).toBeFocused();
    await page.keyboard.press('Escape'); // closes just the submenu
    await expect(menu(page)).toBeVisible();
    await expect(sub).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(account(page)).toBeFocused();
  });

  test('checkbox and radio items update and keep the menu open when they prevent the default', async ({ page }) => {
    await openDoc(page, PAGE);
    await account(page).click();
    const notifications = page.getByRole('menuitemcheckbox', { name: 'Email notifications' });
    await expect(notifications).toHaveAttribute('aria-checked', 'true');
    await notifications.click();
    await expect(notifications).toHaveAttribute('aria-checked', 'false');
    await expect(menu(page)).toBeVisible();

    const dark = page.getByRole('menuitemradio', { name: 'Dark' });
    await expect(page.getByRole('menuitemradio', { name: 'System' })).toHaveAttribute('aria-checked', 'true');
    await dark.click();
    await expect(dark).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('menuitemradio', { name: 'System' })).toHaveAttribute('aria-checked', 'false');
    await expect(menu(page)).toBeVisible();
  });

  test('disabled items are skipped by the arrow keys and cannot be chosen', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = page.getByRole('button', { name: /Actions for Q3 roadmap/ });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(item(page, 'Rename')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(item(page, 'Duplicate')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(item(page, 'Move to trash')).toBeFocused(); // Download is disabled
    await expect(item(page, 'Download')).toHaveAttribute('aria-disabled', 'true');
  });

  test('flips above the trigger near the bottom edge and a menu item click closes the menu', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = page.getByRole('button', { name: /Actions for Q3 roadmap/ });
    await page.evaluate(() => window.scrollTo(0, 0));
    const edge = (await trigger.boundingBox())!;
    await page.setViewportSize({ width: page.viewportSize()!.width, height: Math.round(edge.y + edge.height + 10) });
    await trigger.click();
    await expect(menu(page)).toBeVisible();
    await settle(page);
    const b = (await trigger.boundingBox())!;
    const m = (await menu(page).boundingBox())!;
    expect(m.y + m.height).toBeLessThanOrEqual(b.y + 1);
    await expect(menu(page)).toHaveAttribute('data-side', 'top');
    await item(page, 'Rename').click();
    await expect(menu(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations with the menu and submenu open (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await account(page).click();
      await expect(menu(page)).toBeVisible();
      await item(page, /Invite teammates/).hover();
      await expect(page.getByRole('menu').nth(1)).toBeVisible();
      await settle(page);
      await expectNoA11yViolations(page, '[role="menu"]');
    });
  }
});
