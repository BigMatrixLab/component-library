import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/textarea';

test.describe('Textarea', () => {
  test('grows as lines are added, stops at maxRows and scrolls', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const area = page.getByLabel('Meeting notes', { exact: true });
    const h0 = (await area.boundingBox())!.height;
    await area.click();
    await page.keyboard.press('Control+End');
    await page.keyboard.type('\nline four\nline five\nline six');
    const h1 = (await area.boundingBox())!.height;
    expect(h1).toBeGreaterThan(h0 + 20);
    await page.keyboard.type('\n7\n8\n9\n10\n11\n12');
    const h2 = (await area.boundingBox())!.height;
    expect(h2).toBeLessThanOrEqual(8 * 22 + 16 + 2 + 1);
    expect(await area.evaluate((e) => e.scrollHeight > e.clientHeight)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('empty textarea honours the rows minimum (2 rows = 62px)', async ({ page }) => {
    await openDoc(page, PAGE);
    const area = page.getByLabel('Reason for refund', { exact: true });
    expect(Math.round((await area.boundingBox())!.height)).toBe(2 * 22 + 16 + 2);
  });

  test('counter updates and changes state near the limit', async ({ page }) => {
    await openDoc(page, PAGE);
    const area = page.getByLabel('Bio', { exact: true });
    const counter = page.locator('.ui-textarea-count');
    await expect(counter).toHaveText('59 / 160');
    await area.fill('x'.repeat(150));
    await expect(counter).toHaveText('150 / 160');
    await expect(counter).toHaveAttribute('data-state', 'near');
    await area.fill('x'.repeat(170));
    await expect(counter).toHaveText('160 / 160');
    await expect(counter).toHaveAttribute('data-state', 'limit');
    await expect(area).toHaveAttribute('aria-describedby', /.+/);
  });

  test('invalid and disabled states are exposed', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(page.getByLabel('Reason for refund', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Internal comment', { exact: true })).toBeDisabled();
    await expect(page.getByLabel('Audit log entry', { exact: true })).toHaveAttribute('readonly', '');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
