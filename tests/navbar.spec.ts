import { expect, test, type Locator, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/navbar';
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 900;

/** The indicator box must sit on the active link (long axis only for the underline). */
async function expectIndicatorOn(nav: Locator, link: Locator, underline = false) {
  await expect
    .poll(
      async () => {
        const i = await nav.locator('.ui-navbar-indicator').boundingBox();
        const l = await link.boundingBox();
        if (!i || !l) return 999;
        return Math.abs(i.x - l.x) + Math.abs(i.width - l.width) + (underline ? 0 : Math.abs(i.y - l.y) + Math.abs(i.height - l.height));
      },
      { timeout: 4000 },
    )
    .toBeLessThan(1.5);
}

test.describe('Navbar', () => {
  test('the pill glides to the active link and follows clicks', async ({ page }) => {
    test.skip(!wide(page), 'the links are collapsed into a menu on phones');
    const { errors } = await openDoc(page, PAGE);
    const nav = example(page, 0).locator('.ui-navbar-nav');
    const product = nav.getByRole('link', { name: 'Product' });
    const pricing = nav.getByRole('link', { name: 'Pricing' });
    await expect(nav).toHaveAttribute('data-ready', '');
    await expect(product).toHaveAttribute('aria-current', 'page');
    await expectIndicatorOn(nav, product);

    await pricing.click();
    await expect(pricing).toHaveAttribute('aria-current', 'page');
    await expect(product).not.toHaveAttribute('aria-current', 'page');
    await expectIndicatorOn(nav, pricing);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('the indicator never overshoots while gliding (morph spring stays near the target)', async ({ page }) => {
    test.skip(!wide(page), 'the links are collapsed into a menu on phones');
    await openDoc(page, PAGE);
    const nav = example(page, 0).locator('.ui-navbar-nav');
    await expect(nav).toHaveAttribute('data-animate', '');
    const docs = nav.getByRole('link', { name: 'Docs' });
    await docs.click();
    const xs = await page.evaluate(async () => {
      const el = document.querySelector('[role="tabpanel"] .ui-navbar-indicator') as HTMLElement;
      const out: number[] = [];
      for (let i = 0; i < 40; i++) {
        out.push(el.getBoundingClientRect().x);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
      return out;
    });
    const target = (await docs.boundingBox())!.x;
    expect(Math.max(...xs)).toBeLessThan(target + 12);
    expect(Math.abs(xs[xs.length - 1]! - target)).toBeLessThan(1.5);
  });

  test('the border appears once the content scrolls and the bar stays stuck to the top', async ({ page }) => {
    await openDoc(page, PAGE);
    const frame = example(page, 0).locator('div:has(> header.ui-navbar)').first();
    const navbar = frame.locator(':scope > header.ui-navbar');
    await expect(navbar).not.toHaveAttribute('data-scrolled', '');
    const before = await navbar.evaluate((el) => getComputedStyle(el).borderBottomColor);
    expect(before).toMatch(/rgba?\(.*(, 0\)|\/ 0\))|transparent/);

    await frame.evaluate((el) => {
      el.scrollTop = 160;
    });
    await expect(navbar).toHaveAttribute('data-scrolled', '');
    await settle(page);
    const after = await navbar.evaluate((el) => getComputedStyle(el).borderBottomColor);
    expect(after).not.toBe(before);
    const f = (await frame.boundingBox())!;
    const n = (await navbar.boundingBox())!;
    expect(Math.abs(n.y - (f.y + 1))).toBeLessThan(2.5); // 1px frame border
  });

  test('the underline variant draws a 2px bar on the bottom edge of the active link', async ({ page }) => {
    test.skip(!wide(page), 'the links are collapsed into a menu on phones');
    await openDoc(page, PAGE);
    const nav = example(page, 1).locator('.ui-navbar-nav');
    const link = nav.getByRole('link', { name: 'Deployments' });
    await expect(nav).toHaveAttribute('data-indicator', 'underline');
    await expectIndicatorOn(nav, link, true);
    const bar = (await nav.locator('.ui-navbar-indicator').boundingBox())!;
    const l = (await link.boundingBox())!;
    expect(Math.round(bar.height)).toBe(2);
    expect(Math.abs(bar.y + bar.height - (l.y + l.height))).toBeLessThan(1.5);
    await nav.getByRole('link', { name: 'Logs' }).click();
    await expectIndicatorOn(nav, nav.getByRole('link', { name: 'Logs' }), true);
  });

  test('the floating variant is a rounded pill with a shadow', async ({ page }) => {
    await openDoc(page, PAGE);
    const navbar = example(page, 2).locator('header.ui-navbar');
    await expect(navbar).toHaveAttribute('data-variant', 'floating');
    const style = await navbar.evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: parseFloat(s.borderTopLeftRadius), shadow: s.boxShadow };
    });
    expect(style.radius).toBeGreaterThan(20);
    expect(style.shadow).not.toBe('none');
  });

  test('a narrow navbar collapses into a menu that closes when a link is chosen', async ({ page }) => {
    await openDoc(page, PAGE);
    const preview = example(page, 3);
    await expect(preview.locator('.ui-navbar-nav')).toBeHidden();
    const toggle = preview.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Lumen' });
    await expect(dialog).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.getByRole('link', { name: 'Features' })).toHaveAttribute('aria-current', 'page');
    await dialog.getByRole('link', { name: 'Pricing' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await toggle.click();
    await expect(page.getByRole('dialog', { name: 'Lumen' }).getByRole('link', { name: 'Pricing' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('on a phone the marketing navbar is collapsed too', async ({ page }) => {
    test.skip(wide(page), 'only phones and narrow windows');
    await openDoc(page, PAGE);
    const preview = example(page, 0);
    await expect(preview.getByRole('button', { name: 'Open menu' })).toBeVisible();
    await expect(preview.locator('.ui-navbar-nav')).toBeHidden();
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

  test('the open mobile menu has no serious accessibility violations', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await example(page, 3).getByRole('button', { name: 'Open menu' }).click();
    await settle(page);
    await expectNoA11yViolations(page, 'dialog');
  });
});
