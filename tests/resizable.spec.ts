import { expect, test, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/resizable';

const listHandle = (page: Page) => example(page, 0).getByRole('separator', { name: 'Resize message list' });
const width = (page: Page, n: number) =>
  example(page, 0)
    .locator('.ui-resizable-panel')
    .nth(n)
    .evaluate((el) => el.getBoundingClientRect().width);

test.describe('Resizable panels', () => {
  test('panels start proportional to their default sizes', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const handle = listHandle(page);
    await expect(handle).toHaveAttribute('aria-valuenow', '36');
    const list = await width(page, 1);
    const reading = await width(page, 2);
    expect(list / reading).toBeCloseTo(36 / 44, 1);
    await expect(handle).toHaveAttribute('role', 'separator');
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect(handle).toHaveAttribute('aria-valuemin', '25');
    await expect(handle).toHaveAttribute('aria-valuemax', '55');
    expect(errors).toEqual([]);
  });

  test('arrow keys move the divider by 5%, Home and End go to the limits', async ({ page }) => {
    await openDoc(page, PAGE);
    const handle = listHandle(page);
    await expect(handle).toHaveAttribute('aria-valuenow', '36');
    const before = await width(page, 1);
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '41');
    expect(await width(page, 1)).toBeGreaterThan(before + 5);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '31');
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuenow', '25');
    await page.keyboard.press('End');
    await expect(handle).toHaveAttribute('aria-valuenow', '55');
    // Past the limit nothing changes
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '55');
  });

  test('dragging the divider trades space and respects limits', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone' || info.project.name === 'android', 'mouse drag');
    await openDoc(page, PAGE);
    const handle = listHandle(page);
    await expect(handle).toHaveAttribute('aria-valuenow', '36');
    const [listBefore, readingBefore] = [await width(page, 1), await width(page, 2)];
    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 60, y, { steps: 8 });
    await expect(example(page, 0).locator('.ui-resizable-group')).toHaveAttribute('data-dragging', '');
    await page.mouse.up();
    const [listAfter, readingAfter] = [await width(page, 1), await width(page, 2)];
    expect(listAfter - listBefore).toBeGreaterThan(50);
    expect(listAfter - listBefore).toBeLessThan(70);
    expect(Math.abs(listAfter + readingAfter - (listBefore + readingBefore))).toBeLessThan(1.5);
    // Drag far to the left: the list stops at its 25% minimum
    await page.mouse.move(x + 60, y);
    await page.mouse.down();
    await page.mouse.move(x - 2000 < 0 ? 0 : x - 2000, y, { steps: 10 });
    await page.mouse.up();
    await expect(handle).toHaveAttribute('aria-valuenow', '25');
    await expect(example(page, 0).locator('.ui-resizable-group')).not.toHaveAttribute('data-dragging', '');
  });

  test('Enter collapses and restores a collapsible panel', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone' || info.project.name === 'android', 'the folder pane is hidden on phones');
    await openDoc(page, PAGE);
    const folders = example(page, 0).locator('.ui-resizable-panel').first();
    const handle = example(page, 0).getByRole('separator', { name: 'Resize folders' });
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
    await handle.focus();
    await page.keyboard.press('Enter');
    await expect(folders).toHaveAttribute('data-collapsed', 'true');
    await expect(handle).toHaveAttribute('aria-valuenow', '0');
    await page.keyboard.press('Enter');
    await expect(folders).not.toHaveAttribute('data-collapsed', 'true');
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
  });

  test('a group with an id remembers its layout across reloads', async ({ page }) => {
    await openDoc(page, PAGE);
    const handle = listHandle(page);
    await expect(handle).toHaveAttribute('aria-valuenow', '36');
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '41');
    const saved = await page.evaluate(() => localStorage.getItem('ui-resizable:docs-mail-client'));
    expect(JSON.parse(saved!)).toHaveLength(3);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await expect(listHandle(page)).toHaveAttribute('aria-valuenow', '41');
  });

  test('vertical: the divider is horizontal and moves with Up / Down', async ({ page }) => {
    await openDoc(page, PAGE);
    const handle = example(page, 1).getByRole('separator', { name: 'Resize terminal' });
    await expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(handle).toHaveAttribute('aria-valuenow', '65');
    const top = example(page, 1).locator('.ui-resizable-panel').first();
    const before = (await top.boundingBox())!.height;
    await handle.focus();
    await page.keyboard.press('ArrowDown');
    await expect(handle).toHaveAttribute('aria-valuenow', '70');
    expect((await top.boundingBox())!.height).toBeGreaterThan(before + 5);
    // Left / Right do nothing in a vertical group
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '70');
    await expect(handle.locator('.ui-resizable-grip')).toBeVisible();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
