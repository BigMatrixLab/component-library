import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/table';

test.describe('Table', () => {
  test('renders the invoices table with right-aligned tabular amounts and no console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const table = example(page, 0).getByRole('table');
    await expect(table).toBeVisible();
    await expect(example(page, 0).getByRole('columnheader')).toHaveCount(5);
    await expect(example(page, 0).locator('tbody tr')).toHaveCount(5);

    const cell = example(page, 0).locator('tbody tr').first().locator('td').nth(4);
    const style = await cell.evaluate((el) => {
      const s = getComputedStyle(el);
      return { align: s.textAlign, numeric: s.fontVariantNumeric };
    });
    expect(style.align).toBe('right');
    expect(style.numeric).toContain('tabular-nums');

    // Wrapper is rounded and bordered
    const wrap = example(page, 0).locator('.ui-table-wrap');
    const wrapStyle = await wrap.evaluate((el) => {
      const s = getComputedStyle(el);
      return { border: s.borderTopWidth, radius: parseFloat(s.borderTopLeftRadius) };
    });
    expect(wrapStyle.border).toBe('1px');
    expect(wrapStyle.radius).toBeGreaterThan(4);
    expect(errors).toEqual([]);
  });

  test('compact rows are shorter; sticky header stays pinned while the body scrolls', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 1);
    const rowHeight = await panel.locator('tbody tr').first().evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(rowHeight).toBeLessThanOrEqual(38);

    const wrap = panel.locator('.ui-table-wrap');
    await wrap.evaluate((el) => {
      el.scrollTop = 200;
    });
    const head = panel.getByRole('columnheader', { name: 'Region' });
    const [wrapBox, headBox] = await Promise.all([wrap.boundingBox(), head.boundingBox()]);
    expect(Math.abs(headBox!.y - (wrapBox!.y + 1))).toBeLessThan(3);
    // The selected row is tinted
    await expect(panel.locator('tr[data-state="selected"]')).toHaveCount(1);
  });

  test('the scroll wrapper is keyboard focusable', async ({ page }) => {
    await openDoc(page, PAGE);
    const wrap = example(page, 1).locator('.ui-table-wrap');
    await wrap.focus();
    await expect(wrap).toBeFocused();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: invoices (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`table-invoices-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
