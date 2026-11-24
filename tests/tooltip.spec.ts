import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/tooltip';

const tip = (page: Page, name?: string) => page.getByRole('tooltip').filter(name ? { hasText: name } : {});
const trigger = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).first();

test.describe('Tooltip', () => {
  test('opens on hover after the delay, sits above the trigger, closes on Esc', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const button = trigger(page, 'Copy link');
    const t0 = Date.now();
    await button.hover();
    await page.waitForTimeout(300);
    await expect(tip(page)).toHaveCount(0); // not before the 700ms delay
    await expect(tip(page, 'Copy link')).toBeVisible({ timeout: 3000 });
    expect(Date.now() - t0).toBeGreaterThan(500);
    await expect(button).toHaveAttribute('aria-describedby', /.+/);
    await settle(page);

    const b = (await button.boundingBox())!;
    const t = (await tip(page, 'Copy link').boundingBox())!;
    expect(Math.abs(t.y + t.height + 6 - b.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(t.x + t.width / 2 - (b.x + b.width / 2))).toBeLessThanOrEqual(2);

    await page.keyboard.press('Escape');
    await expect(tip(page)).toHaveCount(0);
    await expect(button).not.toHaveAttribute('aria-describedby', /.+/);
    expect(errors).toEqual([]);
  });

  test('opens on keyboard focus at once, but not on a pointer click', async ({ page }) => {
    await openDoc(page, PAGE);
    const button = trigger(page, 'Download');
    await button.click();
    await page.waitForTimeout(200);
    await expect(tip(page)).toHaveCount(0);
    await page.mouse.move(5, 5);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    // Focus is now on a toolbar button reached with the keyboard
    await expect(page.locator('[role="tooltip"][data-state="open"]')).toBeVisible({ timeout: 1000 });
    await page.keyboard.press('Escape');
    await expect(tip(page)).toHaveCount(0);
  });

  test('moving between buttons skips the delay', async ({ page }) => {
    await openDoc(page, PAGE);
    await trigger(page, 'Copy link').hover();
    await expect(tip(page, 'Copy link')).toBeVisible({ timeout: 3000 });
    await trigger(page, 'Download').hover();
    // far less than the 700ms delay
    await expect(tip(page, 'Download')).toBeVisible({ timeout: 400 });
    await expect(tip(page)).toHaveCount(1, { timeout: 1000 });
  });

  test('flips below the trigger when there is no room above', async ({ page }) => {
    await openDoc(page, PAGE);
    const button = trigger(page, 'Copy link');
    // Pad the page so the trigger can be scrolled to the top edge
    await button.evaluate(async (el) => {
      document.body.style.paddingBottom = '3000px';
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 6, behavior: 'instant' });
    });
    await button.evaluate((el) => el.focus({ preventScroll: true })); // Playwright's hover/focus would scroll it back
    await expect(tip(page, 'Copy link')).toBeVisible({ timeout: 3000 });
    await settle(page);
    const b = (await button.boundingBox())!;
    const t = (await tip(page, 'Copy link').boundingBox())!;
    expect(t.y).toBeGreaterThanOrEqual(b.y + b.height);
  });

  test('shows the shortcut and has no serious accessibility violations', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await trigger(page, 'Rename').hover();
    await expect(tip(page, 'Rename')).toBeVisible({ timeout: 3000 });
    await expect(tip(page, 'Rename').locator('kbd')).toHaveText('F2');
    await settle(page);
    await expectNoA11yViolations(page, '[role="tooltip"]');
  });

  test('has no serious accessibility violations in dark mode', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE, { dark: true });
    await trigger(page, 'Rename').hover();
    await expect(tip(page, 'Rename')).toBeVisible({ timeout: 3000 });
    await settle(page);
    await expectNoA11yViolations(page, '[role="tooltip"]');
  });
});
