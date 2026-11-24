import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/item';

test.describe('Item & list', () => {
  test('a group is a list with hairline dividers between rows', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const group = example(page, 0).getByRole('list', { name: 'Account settings' });
    await expect(group.getByRole('listitem')).toHaveCount(4);
    const cells = group.locator('.ui-item-cell');
    await expect(cells.first()).toHaveCSS('border-top-width', '0px');
    await expect(cells.nth(1)).toHaveCSS('border-top-width', '1px');
    await expect(cells.nth(3)).toHaveCSS('border-top-width', '1px');
    // The outline group is one bordered container
    await expect(group).toHaveCSS('border-top-width', '1px');
    expect(errors).toEqual([]);
  });

  test('rows lay out media, text and actions on one line; actions stay at the end', async ({ page }) => {
    await openDoc(page, PAGE);
    const row = example(page, 0).locator('.ui-item').first();
    const box = (await row.boundingBox())!;
    const media = (await row.locator('.ui-item-media').boundingBox())!;
    const actions = (await row.locator('.ui-item-actions').boundingBox())!;
    const content = (await row.locator('.ui-item-content').boundingBox())!;
    expect(media.x).toBeLessThan(content.x);
    expect(content.x + content.width).toBeLessThanOrEqual(actions.x + 1);
    expect(actions.x + actions.width).toBeGreaterThan(box.x + box.width - 24);
    expect(Math.round(media.width)).toBe(36);
  });

  test('controls inside a row work', async ({ page }) => {
    await openDoc(page, PAGE);
    const toggle = example(page, 0).getByRole('switch', { name: 'Email notifications' });
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  });

  test('variants and sizes', async ({ page }) => {
    await openDoc(page, PAGE);
    const items = example(page, 1).locator('.ui-item');
    await expect(items).toHaveCount(5);
    await expect(items.nth(0)).toHaveCSS('border-top-width', '1px');
    await expect(items.nth(0)).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await expect(items.nth(1)).toHaveClass(/ui-item-outline/);
    const muted = await items.nth(2).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(muted).not.toBe('rgba(0, 0, 0, 0)');
    const [sm, md, lg] = await Promise.all([3, 1, 4].map((i) => items.nth(i).evaluate((el) => el.getBoundingClientRect().height)));
    expect(sm).toBeLessThan(md);
    expect(md).toBeLessThan(lg);
  });

  test('asChild renders real links that take focus with a visible ring', async ({ page }) => {
    await openDoc(page, PAGE);
    const links = example(page, 2).getByRole('link');
    await expect(links).toHaveCount(3);
    await expect(links.first()).toHaveClass(/ui-item/);
    await expect(links.first()).toHaveAttribute('href', '/docs/components/card');
    // Still a list: each link sits in a listitem cell
    await expect(example(page, 2).getByRole('listitem')).toHaveCount(3);
    await links.first().focus();
    await expect(links.first()).toBeFocused();
    // Programmatic focus after no pointer use counts as :focus-visible
    await expect.poll(() => links.first().evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  });

  test('hover fills an interactive row on fine pointers', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone' || info.project.name === 'android', 'no hover on touch');
    await openDoc(page, PAGE);
    const link = example(page, 2).getByRole('link').nth(1);
    const before = await link.evaluate((el) => getComputedStyle(el).backgroundColor);
    await link.hover();
    await expect.poll(() => link.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
