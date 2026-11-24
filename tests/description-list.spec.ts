import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/description-list';

test.describe('Description list', () => {
  test('is a native dl with dt / dd pairs and no console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const panel = example(page, 0);
    await expect(panel.locator('dl.ui-dl')).toHaveCount(1);
    await expect(panel.locator('dl > div.ui-dl-item')).toHaveCount(7);
    await expect(panel.locator('dt')).toHaveCount(7);
    await expect(panel.locator('dd')).toHaveCount(7);
    expect(errors).toEqual([]);
  });

  test('horizontal: label column beside the details when the container is wide', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openDoc(page, PAGE);
    const item = example(page, 0).locator('.ui-dl-item').first();
    const [term, details] = await Promise.all([item.locator('dt').boundingBox(), item.locator('dd').boundingBox()]);
    expect(details!.x).toBeGreaterThan(term!.x + term!.width - 1);
    expect(Math.abs(details!.y - term!.y)).toBeLessThan(6);
  });

  test('stacks when the card is narrow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await openDoc(page, PAGE);
    const item = example(page, 0).locator('.ui-dl-item').first();
    const [term, details] = await Promise.all([item.locator('dt').boundingBox(), item.locator('dd').boundingBox()]);
    expect(details!.y).toBeGreaterThan(term!.y + term!.height - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('dividers separate items and the last one has none; an empty value shows a dash', async ({ page }) => {
    await openDoc(page, PAGE);
    const items = example(page, 0).locator('.ui-dl-item');
    const widths = await items.evaluateAll((els) => els.map((e) => getComputedStyle(e).borderBottomWidth));
    expect(widths.slice(0, -1).every((w) => w === '1px')).toBe(true);
    const lastBorderColour = await items.last().evaluate((e) => getComputedStyle(e).borderBottomColor);
    expect(lastBorderColour).toBe('rgba(0, 0, 0, 0)');
    const dash = await example(page, 0)
      .locator('dd:empty')
      .evaluate((e) => getComputedStyle(e, '::before').content);
    expect(dash).toContain('—');
  });

  test('details can hold a copy button that works inside the list', async ({ page }) => {
    await openDoc(page, PAGE);
    const button = example(page, 0).getByRole('button', { name: 'Copy customer ID' });
    await button.click();
    await expect(button).toHaveAttribute('data-state', 'copied');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: customer details (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`description-list-customer-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
