import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/kbd';

test.describe('Kbd', () => {
  test('sizes are 20 / 24 / 28px tall, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const heights = await example(page, 0).locator('.ui-kbd').evaluateAll((els) => els.slice(-6).map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights).toEqual([20, 20, 24, 24, 28, 28]);
    expect(errors).toEqual([]);
  });

  test('plus groups draw a separator between keys', async ({ page }) => {
    await openDoc(page, PAGE);
    const content = await example(page, 0)
      .locator('.ui-kbd-group-plus > .ui-kbd')
      .nth(1)
      .evaluate((el) => getComputedStyle(el, '::before').content);
    expect(content).toContain('+');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
