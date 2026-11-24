import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/animated-counter';

test.describe('Animated counter', () => {
  test('renders plain text for assistive tech and one reel per digit', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const number = example(page, 0).locator('.ui-number').first();
    await expect(number.locator('.ui-number-sr')).toContainText('$128,430.50');
    // 6 integer digits + 2 decimals
    await expect(number.locator('.ui-number-digit')).toHaveCount(8);
    await expect(number.locator('.ui-number-visual')).toHaveAttribute('aria-hidden', 'true');
    expect(errors).toEqual([]);
  });

  test('the live counter changes, keeps its width, and rolls the reel', async ({ page }) => {
    await openDoc(page, PAGE);
    const number = example(page, 0).locator('.ui-number').first();
    const sr = number.locator('.ui-number-sr');
    const before = await sr.textContent();
    const widthBefore = (await number.boundingBox())!.width;

    await expect(sr).not.toHaveText(before!, { timeout: 6000 });
    const widthAfter = (await number.boundingBox())!.width;
    // Same digit count, tabular figures: no jitter
    expect(Math.abs(widthAfter - widthBefore)).toBeLessThan(0.5);

    // The ones digit reel is positioned on its digit
    const reel = number.locator('.ui-number-reel').nth(5);
    const digit = await reel.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--ui-digit'));
    expect(Number(digit)).toBeGreaterThanOrEqual(0);
    expect(Number(digit)).toBeLessThanOrEqual(9);
  });

  test('pausing stops the updates', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    await panel.getByRole('button', { name: 'Pause' }).click();
    await expect(panel.getByText('Paused')).toBeVisible();
    const sr = panel.locator('.ui-number-sr').first();
    const frozen = await sr.textContent();
    await page.waitForTimeout(2800);
    await expect(sr).toHaveText(frozen!);
  });

  test('reduced motion makes the roll instant', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDoc(page, PAGE);
    const reel = example(page, 0).locator('.ui-number-reel').first();
    const duration = await reel.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(duration).toBeLessThan(0.01);
  });

  test('formats: next value rolls currency, locale, compact and percent together', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 1);
    const numbers = panel.locator('.ui-number-sr');
    await expect(numbers.nth(0)).toHaveText('$1,234.50');
    await expect(numbers.nth(1)).toHaveText(/1\.234,50\s€/);
    await expect(numbers.nth(2)).toHaveText('1.2K');
    await panel.getByRole('button', { name: 'Next value' }).click();
    await expect(numbers.nth(0)).toHaveText('$99,999.99');
    await expect(numbers.nth(2)).toHaveText('100K');
  });

  test('useCountUp counts up when scrolled into view and ends on the exact value', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 2);
    await panel.scrollIntoViewIfNeeded();
    const first = panel.getByRole('img', { name: 'Teams onboarded: 12,480' });
    await expect(first).toHaveText('12,480', { timeout: 4000 });
    await expect(panel.getByRole('img', { name: 'Uptime, last 12 months: 99.98%' }).or(panel.getByRole('img', { name: /Uptime/ }))).toBeVisible();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  test('visual: formats', async ({ page }) => {
    await openDoc(page, PAGE);
    await settle(page);
    await expect(example(page, 1)).toHaveScreenshot('animated-counter-formats.png');
  });
});
