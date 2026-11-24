import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/spinner';

test.describe('Spinner', () => {
  test('sizes are 12 / 16 / 20 / 28 / 40px and spin', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const spinners = example(page, 0).locator('.ui-spinner');
    const widths = await spinners.evaluateAll((els) => els.slice(0, 5).map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(widths).toEqual([12, 16, 20, 28, 40]);
    await expect(spinners.first().locator('.ui-spinner-ring')).toHaveCSS('animation-name', 'ui-spin');
    expect(errors).toEqual([]);
  });

  test('is a status with hidden text; label={false} is decorative', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(example(page, 1).getByRole('status', { name: 'Syncing' })).toHaveCount(1);
    await expect(example(page, 1).getByRole('status')).toHaveCount(1);
    await expect(example(page, 1).locator('.ui-spinner[aria-hidden="true"]')).toHaveCount(2);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
