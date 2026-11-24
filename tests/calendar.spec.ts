import { expect, test, type Locator } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PATH = '/docs/components/calendar';
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const focusedDate = (page: import('@playwright/test').Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.date ?? null);
const day = (scope: Locator, date: string) => scope.locator(`button[data-date="${date}"]`);

test.describe('Calendar', () => {
  test('renders an ARIA grid, Monday first, with today marked, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const cal = example(page, 0);
    await expect(cal.getByRole('grid')).toHaveCount(1);
    const heads = await cal.locator('th').allTextContents();
    expect(heads).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(await cal.locator('tbody tr').count()).toBe(6);
    await expect(cal.locator('button[aria-current="date"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('clicking a day selects it and reports it', async ({ page }) => {
    await openDoc(page, PATH);
    const cal = example(page, 0);
    const target = cal.locator('.ui-calendar-day:not([data-outside]):not([data-disabled])').nth(14);
    await target.click();
    await expect(target).toHaveAttribute('data-selected', 'true');
    await expect(target.locator('xpath=..')).toHaveAttribute('aria-selected', 'true');
    await expect(cal.getByText(/Demo booked for/)).toBeVisible();
  });

  test('keyboard: arrows, Home/End, Page keys and Shift+Page move focus per the date grid pattern', async ({ page }) => {
    await openDoc(page, PATH);
    const cal = example(page, 0);
    const start = cal.locator('.ui-calendar-day[tabindex="0"]');
    await start.focus();
    const from = (await focusedDate(page))!;
    const [y, m, d] = from.split('-').map(Number) as [number, number, number];
    const at = (days: number) => key(new Date(y, m - 1, d + days));

    await page.keyboard.press('ArrowRight');
    expect(await focusedDate(page)).toBe(at(1));
    await page.keyboard.press('ArrowDown');
    expect(await focusedDate(page)).toBe(at(8));
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    expect(await focusedDate(page)).toBe(at(0));

    // Home / End = Monday / Sunday of the same week
    await page.keyboard.press('Home');
    const monday = new Date((await focusedDate(page))! + 'T00:00:00');
    expect(monday.getDay()).toBe(1);
    await page.keyboard.press('End');
    expect(new Date((await focusedDate(page))! + 'T00:00:00').getDay()).toBe(0);

    // Page keys change the month, Shift+Page the year; focus stays in the grid
    const title = cal.locator('.ui-calendar-title');
    const before = await title.textContent();
    await page.keyboard.press('PageDown');
    await expect(title).not.toHaveText(before!);
    expect(await focusedDate(page)).not.toBeNull();
    await page.keyboard.press('PageUp');
    await expect(title).toHaveText(before!);
    await page.keyboard.press('Shift+PageDown');
    await expect(title).toHaveText(before!.replace(/\d{4}/, (yr) => String(Number(yr) + 1)));
  });

  test('has a single tab stop in the grid', async ({ page }) => {
    await openDoc(page, PATH);
    await expect(example(page, 0).locator('.ui-calendar-day[tabindex="0"]')).toHaveCount(1);
  });

  test('range: two clicks build a continuous band with caps, hover previews the end', async ({ page, isMobile }) => {
    await openDoc(page, PATH);
    const cal = example(page, 1);
    const days = cal.locator('.ui-calendar-day:not([data-outside])');
    await days.nth(9).click();
    if (!isMobile) {
      await days.nth(14).hover();
      expect(await cal.locator('td[data-preview][data-range]').count()).toBeGreaterThanOrEqual(5);
    }
    await days.nth(13).click();
    await expect(cal.locator('td[data-range="start"]')).toHaveCount(1);
    await expect(cal.locator('td[data-range="end"]')).toHaveCount(1);
    await expect(cal.locator('td[data-range="middle"]')).toHaveCount(3);
    await expect(cal.locator('.ui-calendar-day[data-selected]')).toHaveCount(2);
    await expect(cal.getByText(/night/)).toBeVisible();
    // A third click starts over
    await days.nth(20).click();
    await expect(cal.locator('td[data-range]')).toHaveCount(0);
  });

  test('range accepts the end before the start', async ({ page }) => {
    await openDoc(page, PATH);
    const cal = example(page, 1);
    const days = cal.locator('.ui-calendar-day:not([data-outside])');
    await days.nth(15).click();
    await days.nth(11).click();
    await expect(cal.locator('td[data-range="middle"]')).toHaveCount(3);
  });

  test('multiple mode toggles days', async ({ page }) => {
    await openDoc(page, PATH);
    const cal = example(page, 2);
    const days = cal.locator('.ui-calendar-day:not([data-outside])');
    await days.nth(3).click();
    await days.nth(7).click();
    await expect(cal.getByText('2 on-call days selected')).toBeVisible();
    await days.nth(3).click();
    await expect(cal.getByText('1 on-call day selected')).toBeVisible();
  });

  test('two months sit side by side on desktop and fit the screen on phones', async ({ page, isMobile }) => {
    await openDoc(page, PATH);
    const cal = example(page, 3);
    const grids = cal.getByRole('grid');
    await expect(grids).toHaveCount(2);
    const [a, b] = [await grids.nth(0).boundingBox(), await grids.nth(1).boundingBox()];
    if (isMobile) {
      expect(b!.y).toBeGreaterThan(a!.y + a!.height - 1);
    } else {
      expect(b!.x).toBeGreaterThan(a!.x + a!.width - 1);
      expect(Math.abs(b!.y - a!.y)).toBeLessThan(2);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('min, max and disabled dates cannot be selected', async ({ page }) => {
    await openDoc(page, PATH);
    const cal = example(page, 4);
    const disabled = cal.locator('.ui-calendar-day[data-disabled]:not([data-outside])').first();
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await disabled.click({ force: true });
    await expect(cal.locator('.ui-calendar-day[data-selected]')).toHaveCount(0);
    // Past days are disabled by min: the previous-month button is at its limit
    await expect(cal.getByRole('button', { name: 'Previous month' })).toHaveAttribute('aria-disabled', 'true');
  });

  test('month buttons change the month with the slide animation', async ({ page }) => {
    await openDoc(page, PATH);
    const cal = example(page, 0);
    const title = cal.locator('.ui-calendar-title');
    const before = await title.textContent();
    await cal.getByRole('button', { name: 'Next month' }).click();
    await expect(title).not.toHaveText(before!);
    await expect(cal.locator('.ui-calendar-grid')).toHaveAttribute('data-direction', 'next');
    await settle(page);
    await cal.getByRole('button', { name: 'Previous month' }).click();
    await expect(title).toHaveText(before!);
  });

  test('locale renders German month and weekday names', async ({ page }) => {
    await openDoc(page, PATH);
    const cal = example(page, 5);
    const heads = await cal.locator('th').allTextContents();
    expect(heads[0]).toMatch(/^Mo/);
    await expect(cal.getByRole('button', { name: 'Nächster Monat' })).toBeVisible();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PATH);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PATH, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
