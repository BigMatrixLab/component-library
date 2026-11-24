import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/popover';

const share = (page: Page) => page.getByRole('button', { name: 'Share', exact: true });
const panel = (page: Page) => page.getByRole('dialog');

test.describe('Popover', () => {
  test('opens below the trigger, moves focus in, closes on Esc and returns focus', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const trigger = share(page);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(panel(page)).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-controls', /.+/);
    await settle(page);

    const b = (await trigger.boundingBox())!;
    const p = (await panel(page).boundingBox())!;
    expect(Math.abs(p.y - (b.y + b.height + 6))).toBeLessThanOrEqual(2);
    expect(Math.abs(p.x - b.x)).toBeLessThanOrEqual(2); // bottom-start

    // focus is inside the panel
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(panel(page)).toHaveCount(0);
    await expect(trigger).toBeFocused(); // also in Safari / Firefox, which do not focus on click
    expect(errors).toEqual([]);
  });

  test('closes on an outside click without stealing focus; a click inside keeps it open', async ({ page }) => {
    await openDoc(page, PAGE);
    await share(page).click();
    await expect(panel(page)).toBeVisible();
    await panel(page).getByText('Anyone with the link').click();
    await expect(panel(page)).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(panel(page)).toHaveCount(0);
    await expect(share(page)).not.toBeFocused();
  });

  test('clicking the trigger again closes it', async ({ page }) => {
    await openDoc(page, PAGE);
    await share(page).click();
    await expect(panel(page)).toBeVisible();
    await share(page).click();
    await expect(panel(page)).toHaveCount(0);
  });

  test('PopoverClose closes it and focus goes back to the trigger', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = page.getByRole('button', { name: 'Dimensions' });
    await trigger.click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByRole('textbox').first()).toBeFocused();
    await panel(page).getByRole('button', { name: 'Apply' }).click();
    await expect(panel(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('tabbing out of the panel closes it', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Dimensions' }).click();
    await expect(panel(page)).toBeVisible();
    for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
    await expect(panel(page)).toHaveCount(0);
  });

  test('places the panel on the chosen side, with an arrow, and flips near the edge', async ({ page }) => {
    await openDoc(page, PAGE);
    const right = page.getByRole('button', { name: 'Right', exact: true });
    await right.click();
    await expect(panel(page)).toBeVisible();
    await settle(page);
    const b = (await right.boundingBox())!;
    const p = (await panel(page).boundingBox())!;
    expect(Math.abs(p.x - (b.x + b.width + 10))).toBeLessThanOrEqual(2);
    expect(Math.abs(p.y + p.height / 2 - (b.y + b.height / 2))).toBeLessThanOrEqual(2);
    await expect(panel(page).locator('.ui-floating-arrow')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(panel(page)).toHaveCount(0);

    // Scroll the Bottom trigger to the bottom edge: the panel flips above it
    const bottom = page.getByRole('button', { name: 'Bottom', exact: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    const edge = (await bottom.boundingBox())!;
    await page.setViewportSize({ width: page.viewportSize()!.width, height: Math.round(edge.y + edge.height + 8) });
    await bottom.click();
    await expect(panel(page)).toBeVisible();
    await settle(page);
    const bb = (await bottom.boundingBox())!;
    const pb = (await panel(page).boundingBox())!;
    expect(pb.y + pb.height).toBeLessThanOrEqual(bb.y + 1);
    await expect(panel(page)).toHaveAttribute('data-side', 'top');
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations while open (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await share(page).click();
      await expect(panel(page)).toBeVisible();
      await settle(page);
      await expectNoA11yViolations(page, '[role="dialog"]');
    });
  }
});
