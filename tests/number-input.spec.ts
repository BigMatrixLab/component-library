import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/number-input';

test.describe('NumberInput', () => {
  test('is a spinbutton with value, bounds and text', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const seats = page.getByRole('spinbutton', { name: 'Seats' });
    await expect(seats).toHaveAttribute('aria-valuenow', '5');
    await expect(seats).toHaveAttribute('aria-valuemin', '1');
    await expect(seats).toHaveAttribute('aria-valuemax', '25');
    await expect(seats).toHaveValue('5');
    expect(errors).toEqual([]);
  });

  test('keyboard: arrows, PageUp, End and Home', async ({ page }) => {
    await openDoc(page, PAGE);
    const seats = page.getByRole('spinbutton', { name: 'Seats' });
    await seats.focus();
    await page.keyboard.press('ArrowUp');
    await expect(seats).toHaveAttribute('aria-valuenow', '6');
    await expect(example(page, 0).getByText('6 seats at $12 = $72 per month.')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(seats).toHaveAttribute('aria-valuenow', '5');
    await page.keyboard.press('PageUp');
    await expect(seats).toHaveAttribute('aria-valuenow', '15');
    await page.keyboard.press('End');
    await expect(seats).toHaveAttribute('aria-valuenow', '25');
    await page.keyboard.press('Home');
    await expect(seats).toHaveAttribute('aria-valuenow', '1');
  });

  test('buttons step the value and disable at the bounds', async ({ page }) => {
    await openDoc(page, PAGE);
    const seats = page.getByRole('spinbutton', { name: 'Seats' });
    const plus = example(page, 0).getByRole('button', { name: 'Increase' });
    const minus = example(page, 0).getByRole('button', { name: 'Decrease' });
    await plus.click();
    await expect(seats).toHaveAttribute('aria-valuenow', '6');
    await seats.focus();
    await page.keyboard.press('End');
    await expect(plus).toBeDisabled();
    await expect(minus).toBeEnabled();
    await page.keyboard.press('Home');
    await expect(minus).toBeDisabled();
    await expect(plus).toBeEnabled();
  });

  test('holding a button repeats and accelerates', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Held mouse presses are not emulated on mobile profiles');
    await openDoc(page, PAGE);
    const seats = page.getByRole('spinbutton', { name: 'Seats' });
    const plus = example(page, 0).getByRole('button', { name: 'Increase' });
    await plus.hover();
    await page.mouse.down();
    await page.waitForTimeout(1200);
    await page.mouse.up();
    const held = Number(await seats.getAttribute('aria-valuenow'));
    expect(held).toBeGreaterThan(8);
    await page.waitForTimeout(400);
    expect(Number(await seats.getAttribute('aria-valuenow'))).toBe(held);
  });

  test('typed text is parsed and formatted on blur; unreadable text is dropped', async ({ page }) => {
    await openDoc(page, PAGE);
    const price = page.getByRole('spinbutton', { name: 'Annual price' });
    await expect(price).toHaveValue('€1,249.00');
    await price.fill('2,500.5');
    await price.blur();
    await expect(price).toHaveValue('€2,500.50');
    await expect(price).toHaveAttribute('aria-valuenow', '2500.5');
    await expect(example(page, 1).getByText('Stored value: 2500.5')).toBeVisible();

    await price.fill('abc');
    await price.blur();
    await expect(price).toHaveValue('€2,500.50');

    await price.fill('');
    await price.blur();
    await expect(price).toHaveValue('');
    await expect(example(page, 1).getByText('Stored value: empty')).toBeVisible();
  });

  test('values are clamped to min and max', async ({ page }) => {
    await openDoc(page, PAGE);
    const price = page.getByRole('spinbutton', { name: 'Annual price' });
    await price.fill('999999');
    await price.press('Enter');
    await expect(price).toHaveAttribute('aria-valuenow', '50000');
  });

  test('percent shows fractions as percentages; the wheel works only when focused and opted in', async ({ page, isMobile }) => {
    await openDoc(page, PAGE);
    const discount = page.getByRole('spinbutton', { name: 'Volume discount' });
    await expect(discount).toHaveValue('15%');
    await discount.fill('20');
    await discount.blur();
    await expect(discount).toHaveValue('20%');
    await expect(discount).toHaveAttribute('aria-valuenow', '0.2');
    await discount.press('ArrowUp');
    await expect(discount).toHaveValue('21%');

    test.skip(!!isMobile, 'No mouse wheel on mobile profiles');
    await discount.hover();
    await page.mouse.wheel(0, -100);
    await expect(discount).toHaveValue('22%');
    // Not opted in: the seats field ignores the wheel
    const seats = page.getByRole('spinbutton', { name: 'Seats' });
    await seats.focus();
    await seats.hover();
    await page.mouse.wheel(0, -100);
    await expect(seats).toHaveAttribute('aria-valuenow', '5');
  });

  test('sizes are 32 / 36 / 44px and attached segments are as tall as the group', async ({ page }) => {
    await openDoc(page, PAGE);
    const groups = example(page, 3).locator('.ui-input-group');
    const heights = await groups.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights).toEqual([36, 44, 32, 36]);
    const attached = example(page, 3).locator('.ui-number-input-attached');
    const group = (await attached.boundingBox())!;
    const step = (await attached.locator('.ui-number-input-step').first().boundingBox())!;
    expect(Math.round(step.height)).toBe(Math.round(group.height) - 2);
  });

  test('disabled field disables the input and both buttons', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(page.getByRole('spinbutton', { name: 'Disabled' })).toBeDisabled();
    const buttons = example(page, 3).locator('.ui-number-input').last().getByRole('button');
    await expect(buttons.first()).toBeDisabled();
    await expect(buttons.last()).toBeDisabled();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, '[role="tabpanel"]');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, '[role="tabpanel"]');
  });
});
