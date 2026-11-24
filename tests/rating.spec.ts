import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PATH = '/docs/components/rating';

test.describe('Rating', () => {
  test('is a radiogroup of native radios named by value', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const group = example(page, 0).getByRole('radiogroup', { name: 'Rate your stay' });
    await expect(group.getByRole('radio')).toHaveCount(5);
    await expect(group.getByRole('radio', { name: '1 star' })).toBeAttached();
    await expect(group.getByRole('radio', { name: '5 stars' })).toBeAttached();
    expect(errors).toEqual([]);
  });

  test('clicking a star sets the value and pops the star', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 0);
    await scope.locator('.ui-rating-item').nth(3).click();
    await expect(scope.getByRole('radio', { name: '4 stars' })).toBeChecked();
    await expect(scope.getByText('4 of 5 · Very good')).toBeVisible();
    const filled = await scope.locator('.ui-rating-fill').evaluateAll((els) => els.map((e) => (e as HTMLElement).style.width));
    expect(filled).toEqual(['100%', '100%', '100%', '100%', '0%']);
    // Clicking the chosen star again clears it (allowClear)
    await scope.locator('.ui-rating-item').nth(3).click();
    await expect(scope.getByText('How was your stay at Harbour House?')).toBeVisible();
  });

  test('hover previews the value and restores on leave (fine pointers)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No hover on touch devices');
    await openDoc(page, PATH);
    const scope = example(page, 0);
    await scope.locator('.ui-rating-item').nth(2).hover();
    const preview = await scope.locator('.ui-rating-fill').evaluateAll((els) => els.map((e) => (e as HTMLElement).style.width));
    expect(preview).toEqual(['100%', '100%', '100%', '0%', '0%']);
    await page.mouse.move(0, 0);
    const rest = await scope.locator('.ui-rating-fill').evaluateAll((els) => els.map((e) => (e as HTMLElement).style.width));
    expect(rest).toEqual(['0%', '0%', '0%', '0%', '0%']);
  });

  test('arrow keys change the value (native radio group)', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 0);
    await scope.getByRole('radio', { name: '1 star' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(scope.getByRole('radio', { name: '2 stars' })).toBeChecked();
    await page.keyboard.press('ArrowRight');
    await expect(scope.getByRole('radio', { name: '3 stars' })).toBeChecked();
    await page.keyboard.press('ArrowLeft');
    await expect(scope.getByRole('radio', { name: '2 stars' })).toBeChecked();
  });

  test('half steps: the left half of a star gives x.5', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 1);
    await expect(scope.getByText('3.5 / 5')).toBeVisible();
    const item = scope.locator('.ui-rating-item').nth(1);
    const box = (await item.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.2, box.y + box.height / 2);
    await expect(scope.getByText('1.5 / 5')).toBeVisible();
    await page.mouse.click(box.x + box.width * 0.8, box.y + box.height / 2);
    await expect(scope.getByText('2.0 / 5')).toBeVisible();
    await expect(scope.getByRole('radio', { name: '2 stars' })).toBeChecked();
  });

  test('read-only shows fractional values as an image with a text alternative', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 2);
    const lamp = scope.getByRole('img', { name: 'Aurora desk lamp: 4.3 out of 5' });
    await expect(lamp).toBeVisible();
    const fills = await lamp.locator('.ui-rating-fill').evaluateAll((els) => els.map((e) => (e as HTMLElement).style.width));
    expect(fills.slice(0, 4)).toEqual(['100%', '100%', '100%', '100%']);
    expect(parseFloat(fills[4]!)).toBeCloseTo(30, 0);
    await expect(lamp.getByRole('radio')).toHaveCount(0);
    // Sized 16px stars
    const star = await lamp.locator('.ui-rating-star').first().boundingBox();
    expect(Math.round(star!.width)).toBe(16);
  });

  test('a form submits the chosen values by name', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = example(page, 3);
    await scope.getByRole('radio', { name: '4 stars' }).first().evaluate((el) => (el as HTMLInputElement).click());
    await scope.getByRole('radio', { name: '2.5 stars' }).evaluate((el) => (el as HTMLInputElement).click());
    await scope.getByRole('button', { name: 'Send feedback' }).click();
    await expect(scope.getByText('Sent: service=4, speed=2.5')).toBeVisible();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PATH);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PATH, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
