import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/alert';

test.describe('Alert', () => {
  test('renders every variant with its icon and no role unless asked', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const variants = example(page, 0);
    const alerts = variants.locator('.ui-alert');
    await expect(alerts).toHaveCount(5);
    expect(await alerts.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.variant))).toEqual([
      'default',
      'info',
      'success',
      'warning',
      'destructive',
    ]);
    // Only the urgent one carries a role
    expect(await alerts.evaluateAll((els) => els.map((e) => e.getAttribute('role')))).toEqual([null, null, null, null, 'alert']);
    // Status variants have an icon, the neutral one does not
    expect(await alerts.evaluateAll((els) => els.map((e) => !!e.querySelector('.ui-alert-icon svg')))).toEqual([false, true, true, true, true]);
    expect(errors).toEqual([]);
  });

  test('title text uses the status colour, not the plain foreground', async ({ page }) => {
    await openDoc(page, PAGE);
    const title = example(page, 0).locator('.ui-alert-destructive .ui-alert-title');
    const description = example(page, 0).locator('.ui-alert-destructive .ui-alert-description');
    const [t, d] = await Promise.all([
      title.evaluate((e) => getComputedStyle(e).color),
      description.evaluate((e) => getComputedStyle(e).color),
    ]);
    expect(t).not.toBe(d);
  });

  test('banner spans its container with square corners and no side borders', async ({ page }) => {
    await openDoc(page, PAGE);
    const banner = example(page, 2).locator('.ui-alert-banner');
    const [box, parent, style] = await Promise.all([
      banner.boundingBox(),
      banner.locator('xpath=..').boundingBox(),
      banner.evaluate((e) => {
        const s = getComputedStyle(e);
        return { radius: s.borderTopLeftRadius, left: s.borderLeftWidth, right: s.borderRightWidth };
      }),
    ]);
    expect(Math.round(box!.width)).toBe(Math.round(parent!.width - 2)); // parent has a 1px border
    expect(style).toEqual({ radius: '0px', left: '0px', right: '0px' });
  });

  test('dismissible: × collapses and removes it, and it can come back', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 3);
    const alert = panel.locator('.ui-alert');
    await expect(alert).toBeVisible();
    await panel.getByRole('button', { name: 'Dismiss' }).click();
    await expect(alert).toHaveCount(0);
    await panel.getByRole('button', { name: 'Show again' }).click();
    await expect(alert).toBeVisible();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow(); // axe is slow in Firefox
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: variants (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expect(example(page, 0)).toHaveScreenshot(`alert-variants-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
