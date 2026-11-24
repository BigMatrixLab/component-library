import { expect, test, type Locator } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/data-table';

const amounts = async (panel: Locator) =>
  (await panel.locator('tbody tr').locator('td:nth-child(6)').allTextContents()).map((t) => Number(t.replace(/[^0-9.]/g, '')));

test.describe('Data table', () => {
  test('renders 10 of 40 rows with the range text and no console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const panel = example(page, 0);
    await expect(panel.locator('tbody tr')).toHaveCount(10);
    await expect(panel.getByText('Showing 1–10 of 40')).toBeVisible();
    await expect(panel.getByText('Page 1 of 4')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('sorting cycles ascending, descending, none and updates aria-sort', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    const header = panel.getByRole('columnheader', { name: /Amount/ });
    const button = header.getByRole('button');
    await expect(header).toHaveAttribute('aria-sort', 'none');

    await button.click();
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    const asc = await amounts(panel);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    await button.click();
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    const desc = await amounts(panel);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));

    await button.click();
    await expect(header).toHaveAttribute('aria-sort', 'none');
  });

  test('search filters after the debounce and resets to page 1; empty result shows the empty state', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    const search = panel.getByRole('searchbox', { name: 'Search payments' });

    await panel.getByRole('button', { name: 'Next page' }).click();
    await expect(panel.getByText('Showing 11–20 of 40')).toBeVisible();

    await search.fill('Yuki');
    await expect(panel.getByText('Showing 1–4 of 4')).toBeVisible();
    await expect(panel.locator('tbody tr')).toHaveCount(4);

    await search.fill('zzzzz');
    await expect(panel.getByText('No payments found')).toBeVisible();
    await panel.getByRole('button', { name: 'Clear filters' }).click();
    await expect(panel.getByText('Showing 1–10 of 40')).toBeVisible();
    await expect(search).toHaveValue('');
  });

  test('pagination and page size', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    await expect(panel.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await panel.getByRole('button', { name: 'Next page' }).click();
    await expect(panel.getByText('Showing 11–20 of 40')).toBeVisible();

    await panel.getByLabel('Rows per page').selectOption('25');
    await expect(panel.getByText('Showing 1–25 of 40')).toBeVisible();
    await expect(panel.locator('tbody tr')).toHaveCount(25);
    await panel.getByRole('button', { name: 'Next page' }).click();
    await expect(panel.getByText('Showing 26–40 of 40')).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  test('selecting rows raises the bulk bar; clearing lowers it', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    const all = panel.getByRole('checkbox', { name: 'Select all rows on this page' });
    const bar = page.getByRole('region', { name: 'Bulk actions' });
    await expect(bar).toHaveCount(0);

    await all.check({ force: true });
    await expect(bar).toBeVisible();
    await expect(bar).toContainText('10 selected');
    await expect(panel.getByText('10 of 40 selected')).toBeVisible();
    await expect(panel.locator('tbody tr[data-state="selected"]')).toHaveCount(10);

    // Unchecking one row leaves the header indeterminate
    await panel.locator('tbody tr').first().getByRole('checkbox').uncheck({ force: true });
    await expect(bar).toContainText('9 selected');
    expect(await all.evaluate((el) => (el as HTMLInputElement).indeterminate)).toBe(true);

    await bar.getByRole('button', { name: 'Clear' }).click();
    await expect(bar).toHaveCount(0);
    await expect(panel.locator('tbody tr[data-state="selected"]')).toHaveCount(0);
  });

  test('the columns menu hides and shows a column', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    await expect(panel.getByRole('columnheader', { name: 'Method' })).toBeVisible();
    await panel.getByRole('button', { name: 'Columns' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Method' }).click();
    // Choosing an item keeps the menu open
    await expect(page.getByRole('menuitemcheckbox', { name: 'Method' })).toBeVisible();
    await expect(panel.getByRole('columnheader', { name: 'Method' })).toHaveCount(0);
    await page.getByRole('menuitemcheckbox', { name: 'Method' }).click();
    await expect(panel.getByRole('columnheader', { name: 'Method' })).toBeVisible();
  });

  test('controlled example: column filter, reset and loading skeletons', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 1);
    await expect(panel.getByText('Showing 1–5 of 8')).toBeVisible();

    await panel.getByRole('combobox', { name: 'Filter by role' }).selectOption('Admin');
    await expect(panel.getByText('Showing 1–2 of 2')).toBeVisible();

    await panel.getByRole('button', { name: 'Reload' }).click();
    await expect(panel.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    await expect(panel.getByRole('table')).not.toHaveAttribute('aria-busy', 'true', { timeout: 4000 });

    await panel.getByRole('button', { name: 'Reset all' }).click();
    await expect(panel.getByText('Showing 1–5 of 8')).toBeVisible();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: payments (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`data-table-payments-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
