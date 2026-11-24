import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/pagination';

/** Visible text of every page item: numbers and "…". */
async function shape(nav: ReturnType<typeof example>) {
  return nav.locator('.ui-pagination-item').evaluateAll((items) =>
    items.map((li) => {
      const link = li.querySelector('.ui-pagination-link');
      if (li.querySelector('.ui-pagination-ellipsis')) return '…';
      if (link?.classList.contains('ui-pagination-link-wide')) return link.getAttribute('aria-label') ?? '';
      return link?.textContent?.trim() ?? '';
    }),
  );
}

test.describe('Pagination', () => {
  test('shows first, last, current and its neighbours with ellipses, in a constant number of items', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const nav = example(page, 0).getByRole('navigation', { name: 'Pagination' });
    await expect(nav.locator('[aria-current="page"]')).toHaveText('6');
    expect(await shape(nav)).toEqual(['Go to previous page', '1', '…', '5', '6', '7', '…', '12', 'Go to next page']);

    await nav.getByRole('button', { name: 'Go to next page' }).click();
    await expect(nav.locator('[aria-current="page"]')).toHaveText('7');
    expect(await nav.locator('.ui-pagination-item').count()).toBe(9);

    await nav.getByRole('button', { name: 'Page 12', exact: true }).click();
    expect(await shape(nav)).toEqual(['Go to previous page', '1', '…', '8', '9', '10', '11', '12', 'Go to next page']);
    await nav.getByRole('button', { name: 'Page 1', exact: true }).click();
    expect(await shape(nav)).toEqual(['Go to previous page', '1', '2', '3', '4', '5', '…', '12', 'Go to next page']);
    expect(errors).toEqual([]);
  });

  test('Previous and Next are disabled at the ends and cannot be clicked', async ({ page }) => {
    await openDoc(page, PAGE);
    const nav = example(page, 0).getByRole('navigation', { name: 'Pagination' });
    await nav.getByRole('button', { name: 'Page 1', exact: true }).click();
    const previous = nav.getByRole('button', { name: 'Go to previous page' });
    await expect(previous).toBeDisabled();
    await nav.getByRole('button', { name: 'Page 12', exact: true }).click();
    const next = nav.getByRole('button', { name: 'Go to next page' });
    await expect(next).toBeDisabled();
    await previous.click();
    await expect(nav.locator('[aria-current="page"]')).toHaveText('11');
    await expect(next).toBeEnabled();
  });

  test('the active page is the only aria-current link and the summary follows it', async ({ page }) => {
    await openDoc(page, PAGE);
    const preview = example(page, 0);
    await expect(preview.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(preview.getByText('Showing 51 to 60 of 117 invoices')).toBeVisible();
    await preview.getByRole('button', { name: 'Page 5', exact: true }).click();
    await expect(preview.getByText('Showing 41 to 50 of 117 invoices')).toBeVisible();
  });

  test('the compact variant reads "Page N of M"', async ({ page }) => {
    await openDoc(page, PAGE);
    const nav = example(page, 1).getByRole('navigation', { name: 'Pagination' });
    await expect(nav.locator('.ui-pagination-status')).toHaveText('Page 3 of 12');
    await nav.getByRole('button', { name: 'Go to next page' }).click();
    await expect(nav.locator('.ui-pagination-status')).toHaveText('Page 4 of 12');
  });

  test('works as links with the disabled state on the first page', async ({ page }) => {
    await openDoc(page, PAGE);
    const nav = example(page, 2).getByRole('navigation', { name: 'Blog pages' });
    await expect(nav.getByRole('link', { name: '3' })).toHaveAttribute('href', '/docs/components/pagination?page=3');
    await expect(nav.locator('[aria-current="page"]')).toHaveText('2');
    await expect(nav.getByRole('link', { name: 'Go to previous page' })).toHaveAttribute('href', /page=1$/);
  });

  test('presses scale down on the snappy spring', async ({ page }) => {
    await openDoc(page, PAGE);
    const link = example(page, 0).getByRole('button', { name: 'Page 5', exact: true });
    const box = (await link.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(120);
    const scale = await link.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    await page.mouse.up();
    expect(scale).toBeLessThan(1);
    expect(scale).toBeGreaterThan(0.94);
  });

  test('on phones the Previous / Next labels give way to arrows', async ({ page }) => {
    await openDoc(page, PAGE);
    const nav = example(page, 0).getByRole('navigation', { name: 'Pagination' });
    const label = nav.locator('.ui-pagination-label').first();
    if ((page.viewportSize()?.width ?? 0) < 480) await expect(label).toBeHidden();
    else await expect(label).toBeVisible();
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
});
