import { expect, test, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const DASHBOARD = '/docs/blocks/dashboard';
const SHELL = '/docs/blocks/app-shell';
const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 900;

/** Horizontal overflow of the page and of every example preview, in px (0 = none). */
async function overflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const previews = [...document.querySelectorAll<HTMLElement>('[data-example]')].map((el) => ({
      file: el.dataset.example,
      over: el.scrollWidth - el.clientWidth,
    }));
    return { page: root.scrollWidth - root.clientWidth, previews: previews.filter((p) => p.over > 1) };
  });
}

test.describe('Dashboard block', () => {
  test('renders the three variants without errors', async ({ page }) => {
    const { errors } = await openDoc(page, DASHBOARD);
    await settle(page);
    await expect(page.locator('[data-example^="blocks/dashboard/"]')).toHaveCount(3);
    await expect(example(page, 0).getByRole('group', { name: 'Key metrics' })).toBeVisible();
    await expect(example(page, 0).getByRole('table', { name: /Recent orders/ })).toBeVisible();
    await expect(example(page, 1).getByText('Quota attainment')).toBeVisible();
    await expect(example(page, 2).getByText('Error budget')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the date range updates the KPIs', async ({ page }) => {
    await openDoc(page, DASHBOARD);
    const revenue = example(page, 0).locator('.ui-stat-value').first();
    const before = await revenue.textContent();
    await example(page, 0).getByRole('radio', { name: '7 days' }).click();
    await expect(example(page, 0).getByRole('radio', { name: '7 days' })).toHaveAttribute('aria-checked', 'true');
    await expect(revenue).not.toHaveText(before ?? '');
  });

  test('the region switch rescales the sales figures', async ({ page }) => {
    await openDoc(page, DASHBOARD);
    const closed = example(page, 1).locator('.ui-stat-value').first();
    const before = await closed.textContent();
    await example(page, 1).getByRole('radio', { name: 'EMEA' }).click();
    await expect(closed).not.toHaveText(before ?? '');
  });

  test('nothing overflows horizontally at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openDoc(page, DASHBOARD);
    await settle(page);
    expect(await overflow(page)).toEqual({ page: 0, previews: [] });
  });

  for (const dark of [false, true]) {
    test(`axe passes (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, DASHBOARD, { dark });
      await settle(page);
      for (const file of ['analytics', 'sales', 'compact']) {
        await expectNoA11yViolations(page, `[data-example="blocks/dashboard/${file}"]`);
      }
    });
  }
});

test.describe('App shell block', () => {
  const aside = (page: Page) => example(page, 0).getByRole('complementary', { name: 'App navigation' });

  test('renders both shells without errors', async ({ page }) => {
    const { errors } = await openDoc(page, SHELL);
    await settle(page);
    await expect(page.locator('[data-example^="blocks/app-shell/"]')).toHaveCount(2);
    await expect(example(page, 0).getByRole('button', { name: 'Toggle sidebar' })).toBeVisible();
    await expect(example(page, 1).locator('header.ui-navbar')).toBeVisible();
    // The Next.js usage section shows the layout as copyable code, not a live example
    await expect(page.getByText('app/(app)/layout.tsx', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the sidebar collapses to the rail and expands again', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, SHELL);
    await settle(page);
    expect(Math.round((await aside(page).boundingBox())!.width)).toBe(256);
    const trigger = example(page, 0).getByRole('button', { name: 'Toggle sidebar' });
    await trigger.click();
    await expect(aside(page)).toHaveAttribute('data-state', 'collapsed');
    await settle(page);
    expect(Math.round((await aside(page).boundingBox())!.width)).toBe(56);
    await trigger.click();
    await expect(aside(page)).toHaveAttribute('data-state', 'expanded');
  });

  test('on a phone the trigger opens the sidebar as a sheet', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openDoc(page, SHELL);
    await example(page, 0).getByRole('button', { name: 'Toggle sidebar' }).click();
    const sheet = page.getByRole('dialog', { name: 'App navigation' });
    await expect(sheet).toBeVisible();
    await sheet.getByRole('button', { name: 'Customers' }).click();
    await expect(sheet).toBeHidden();
    await expect(example(page, 0).getByRole('heading', { name: 'Customers' })).toBeVisible();
  });

  test('a nav item updates the breadcrumb and the page', async ({ page }) => {
    test.skip(!desktop(page), 'phones use the off-canvas sheet');
    await openDoc(page, SHELL);
    await aside(page).getByRole('button', { name: 'Analytics' }).click();
    await expect(example(page, 0).locator('[aria-current="page"]').last()).toHaveText('Analytics');
    await expect(example(page, 0).getByRole('heading', { name: 'Analytics', level: 2 })).toBeVisible();
  });

  test('the search button opens the command palette', async ({ page }) => {
    await openDoc(page, SHELL);
    await example(page, 0).getByRole('button', { name: /Search/ }).click();
    const palette = page.getByRole('dialog', { name: 'Search' });
    await expect(palette).toBeVisible();
    await page.keyboard.type('custom');
    await page.keyboard.press('Enter');
    await expect(palette).toBeHidden();
    await expect(example(page, 0).getByRole('heading', { name: 'Customers', level: 2 })).toBeVisible();
  });

  test('nothing overflows horizontally at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openDoc(page, SHELL);
    await settle(page);
    expect(await overflow(page)).toEqual({ page: 0, previews: [] });
  });

  for (const dark of [false, true]) {
    test(`axe passes (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, SHELL, { dark });
      await settle(page);
      for (const file of ['sidebar', 'top-navbar']) {
        await expectNoA11yViolations(page, `[data-example="blocks/app-shell/${file}"]`);
      }
    });
  }
});
