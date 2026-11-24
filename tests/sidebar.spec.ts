import { expect, test, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/sidebar';
const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 900;

const aside = (page: Page) => example(page, 0).getByRole('complementary', { name: 'Workspace' });
const width = async (page: Page) => Math.round((await aside(page).boundingBox())!.width);

test.describe('Sidebar', () => {
  test('is 256px wide, fills the framed container and Ctrl+B collapses it to a 56px rail', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    const { errors } = await openDoc(page, PAGE);
    await settle(page);
    const frame = (await example(page, 0).locator('.ui-sidebar-wrapper').boundingBox())!;
    expect(await width(page)).toBe(256);
    expect(frame.height).toBeLessThanOrEqual(561);
    expect((await aside(page).boundingBox())!.height).toBeGreaterThan(frame.height - 4);

    await page.keyboard.press('Control+b');
    await expect(aside(page)).toHaveAttribute('data-state', 'collapsed');
    await settle(page);
    expect(await width(page)).toBe(56);
    await page.keyboard.press('Control+b');
    await settle(page);
    expect(await width(page)).toBe(256);
    expect(errors).toEqual([]);
  });

  test('the width glides without overshooting', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, PAGE);
    await settle(page);
    await example(page, 0).getByRole('button', { name: 'Toggle sidebar' }).click();
    const widths = await page.evaluate(async () => {
      const el = document.querySelector('[role="tabpanel"] aside.ui-sidebar') as HTMLElement;
      const out: number[] = [];
      for (let i = 0; i < 45; i++) {
        out.push(el.getBoundingClientRect().width);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
      return out;
    });
    expect(Math.min(...widths)).toBeGreaterThanOrEqual(55.5);
    expect(Math.max(...widths)).toBeLessThanOrEqual(256.5);
    expect(Math.round(widths[widths.length - 1]!)).toBe(56);
  });

  test('collapsed: labels are clipped, tooltips show the label and names survive', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, PAGE);
    await page.keyboard.press('Control+b');
    await settle(page);
    const box = (await aside(page).boundingBox())!;
    const dashboard = aside(page).getByRole('button', { name: 'Dashboard' });
    await expect(dashboard).toBeVisible();
    const label = (await dashboard.locator('span').first().boundingBox())!;
    expect(label.x).toBeGreaterThanOrEqual(box.x + box.width - 1); // clipped away
    await dashboard.hover();
    const tip = page.getByRole('tooltip');
    await expect(tip).toBeVisible({ timeout: 3000 });
    await expect(tip).toHaveText('Dashboard');
    const t = (await tip.boundingBox())!;
    expect(t.x).toBeGreaterThanOrEqual(box.x + box.width); // to the right of the rail
  });

  test('keeps focus on a row while collapsing', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, PAGE);
    const inbox = aside(page).getByRole('button', { name: /Inbox/ });
    await inbox.focus();
    await page.keyboard.press('Control+b');
    await expect(aside(page)).toHaveAttribute('data-state', 'collapsed');
    await expect(inbox).toBeFocused();
  });

  test('remembers the collapsed state across a reload without animating on load', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, PAGE);
    await example(page, 0).getByRole('button', { name: 'Toggle sidebar' }).click();
    await expect(aside(page)).toHaveAttribute('data-state', 'collapsed');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await expect(aside(page)).toHaveAttribute('data-state', 'collapsed');
    expect(await width(page)).toBe(56);
    expect(await page.evaluate(() => localStorage.getItem('ui-docs-sidebar'))).toBe('collapsed');
  });

  test('nested items open and close, and closed items leave the tab order', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, PAGE);
    const projects = aside(page).getByRole('button', { name: 'Projects', exact: true });
    const starred = aside(page).getByRole('button', { name: 'Starred' });
    await expect(projects).toHaveAttribute('aria-expanded', 'true');
    await expect(starred).toBeVisible();
    await projects.click();
    await expect(projects).toHaveAttribute('aria-expanded', 'false');
    await expect(starred).toBeHidden();
    await projects.click();
    await expect(starred).toBeVisible();
    await starred.click();
    await expect(starred).toHaveAttribute('aria-current', 'page');
    await expect(example(page, 0).getByRole('heading', { name: 'Starred' })).toBeVisible();
  });

  test('on the rail, a group trigger expands the sidebar and opens its items', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, PAGE);
    await aside(page).getByRole('button', { name: 'Projects', exact: true }).click(); // close the group
    await page.keyboard.press('Control+b');
    await settle(page);
    await aside(page).getByRole('button', { name: 'Projects', exact: true }).click();
    await expect(aside(page)).toHaveAttribute('data-state', 'expanded');
    await expect(aside(page).getByRole('button', { name: 'Projects', exact: true })).toHaveAttribute('aria-expanded', 'true');
  });

  test('choosing a row marks it current and updates the page title', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, PAGE);
    await aside(page).getByRole('button', { name: 'Analytics' }).click();
    await expect(aside(page).locator('[aria-current="page"]')).toHaveCount(1);
    await expect(aside(page).getByRole('button', { name: 'Analytics' })).toHaveAttribute('aria-current', 'page');
    await expect(example(page, 0).getByRole('heading', { name: 'Analytics' })).toBeVisible();
  });

  test('on a phone the sidebar is a sheet that closes when a row is chosen', async ({ page }) => {
    test.skip(desktop(page), 'desktop shows the sidebar inline');
    await openDoc(page, PAGE);
    await expect(aside(page)).toHaveCount(0);
    await example(page, 0).getByRole('button', { name: 'Toggle sidebar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Workspace' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Analytics' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Analytics' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('off-canvas: collapsing hides the sidebar completely', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, PAGE);
    const preview = example(page, 1);
    const side = preview.getByRole('complementary', { name: 'Documentation' });
    await expect(side).toBeVisible();
    await preview.getByRole('button', { name: 'Toggle sidebar' }).click();
    await settle(page);
    expect(Math.round((await side.boundingBox())?.width ?? 0)).toBe(0);
    await expect(preview.getByRole('button', { name: 'Guides' })).toBeHidden();
    await preview.getByRole('button', { name: 'Toggle sidebar' }).click();
    await settle(page);
    await expect(preview.getByRole('button', { name: 'Guides' })).toBeVisible();
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expectNoA11yViolations(page, 'main');
    });
  }

  test('collapsed rail has no serious accessibility violations', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    test.slow();
    await openDoc(page, PAGE);
    await page.keyboard.press('Control+b');
    await settle(page);
    await expectNoA11yViolations(page, 'main');
  });
});
