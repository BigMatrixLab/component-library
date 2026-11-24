import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/separator';

test.describe('Separator', () => {
  test('horizontal is 1px tall, vertical is 1px wide and fills its row', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const seps = example(page, 0).locator('.ui-separator');
    const h = await seps.first().boundingBox();
    expect(Math.round(h!.height)).toBe(1);
    const v = await seps.nth(1).boundingBox();
    expect(Math.round(v!.width)).toBe(1);
    expect(v!.height).toBeGreaterThanOrEqual(16);
    expect(errors).toEqual([]);
  });

  test('decorative separators are hidden from assistive tech; semantic ones are not', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(example(page, 0).locator('.ui-separator').first()).toHaveAttribute('role', 'none');
    await expect(example(page, 0).getByRole('separator')).toHaveCount(0);
  });

  test('the label sits between two lines', async ({ page }) => {
    await openDoc(page, PAGE);
    const sep = example(page, 1).locator('.ui-separator-label');
    await expect(sep).toContainText('or');
    const lines = await sep.evaluate((el) => [getComputedStyle(el, '::before').flexGrow, getComputedStyle(el, '::after').flexGrow]);
    expect(lines).toEqual(['1', '1']);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
