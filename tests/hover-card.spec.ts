import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/hover-card';

const trigger = (page: Page) => page.getByRole('link', { name: '@adalovelace' });
const card = (page: Page) => page.locator('.ui-hover-card');

test.describe('Hover card', () => {
  test('opens only after the hover delay and closes after leaving', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover is for pointer devices');
    const { errors } = await openDoc(page, PAGE);
    await trigger(page).hover();
    await page.waitForTimeout(350);
    await expect(card(page)).toHaveCount(0); // before 700ms
    await expect(card(page)).toBeVisible({ timeout: 1500 });
    await expect(card(page)).toHaveAttribute('data-state', 'open');
    await expect(card(page)).toContainText('Ada Lovelace');
    await settle(page);

    // below the trigger, 8px away
    const t = (await trigger(page).boundingBox())!;
    const c = (await card(page).boundingBox())!;
    expect(Math.abs(c.y - (t.y + t.height + 8))).toBeLessThanOrEqual(3);

    await page.mouse.move(2, 2);
    await page.waitForTimeout(100);
    await expect(card(page)).toHaveCount(1); // still inside the 300ms grace
    await expect(card(page)).toHaveCount(0, { timeout: 2000 });
    expect(errors).toEqual([]);
  });

  test('stays open while the pointer travels onto the card', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover is for pointer devices');
    await openDoc(page, PAGE);
    await trigger(page).hover();
    await expect(card(page)).toBeVisible({ timeout: 1500 });
    const c = (await card(page).boundingBox())!;
    await page.mouse.move(c.x + c.width / 2, c.y + 30, { steps: 8 });
    await page.waitForTimeout(600);
    await expect(card(page)).toBeVisible();
    await page.mouse.move(2, 2);
    await expect(card(page)).toHaveCount(0, { timeout: 2000 });
  });

  test('keyboard focus opens it straight away; Esc closes it', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.keyboard.press('Tab');
    // walk the page's tab order to the link
    for (let i = 0; i < 40 && !(await trigger(page).evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab');
    }
    await expect(trigger(page)).toBeFocused();
    await expect(card(page)).toBeVisible({ timeout: 400 });
    await page.keyboard.press('Escape');
    await expect(card(page)).toHaveCount(0);
  });

  test('Tab moves from the link into the card and leaving closes it', async ({ page }) => {
    await openDoc(page, PAGE);
    for (let i = 0; i < 40 && !(await trigger(page).evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab');
    }
    await expect(card(page)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(card(page).getByRole('button', { name: 'Follow' })).toBeFocused();
    await expect(card(page)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(card(page)).toHaveCount(0, { timeout: 2000 });
  });

  test('a touch pointer never opens it', async ({ page }) => {
    await openDoc(page, PAGE);
    await trigger(page).dispatchEvent('pointerenter', { pointerType: 'touch', pointerId: 5, isPrimary: true });
    await page.waitForTimeout(1000);
    await expect(card(page)).toHaveCount(0);
  });

  test('has no serious accessibility violations while open', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await trigger(page).focus();
    await expect(card(page)).toBeVisible();
    await settle(page);
    await expectNoA11yViolations(page);
  });
});
