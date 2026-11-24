import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/sheet';

test.describe('Sheet', () => {
  test('opens as a modal, focuses the autofocus field, closes on Esc and returns focus', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const trigger = page.getByRole('button', { name: 'Notification settings' });
    await trigger.click();
    const sheet = page.getByRole('dialog', { name: 'Notification settings' });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('data-side', 'right');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByLabel('Reply-to address')).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
    expect(errors).toEqual([]);
  });

  test('slides in to the right edge without overshoot and closes on an overlay click', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Notification settings' }).click();
    const sheet = page.getByRole('dialog', { name: 'Notification settings' });
    const panel = sheet.locator('.ui-sheet-panel');
    // Sample the panel position while it slides: it never goes past the edge
    const lefts = await page.evaluate(async () => {
      const el = document.querySelector('.ui-sheet-panel') as HTMLElement;
      const out: number[] = [];
      for (let i = 0; i < 20; i++) {
        out.push(el.getBoundingClientRect().right);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
      return out;
    });
    const vw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(Math.max(...lefts)).toBeLessThanOrEqual(vw + 400 + 1);
    await settle(page);
    const box = (await panel.boundingBox())!;
    expect(Math.round(box.x + box.width)).toBe(vw);
    // a click inside the panel keeps it open, a click on the overlay closes it
    await panel.click({ position: { x: 20, y: 200 } });
    await expect(sheet).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(sheet).toHaveCount(0);
  });

  for (const side of ['left', 'top', 'bottom'] as const) {
    test(`${side} sheet docks to its edge`, async ({ page }) => {
      await openDoc(page, PAGE);
      await page.getByRole('button', { name: side, exact: true }).click();
      const sheet = page.getByRole('dialog', { name: `${side} sheet`, exact: false });
      await expect(sheet).toHaveAttribute('data-side', side);
      await settle(page);
      const box = (await sheet.locator('.ui-sheet-panel').boundingBox())!;
      const vp = page.viewportSize()!;
      if (side === 'left') expect(Math.round(box.x)).toBe(0);
      if (side === 'top') expect(Math.round(box.y)).toBe(0);
      if (side === 'bottom') expect(Math.round(box.y + box.height)).toBe(vp.height);
      await page.keyboard.press('Escape');
      await expect(sheet).toHaveCount(0);
    });
  }

  test('bottom sheet: a short drag springs back, a long drag dismisses', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Share report' }).click();
    const sheet = page.getByRole('dialog', { name: /Share/ });
    const panel = sheet.locator('.ui-sheet-panel');
    await expect(sheet.locator('.ui-sheet-handle')).toBeVisible();
    await settle(page);
    const rest = (await panel.boundingBox())!;
    const h = (await sheet.locator('.ui-sheet-handle').boundingBox())!;
    const x = h.x + h.width / 2;
    const y = h.y + h.height / 2;

    // short drag, slow, then release: springs back
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 10, { steps: 3 });
    await page.mouse.move(x, y + 30, { steps: 3 });
    const during = (await panel.boundingBox())!;
    expect(during.y - rest.y).toBeGreaterThan(20);
    await page.waitForTimeout(250); // no flick
    await page.mouse.up();
    await expect(sheet).toBeVisible();
    await settle(page);
    const back = (await panel.boundingBox())!;
    expect(Math.abs(back.y - rest.y)).toBeLessThan(1);

    // long drag: dismisses
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + rest.height * 0.3, { steps: 5 });
    await page.mouse.move(x, y + rest.height * 0.6, { steps: 5 });
    await page.waitForTimeout(200);
    await page.mouse.up();
    await expect(sheet).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Share report' })).toBeFocused();
  });

  test('a left sheet can fill the screen on phones', async ({ page }) => {
    await openDoc(page, PAGE);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const sheet = page.getByRole('dialog', { name: 'Atlas' });
    await settle(page);
    const box = (await sheet.locator('.ui-sheet-panel').boundingBox())!;
    const vw = page.viewportSize()!.width;
    if (vw < 640) expect(Math.round(box.width)).toBe(vw);
    else expect(Math.round(box.width)).toBeLessThan(vw);
    await sheet.getByRole('link', { name: 'Domains' }).click();
    await expect(sheet).toHaveCount(0);
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations while open (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await page.getByRole('button', { name: 'Notification settings' }).click();
      await settle(page);
      await expectNoA11yViolations(page, 'dialog');
    });
  }
});
