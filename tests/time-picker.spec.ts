import { expect, test, type Locator, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PATH = '/docs/components/time-picker';
const panel = (page: Page) => page.getByRole('dialog');
const hour = (scope: Locator) => scope.getByRole('spinbutton', { name: 'Hour' });
const minute = (scope: Locator) => scope.getByRole('spinbutton', { name: 'Minute' });
const period = (scope: Locator) => scope.getByRole('spinbutton', { name: 'AM or PM' });

test.describe('TimePicker', () => {
  test('shows the value in segments and a hidden HH:mm input, without console errors', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    const field = example(page, 0);
    await expect(hour(field)).toHaveValue('09');
    await expect(minute(field)).toHaveValue('30');
    await expect(period(field)).toHaveValue('AM');
    await expect(field.locator('input[type="hidden"][name="meeting_time"]')).toHaveValue('09:30');
    await expect(hour(field)).toHaveAttribute('aria-valuemin', '1');
    await expect(hour(field)).toHaveAttribute('aria-valuemax', '12');
    await expect(hour(field)).toHaveAttribute('aria-valuenow', '9');
    // the label targets the hour segment
    await page.getByText('Meeting time', { exact: true }).click();
    await expect(hour(field)).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('arrow keys step with wrap-around and update the value', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    const hidden = field.locator('input[type="hidden"][name="meeting_time"]');
    await hour(field).focus();
    await page.keyboard.press('ArrowUp');
    await expect(hour(field)).toHaveValue('10');
    await expect(hidden).toHaveValue('10:30');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(hour(field)).toHaveValue('08');

    await page.keyboard.press('ArrowRight');
    await expect(minute(field)).toBeFocused();
    await page.keyboard.press('End');
    await expect(minute(field)).toHaveValue('59');
    await page.keyboard.press('ArrowUp');
    await expect(minute(field)).toHaveValue('00');

    await page.keyboard.press('ArrowRight');
    await expect(period(field)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(period(field)).toHaveValue('PM');
    await expect(hidden).toHaveValue('20:00');
  });

  test('typing fills segments and moves on; letters choose AM/PM; Backspace clears', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    const hidden = field.locator('input[type="hidden"][name="meeting_time"]');
    await hour(field).focus();
    await page.keyboard.press('Backspace');
    await expect(hour(field)).toHaveValue('');
    await expect(hidden).toHaveValue(''); // incomplete means no value

    await page.keyboard.type('11');
    await expect(hour(field)).toHaveValue('11');
    await expect(minute(field)).toBeFocused();
    await page.keyboard.type('45');
    await expect(minute(field)).toHaveValue('45');
    await expect(period(field)).toBeFocused();
    await page.keyboard.type('p');
    await expect(period(field)).toHaveValue('PM');
    await expect(hidden).toHaveValue('23:45');
    // later than max (18:00): flagged
    await expect(field.locator('.ui-timepicker')).toHaveAttribute('data-invalid', 'true');
    await page.keyboard.type('a');
    await expect(hidden).toHaveValue('11:45');
    await expect(field.locator('.ui-timepicker')).not.toHaveAttribute('data-invalid', 'true');

    // a lone digit that cannot take a second one moves on at once: 7 → 07
    await hour(field).focus();
    await page.keyboard.type('7');
    await expect(hour(field)).toHaveValue('07');
    await expect(minute(field)).toBeFocused();

    // Backspace on an empty segment goes back
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await expect(hour(field)).toBeFocused();
  });

  test('the clear button empties every segment', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    await field.getByRole('button', { name: 'Clear time' }).click();
    await expect(hour(field)).toHaveValue('');
    await expect(minute(field)).toHaveValue('');
    await expect(period(field)).toHaveValue('');
    await expect(field.locator('input[type="hidden"][name="meeting_time"]')).toHaveValue('');
    await expect(field.getByRole('button', { name: 'Clear time' })).toHaveCount(0);
    await expect(hour(field)).toBeFocused();
  });

  test('the list opens on the current time, scrolled into view; picking fills the field', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    const button = field.getByRole('button', { name: 'Choose a time' });
    await button.click();
    await expect(panel(page)).toBeVisible();
    await settle(page);

    const list = panel(page).getByRole('listbox', { name: 'Times' });
    const options = list.getByRole('option');
    await expect(options).toHaveCount(41); // 08:00–18:00 every 15 minutes
    const selected = list.locator('[aria-selected="true"]');
    await expect(selected).toHaveText(/^9:30\sAM$/);
    await expect(selected).toBeFocused();
    const l = (await list.boundingBox())!;
    const s = (await selected.boundingBox())!;
    expect(s.y).toBeGreaterThanOrEqual(l.y - 1);
    expect(s.y + s.height).toBeLessThanOrEqual(l.y + l.height + 1);

    await list.getByRole('option', { name: /^2:15\s?PM$/ }).click();
    await expect(panel(page)).toHaveCount(0);
    await expect(hour(field)).toHaveValue('02');
    await expect(minute(field)).toHaveValue('15');
    await expect(period(field)).toHaveValue('PM');
    await expect(field.locator('input[type="hidden"][name="meeting_time"]')).toHaveValue('14:15');
    await expect(button).toBeFocused();
  });

  test('the list works from the keyboard: Alt+Down opens, arrows move, Enter picks, Esc closes', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    await minute(field).focus();
    await page.keyboard.press('Alt+ArrowDown');
    await expect(panel(page)).toBeVisible();
    await settle(page);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(panel(page)).toHaveCount(0);
    await expect(field.locator('input[type="hidden"][name="meeting_time"]')).toHaveValue('10:00');

    await field.getByRole('button', { name: 'Choose a time' }).click();
    await expect(panel(page)).toBeVisible();
    await page.keyboard.press('Home');
    await expect(panel(page).getByRole('option').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(panel(page)).toHaveCount(0);
    await expect(field.getByRole('button', { name: 'Choose a time' })).toBeFocused();
  });

  test('an outside click closes the list without stealing focus', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    await field.getByRole('button', { name: 'Choose a time' }).click();
    await expect(panel(page)).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(panel(page)).toHaveCount(0);
    await expect(field.getByRole('button', { name: 'Choose a time' })).not.toBeFocused();
  });

  test('opening hours: summary follows the pickers', async ({ page }) => {
    await openDoc(page, PATH);
    const hours = example(page, 1);
    await expect(hours.getByText(/Open 8:00\sAM – 6:00\sPM/)).toBeVisible();
    await expect(hours.getByText(/Open 10:00\sAM – 2:00\sPM/)).toBeVisible();
    await hour(hours).first().focus();
    await page.keyboard.press('Backspace');
    await expect(hours.getByText('Closed').first()).toBeVisible();
  });

  test('24-hour locale has no AM/PM; seconds adds a segment', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 2);
    const departure = field.locator('.ui-timepicker').first();
    await expect(departure.getByRole('spinbutton')).toHaveCount(2);
    await expect(period(departure)).toHaveCount(0);
    await hour(departure).focus();
    await page.keyboard.press('ArrowDown');
    await expect(hour(departure)).toHaveValue('23');

    const lap = field.getByRole('group', { name: 'Lap time' });
    await expect(lap.getByRole('spinbutton')).toHaveCount(3);
    await expect(hour(lap)).toHaveValue('00');
    await expect(minute(lap)).toHaveValue('01');
    const seconds = lap.getByRole('spinbutton', { name: 'Second' });
    await expect(seconds).toHaveValue('42');
    await seconds.focus();
    await page.keyboard.type('59');
    await expect(seconds).toHaveValue('59');
    await page.keyboard.press('ArrowUp');
    await expect(seconds).toHaveValue('00');
  });

  test('the field and the list fit the viewport', async ({ page }) => {
    await openDoc(page, PATH);
    const field = example(page, 0);
    const vw = page.viewportSize()!.width;
    const f = (await field.locator('.ui-timepicker').boundingBox())!;
    expect(f.x + f.width).toBeLessThanOrEqual(vw + 1);
    await field.getByRole('button', { name: 'Choose a time' }).click();
    await settle(page);
    const p = (await panel(page).boundingBox())!;
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x + p.width).toBeLessThanOrEqual(vw + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations, closed and open (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PATH, { dark });
      await expectNoA11yViolations(page, '.ui-timepicker');
      await example(page, 0).getByRole('button', { name: 'Choose a time' }).click();
      await settle(page);
      await expectNoA11yViolations(page, '.ui-timepicker');
    });
  }
});
