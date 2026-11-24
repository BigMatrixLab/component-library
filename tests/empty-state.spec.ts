import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/empty-state';

test.describe('Empty state', () => {
  test('renders title, description and actions with an icon tile', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const empty = example(page, 0).locator('.ui-empty');
    await expect(empty.getByRole('heading', { name: 'No projects yet', level: 3 })).toBeVisible();
    await expect(empty.getByRole('button', { name: 'New project' })).toBeVisible();
    // The default variant has no container
    await expect(empty).toHaveCSS('border-top-width', '0px');
    const tile = (await empty.locator('.ui-empty-media-icon').boundingBox())!;
    expect(Math.round(tile.width)).toBe(48);
    expect(Math.round(tile.height)).toBe(48);
    const icon = (await empty.locator('.ui-empty-media-icon svg').boundingBox())!;
    expect(Math.round(icon.width)).toBe(24);
    expect(errors).toEqual([]);
  });

  test('content is centred', async ({ page }) => {
    await openDoc(page, PAGE);
    const empty = example(page, 0).locator('.ui-empty');
    const box = (await empty.boundingBox())!;
    const title = (await empty.locator('.ui-empty-title').boundingBox())!;
    expect(Math.abs(title.x + title.width / 2 - (box.x + box.width / 2))).toBeLessThan(2);
  });

  test('variants: dashed and card borders', async ({ page }) => {
    await openDoc(page, PAGE);
    const dashed = example(page, 1).locator('.ui-empty-dashed');
    await expect(dashed).toHaveCSS('border-top-style', 'dashed');
    await expect(dashed).toHaveCSS('border-top-width', '1px');
    const card = example(page, 1).locator('.ui-empty-card');
    await expect(card).toHaveCSS('border-top-style', 'solid');
    await expect(card).toHaveCSS('border-top-width', '1px');
  });

  test('works inside a card and honours the heading level', async ({ page }) => {
    await openDoc(page, PAGE);
    const empty = example(page, 2).locator('.ui-card .ui-empty');
    await expect(empty.getByRole('heading', { name: 'No invoices in 2026', level: 4 })).toBeVisible();
    await expect(empty).toHaveCSS('border-top-width', '0px');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
