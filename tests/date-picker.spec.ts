import { expect, test, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PATH = '/docs/components/date-picker';
const panel = (page: Page) => page.getByRole('dialog');
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const medium = (key: string) => {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(y, m - 1, d));
};
const activeDate = (page: Page) => page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.date ?? null);

test.describe('DatePicker', () => {
  test('opens under the field with focus on a day; Esc closes and focus returns', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const field = example(page, 0);
    const trigger = field.getByRole('button', { name: /Due date/ });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(field.locator('.ui-picker-value')).toHaveText('Pick a due date');

    await trigger.click();
    await expect(panel(page)).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await settle(page);
    expect(await activeDate(page)).not.toBeNull();

    const f = (await field.locator('.ui-picker-field').boundingBox())!;
    const p = (await panel(page).boundingBox())!;
    expect(Math.abs(p.y - (f.y + f.height + 6))).toBeLessThanOrEqual(2);
    expect(Math.abs(p.x - f.x)).toBeLessThanOrEqual(2); // bottom-start

    await page.keyboard.press('Escape');
    await expect(panel(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('ArrowDown on the field opens it; tabbing out closes it', async ({ page }) => {
    await openDoc(page, PATH);
    const trigger = example(page, 0).getByRole('button', { name: /Due date/ });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(panel(page)).toBeVisible();
    await page.keyboard.press('Tab'); // focus starts on a day, the last tab stop of the panel
    await expect(panel(page)).toHaveCount(0);
  });

  test('picking a day closes the panel, formats the value and fills the hidden ISO input', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    await field.getByRole('button', { name: /Due date/ }).click();
    const day = panel(page).locator('.ui-calendar-day:not([data-disabled])').first();
    const key = (await day.getAttribute('data-date'))!;
    await day.click();
    await expect(panel(page)).toHaveCount(0);
    await expect(field.locator('.ui-picker-value')).toHaveText(medium(key));
    await expect(field.locator('input[type="hidden"][name="due"]')).toHaveValue(key);
    await expect(field.getByRole('button', { name: /Due date/ })).toBeFocused();
  });

  test('min and disabledDates are respected: no past days, no weekends', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    await field.getByRole('button', { name: /Due date/ }).click();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const past = panel(page).locator(`button[data-date="${iso(yesterday)}"]`);
    if (await past.count()) await expect(past).toHaveAttribute('data-disabled', 'true');
    const weekdaysOnly = await panel(page)
      .locator('.ui-calendar-day:not([data-disabled])')
      .evaluateAll((els) => els.every((el) => ![0, 6].includes(new Date((el as HTMLElement).dataset.date + 'T00:00:00').getDay())));
    expect(weekdaysOnly).toBe(true);
  });

  test('the clear button empties the value and keeps focus on the field', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    await field.getByRole('button', { name: /Due date/ }).click();
    await panel(page).locator('.ui-calendar-day:not([data-disabled])').first().click();
    await field.getByRole('button', { name: 'Clear date' }).click();
    await expect(field.locator('.ui-picker-value')).toHaveText('Pick a due date');
    await expect(field.locator('input[type="hidden"][name="due"]')).toHaveValue('');
    await expect(field.getByRole('button', { name: 'Clear date' })).toHaveCount(0);
    await expect(field.getByRole('button', { name: /Due date/ })).toBeFocused();
  });

  test('typeable: parses on Enter, flags invalid and out-of-range text, calendar follows', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 1);
    const input = field.getByLabel('Contract start');
    await input.fill('3/14/2027');
    await input.press('Enter');
    await expect(input).toHaveValue('March 14, 2027');
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');

    await field.getByRole('button', { name: 'Choose date' }).click();
    await expect(panel(page).locator('button[data-selected="true"]')).toHaveAttribute('data-date', '2027-03-14');
    await page.keyboard.press('Escape');
    await expect(input).toBeFocused();

    await input.fill('31/02/2027');
    await input.press('Enter');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveValue('31/02/2027');

    await input.fill('1/1/2020'); // before min
    await input.press('Enter');
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    await input.fill('Nov 5 2026');
    await input.press('Enter');
    await expect(input).toHaveValue('November 5, 2026');
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');

    await input.fill('');
    await input.press('Enter');
    await expect(field.getByRole('button', { name: 'Clear date' })).toHaveCount(0);
  });

  test('range: two picks commit, show "A – B" and fill both hidden inputs', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 2);
    const trigger = field.getByRole('button', { name: /Stay/ });
    await expect(field.locator('.ui-picker-value')).toHaveText('Check-in – check-out');
    await trigger.click();
    await expect(panel(page)).toBeVisible();

    const wide = (page.viewportSize()?.width ?? 0) >= 640;
    await expect(panel(page).locator('.ui-calendar-month')).toHaveCount(wide ? 2 : 1);

    const days = panel(page).locator('.ui-calendar-month').last().locator('.ui-calendar-day:not([data-disabled]):not([data-outside])');
    const first = days.nth(4);
    const second = days.nth(10);
    const [from, to] = [(await first.getAttribute('data-date'))!, (await second.getAttribute('data-date'))!];
    await first.click();
    await expect(panel(page)).toBeVisible(); // one pick is not a range yet
    await second.click();
    await expect(panel(page)).toHaveCount(0);

    await expect(field.locator('.ui-picker-value')).toContainText('–');
    await expect(field.locator('input[name="check_in"]')).toHaveValue(from);
    await expect(field.locator('input[name="check_out"]')).toHaveValue(to);
    await expect(field.getByText(/nights? at Harbour House/)).toBeVisible();
  });

  test('range presets fill the range in one click', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 2);
    await field.getByRole('button', { name: /Stay/ }).click();
    await panel(page).getByRole('button', { name: 'Next 7 nights' }).click();
    await expect(panel(page)).toHaveCount(0);
    const from = await field.locator('input[name="check_in"]').inputValue();
    const to = await field.locator('input[name="check_out"]').inputValue();
    expect(iso(new Date(new Date(from + 'T00:00:00').getTime() + 7 * 86_400_000 + 3_600_000))).toBe(to);
    await expect(field.getByText('7 nights at Harbour House')).toBeVisible();

    // reopened: the matching preset is pressed
    await field.getByRole('button', { name: /Stay/ }).click();
    await expect(panel(page).getByRole('button', { name: 'Next 7 nights' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('confirm: nothing commits until Apply; Cancel discards', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 3);
    const value = field.locator('.ui-picker-value');
    await expect(value).toHaveText('All time');
    await field.getByRole('button', { name: /Report period/ }).click();
    const apply = panel(page).getByRole('button', { name: 'Apply' });
    await expect(apply).toBeDisabled();

    await panel(page).getByRole('button', { name: 'Last 7 days' }).click();
    await expect(panel(page)).toBeVisible();
    await expect(value).toHaveText('All time');
    await expect(apply).toBeEnabled();
    await apply.click();
    await expect(panel(page)).toHaveCount(0);
    await expect(value).toContainText('–');
    await expect(field.getByText(/Revenue report for/)).toBeVisible();
    const committed = await value.textContent();

    await field.getByRole('button', { name: /Report period/ }).click();
    await panel(page).getByRole('button', { name: 'Last 30 days' }).click();
    await panel(page).getByRole('button', { name: 'Cancel' }).click();
    await expect(panel(page)).toHaveCount(0);
    await expect(value).toHaveText(committed!);

    await field.getByRole('button', { name: 'Clear dates' }).click();
    await expect(value).toHaveText('All time');
  });

  test('the range panel fits the viewport and the field never overflows', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 2);
    await field.getByRole('button', { name: /Stay/ }).click();
    await settle(page);
    const vw = page.viewportSize()!.width;
    const p = (await panel(page).boundingBox())!;
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x + p.width).toBeLessThanOrEqual(vw + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('in a form it submits ISO dates, not locale text', async ({ page }) => {
    await openDoc(page, PATH);
    const form = example(page, 4);
    await form.getByRole('button', { name: 'Create invoice' }).click();
    const out = form.locator('pre');
    await expect(out).toContainText('"invoice_date": "2026-11-24"');
    await expect(out).toContainText('"period_start": "2026-11-03"');
    await expect(out).toContainText('"period_end": "2026-11-24"');
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations, closed and open (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PATH, { dark });
      await expectNoA11yViolations(page, '.ui-datepicker');
      await example(page, 0).getByRole('button', { name: /Due date/ }).click();
      await settle(page);
      await expectNoA11yViolations(page, '.ui-datepicker');
      await page.keyboard.press('Escape');
      await example(page, 2).getByRole('button', { name: /Stay/ }).click();
      await settle(page);
      await expectNoA11yViolations(page, '.ui-daterangepicker');
    });
  }
});
