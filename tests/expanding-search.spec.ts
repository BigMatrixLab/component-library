import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

test.describe('Expanding search', () => {
  test('grows from an icon button into a field and focuses the input', async ({ page }) => {
    const { errors } = await openDoc(page, '/docs/components/expanding-search');
    const field = example(page, 0).locator('.ui-xsearch-field');
    const closed = await field.boundingBox();
    expect(Math.round(closed!.width)).toBe(Math.round(closed!.height));

    await page.getByRole('button', { name: 'Search components' }).click();
    await expect(field).toHaveAttribute('data-state', 'open');
    await expect(page.getByRole('searchbox', { name: 'Search components' })).toBeFocused();
    await expect.poll(async () => Math.round((await field.boundingBox())!.width)).toBe(260);
    expect(errors).toEqual([]);
  });

  test('collapses on blur when empty, stays open with text', async ({ page }) => {
    await openDoc(page, '/docs/components/expanding-search');
    const field = example(page, 0).locator('.ui-xsearch-field');
    await page.getByRole('button', { name: 'Search components' }).click();
    await expect(field).toHaveAttribute('data-state', 'open');
    await page.locator('main h1').first().click();
    await expect(field).toHaveAttribute('data-state', 'closed');

    await page.getByRole('button', { name: 'Search components' }).click();
    await page.keyboard.type('tab');
    await page.locator('main h1').first().click();
    await expect(field).toHaveAttribute('data-state', 'open');
  });

  test('Esc clears, collapses and returns focus to the icon', async ({ page }) => {
    await openDoc(page, '/docs/components/expanding-search');
    const field = example(page, 0).locator('.ui-xsearch-field');
    await page.getByRole('button', { name: 'Search components' }).click();
    await page.keyboard.type('dia');
    await page.keyboard.press('Escape');
    await expect(field).toHaveAttribute('data-state', 'closed');
    await expect(field.getByRole('button', { name: 'Search components' })).toBeFocused();
    await page.getByRole('button', { name: 'Search components' }).click();
    await expect(page.getByRole('searchbox')).toHaveValue('');
  });

  test('the results slot appears with a query and filters', async ({ page }) => {
    await openDoc(page, '/docs/components/expanding-search');
    await page.getByRole('button', { name: 'Search components' }).click();
    await page.keyboard.type('dia');
    const list = page.getByRole('list', { name: 'Results' });
    await expect(list).toBeVisible();
    await expect(list.getByRole('button')).toHaveCount(1);
    await expect(list.getByRole('button', { name: 'Dialog' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.getByRole('list', { name: 'Results' })).toHaveCount(0);
  });

  test('⌘K / Ctrl K expands and focuses the field', async ({ page }) => {
    await openDoc(page, '/docs/components/expanding-search');
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('searchbox', { name: 'Search components' })).toBeFocused();
    await expect(example(page, 0).locator('.ui-xsearch-field')).toHaveAttribute('data-state', 'open');
  });

  test('the collapsed input is not reachable by keyboard', async ({ page }) => {
    await openDoc(page, '/docs/components/expanding-search');
    const input = example(page, 0).locator('.ui-xsearch-input');
    await expect(input).toHaveAttribute('tabindex', '-1');
    await expect(input).toBeHidden();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, '/docs/components/expanding-search');
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, '/docs/components/expanding-search', { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: collapsed (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, '/docs/components/expanding-search', { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`expanding-search-closed-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
