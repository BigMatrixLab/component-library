import { expect, test, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/navigation-menu';
const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 900;

const menu = (page: Page) => example(page, 0).getByRole('navigation', { name: 'Site' });
const panel = (page: Page) => page.locator('.ui-nav-menu-panel');
const openPanel = (page: Page) => page.locator('.ui-nav-menu-panel[data-state="open"]');

test.describe('Navigation menu', () => {
  test('hover opens one shared panel after a short delay and leaving closes it', async ({ page }) => {
    test.skip(!desktop(page), 'hover needs a mouse and a wide viewport');
    const { errors } = await openDoc(page, PAGE);
    const products = menu(page).getByRole('button', { name: 'Products' });
    await expect(panel(page)).toHaveCount(0);
    await products.hover();
    await expect(openPanel(page)).toBeVisible();
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    await expect(openPanel(page).getByRole('link', { name: /Analytics/ })).toBeVisible();

    await page.mouse.move(4, 4);
    await expect(panel(page)).toHaveCount(0, { timeout: 4000 });
    await expect(products).toHaveAttribute('aria-expanded', 'false');
    expect(errors).toEqual([]);
  });

  test('moving between triggers keeps ONE panel that resizes, with the caret under the active trigger', async ({ page }) => {
    test.skip(!desktop(page), 'hover needs a mouse and a wide viewport');
    await openDoc(page, PAGE);
    const products = menu(page).getByRole('button', { name: 'Products' });
    const resources = menu(page).getByRole('button', { name: 'Resources' });
    await products.hover();
    await expect(openPanel(page)).toBeVisible();
    await settle(page);
    const wideBox = (await panel(page).locator('.ui-nav-menu-surface').boundingBox())!;

    await resources.hover();
    await expect(resources).toHaveAttribute('aria-expanded', 'true');
    await expect(panel(page)).toHaveCount(1);
    await settle(page);
    await expect(openPanel(page).getByRole('link', { name: /Documentation/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Analytics/ })).toHaveCount(0);

    // after the glide the surface hugs the new content, narrower than before
    const surface = (await panel(page).locator('.ui-nav-menu-surface').boundingBox())!;
    const slot = (await panel(page).locator('.ui-nav-menu-slot').boundingBox())!;
    expect(surface.width).toBeLessThan(wideBox.width - 100);
    expect(Math.abs(surface.width - slot.width - 2)).toBeLessThan(1.5);
    expect(Math.abs(surface.height - slot.height - 2)).toBeLessThan(1.5);

    // the caret sits under the Resources trigger and inside the panel
    const caret = (await panel(page).locator('.ui-nav-menu-caret').boundingBox())!;
    const trigger = (await resources.boundingBox())!;
    const caretX = caret.x + caret.width / 2;
    expect(Math.abs(caretX - (trigger.x + trigger.width / 2))).toBeLessThan(2.5);
    expect(caretX).toBeGreaterThan(surface.x);
    expect(caretX).toBeLessThan(surface.x + surface.width);
  });

  test('the glide has no overshoot in size (smooth spring)', async ({ page }) => {
    test.skip(!desktop(page), 'hover needs a mouse and a wide viewport');
    await openDoc(page, PAGE);
    await menu(page).getByRole('button', { name: 'Products' }).hover();
    await expect(openPanel(page)).toBeVisible();
    await settle(page);
    const from = (await panel(page).locator('.ui-nav-menu-surface').boundingBox())!;
    await menu(page).getByRole('button', { name: 'Resources' }).hover();
    const widths = await page.evaluate(async () => {
      const el = document.querySelector('.ui-nav-menu-surface') as HTMLElement;
      const out: number[] = [];
      for (let i = 0; i < 45; i++) {
        out.push(el.getBoundingClientRect().width);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
      return out;
    });
    const end = widths[widths.length - 1]!;
    expect(Math.max(...widths)).toBeLessThanOrEqual(from.width + 1);
    expect(Math.min(...widths)).toBeGreaterThanOrEqual(end - 1);
  });

  test('click toggles a panel; a click right after hover keeps it open', async ({ page }) => {
    test.skip(!desktop(page), 'hover needs a mouse and a wide viewport');
    await openDoc(page, PAGE);
    const products = menu(page).getByRole('button', { name: 'Products' });
    await products.hover();
    await expect(openPanel(page)).toBeVisible();
    await products.click(); // hover-opened: stays open
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    await products.click(); // now closes
    await expect(products).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard: Down opens and enters, arrows move, Esc returns to the trigger', async ({ page }) => {
    await openDoc(page, PAGE);
    test.skip(!desktop(page), 'the accordion has its own keyboard test');
    const products = menu(page).getByRole('button', { name: 'Products' });
    const resources = menu(page).getByRole('button', { name: 'Resources' });
    await products.focus();
    await page.keyboard.press('ArrowDown');
    const links = openPanel(page).getByRole('link');
    await expect(links.first()).toBeFocused();
    await expect(links.first()).toContainText('Analytics');
    await page.keyboard.press('ArrowDown');
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp'); // from the first link back to the trigger
    await expect(products).toBeFocused();
    await expect(products).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('ArrowRight'); // switches the open panel along the bar
    await expect(resources).toBeFocused();
    await expect(resources).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('ArrowDown');
    await expect(openPanel(page).getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(resources).toBeFocused();
    await expect(panel(page)).toHaveCount(0);
  });

  test('keyboard: Enter toggles without moving focus, Tab enters the panel, leaving the menu closes it', async ({ page }) => {
    test.skip(!desktop(page), 'keyboard flow on desktop');
    await openDoc(page, PAGE);
    const products = menu(page).getByRole('button', { name: 'Products' });
    await products.focus();
    await page.keyboard.press('Enter');
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    await expect(products).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(openPanel(page).getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(products).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    // focus moves out of the menu entirely
    await example(page, 1).getByRole('button', { name: 'Products' }).focus();
    await expect(products).toHaveAttribute('aria-expanded', 'false');
  });

  test('hovering a plain link lets the panel go', async ({ page }) => {
    test.skip(!desktop(page), 'hover needs a mouse and a wide viewport');
    await openDoc(page, PAGE);
    await menu(page).getByRole('button', { name: 'Products' }).hover();
    await expect(openPanel(page)).toBeVisible();
    await menu(page).getByRole('link', { name: 'Pricing' }).hover();
    await expect(panel(page)).toHaveCount(0, { timeout: 4000 });
  });

  test('the panel is in the top layer and never clipped by the preview', async ({ page }) => {
    test.skip(!desktop(page), 'hover needs a mouse and a wide viewport');
    await openDoc(page, PAGE);
    await menu(page).getByRole('button', { name: 'Products' }).hover();
    await expect(openPanel(page)).toBeVisible();
    expect(await openPanel(page).evaluate((el) => el.matches(':popover-open'))).toBe(true);
    const box = (await openPanel(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test('accordion: one item open at a time, closed content leaves the tab order', async ({ page }) => {
    await openDoc(page, PAGE);
    const preview = example(page, 1);
    const products = preview.getByRole('button', { name: 'Products' });
    const resources = preview.getByRole('button', { name: 'Resources' });
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    await expect(preview.getByRole('link', { name: /Analytics/ })).toBeVisible();
    await expect(preview.getByRole('link', { name: /Documentation/ })).toBeHidden();

    await resources.click();
    await expect(resources).toHaveAttribute('aria-expanded', 'true');
    await expect(products).toHaveAttribute('aria-expanded', 'false');
    await settle(page);
    await expect(preview.getByRole('link', { name: /Documentation/ })).toBeVisible();
    await expect(preview.getByRole('link', { name: /Analytics/ })).toBeHidden();

    await resources.click();
    await expect(resources).toHaveAttribute('aria-expanded', 'false');
    await settle(page);
    await expect(preview.getByRole('link', { name: /Documentation/ })).toBeHidden();
  });

  test('accordion: arrow keys move between triggers and links', async ({ page }) => {
    await openDoc(page, PAGE);
    const preview = example(page, 1);
    await preview.getByRole('button', { name: 'Products' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(preview.getByRole('button', { name: 'Resources' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(preview.getByRole('link', { name: 'Pricing' })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(preview.getByRole('button', { name: 'Products' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(preview.getByRole('button', { name: 'Products' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('on a phone the menu is an accordion that fits the screen', async ({ page }) => {
    test.skip(desktop(page), 'phones and narrow windows only');
    await openDoc(page, PAGE);
    await expect(menu(page)).toHaveAttribute('data-mode', 'accordion');
    await menu(page).getByRole('button', { name: 'Products' }).click();
    await expect(menu(page).getByRole('link', { name: /Analytics/ })).toBeVisible();
    await expect(panel(page)).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expectNoA11yViolations(page, 'main');
    });
  }

  test('the open panel has no serious accessibility violations', async ({ page }) => {
    test.skip(!desktop(page), 'hover needs a mouse and a wide viewport');
    test.slow();
    await openDoc(page, PAGE);
    await menu(page).getByRole('button', { name: 'Products' }).click();
    await settle(page);
    await expectNoA11yViolations(page, '.ui-nav-menu-panel');
  });
});
