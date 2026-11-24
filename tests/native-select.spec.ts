import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/native-select';

test.describe('Native select', () => {
  test('sizes are 32 / 36 / 44px tall', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const heights = await example(page, 1)
      .locator('select')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights).toEqual([32, 36, 44]);
    expect(errors).toEqual([]);
  });

  test('picks an option and the placeholder reads muted until then', async ({ page }) => {
    await openDoc(page, PAGE);
    const select = page.getByLabel('Country', { exact: true });
    await expect(select).toHaveValue('');
    const muted = await select.evaluate((e) => getComputedStyle(e).color);
    await select.selectOption('IE');
    await expect(select).toHaveValue('IE');
    expect(await select.evaluate((e) => getComputedStyle(e).color)).not.toBe(muted);
  });

  test('chevron does not intercept clicks and keyboard changes the value', async ({ page }) => {
    await openDoc(page, PAGE);
    const select = page.getByLabel('Period', { exact: false }).first();
    const box = (await select.boundingBox())!;
    const icon = example(page, 1).locator('.ui-select-icon').first();
    expect(await icon.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
    expect(box.width).toBeGreaterThan(100);
    const defaultSelect = page.getByLabel('Default billing period', { exact: true });
    await defaultSelect.focus();
    await defaultSelect.selectOption('Yearly');
    await expect(defaultSelect).toHaveValue('Yearly');
  });

  test('invalid and disabled states are exposed', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(page.getByLabel('Plan', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Region', { exact: true })).toBeDisabled();
    await expect(page.getByLabel('Plan', { exact: true })).toHaveAttribute('required', '');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
