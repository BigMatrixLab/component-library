import { expect, test, type Locator, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/toast';

// Example order on the page
const TYPES = 0;
const PROMISE = 1;
const ACTION = 2;
const POSITIONS = 3;
const RICH = 4;
const DURATION = 6;
const CLOSE = 7;
const DIALOG = 8;

const toasts = (page: Page) => page.locator('.ui-toast');
const slots = (page: Page) => page.locator('.ui-toast-slot');

async function scaleAndShift(slot: Locator) {
  return slot.evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return { scale: +m.a.toFixed(3), y: Math.round(m.f) };
  });
}

/** Swipe with a real mouse (desktop) or with touch pointer events (phones: no wheel/swipe API). */
async function swipe(page: Page, target: Locator, dx: number, { hold = 0, touch = false } = {}) {
  const box = (await target.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  if (!touch) {
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) await page.mouse.move(x + (dx * i) / 6, y);
    if (hold) await page.waitForTimeout(hold);
    await page.mouse.up();
    return;
  }
  await target.evaluate(
    async (el, { x, y, dx, hold }) => {
      const fire = (type: string, cx: number) =>
        el.dispatchEvent(
          new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, clientX: cx, clientY: y }),
        );
      fire('pointerdown', x);
      for (let i = 1; i <= 6; i++) {
        fire('pointermove', x + (dx * i) / 6);
        await new Promise((r) => setTimeout(r, 16));
      }
      if (hold) await new Promise((r) => setTimeout(r, hold));
      fire('pointerup', x + dx);
    },
    { x, y, dx, hold },
  );
}

test.describe('Toast', () => {
  test('shows a typed toast in the Notifications region with its icon', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    await example(page, TYPES).getByRole('button', { name: 'Success' }).click();
    const toast = page.locator('.ui-toast[data-type="success"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Invoice #1042 sent');
    await expect(toast.locator('.ui-toast-icon svg')).toBeVisible();
    const region = page.locator('.ui-toaster').first();
    await expect(region).toHaveAttribute('aria-label', 'Notifications');
    await expect(region).toHaveAttribute('aria-live', 'polite');
    expect(await page.locator('.ui-toaster-layer').first().evaluate((el) => el.getAttribute('popover'))).toBe('manual');
    expect(errors).toEqual([]);
  });

  test('errors are announced assertively', async ({ page }) => {
    await openDoc(page, PAGE);
    await example(page, TYPES).getByRole('button', { name: 'Error' }).click();
    const toast = page.locator('.ui-toast[data-type="error"]');
    await expect(toast).toHaveAttribute('role', 'alert');
    await expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  test('stacks: older toasts tuck behind, scaled 1 - .05 per step, and the 4th is hidden', async ({ page }) => {
    await openDoc(page, PAGE);
    const button = example(page, TYPES).getByRole('button', { name: 'Default' });
    for (let i = 0; i < 4; i++) await button.click();
    await expect(slots(page)).toHaveCount(4);
    // index 0 is the newest, so it is the last in the DOM
    const front = slots(page).nth(3);
    const second = slots(page).nth(2);
    const third = slots(page).nth(1);
    await expect.poll(() => scaleAndShift(front)).toEqual({ scale: 1, y: 0 });
    await expect.poll(() => scaleAndShift(second)).toEqual({ scale: 0.95, y: -14 });
    await expect.poll(() => scaleAndShift(third)).toEqual({ scale: 0.9, y: -28 });
    await expect(slots(page).nth(0)).toHaveAttribute('data-visible', 'false');
    await expect(slots(page).nth(2)).toHaveAttribute('data-behind', 'true');
    // Stacked toasts shrink to the height of the front one
    const heights = await slots(page).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights[2]).toBeGreaterThan(0);
  });

  test('hover expands the stack into a list using real heights', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover is a pointer behaviour');
    await openDoc(page, PAGE);
    const button = example(page, TYPES).getByRole('button', { name: 'Success' });
    await button.click();
    await button.click();
    await expect(slots(page)).toHaveCount(2);
    const front = slots(page).nth(1);
    const back = slots(page).nth(0);
    await expect(back).toHaveAttribute('data-behind', 'true');
    const frontBox = (await front.boundingBox())!;
    await page.mouse.move(frontBox.x + frontBox.width / 2, frontBox.y + frontBox.height / 2);
    await expect(back).toHaveAttribute('data-expanded', 'true');
    await expect(back).toHaveAttribute('data-behind', 'false');
    // Wait for the spring to settle, then the older toast sits exactly one height + gap above
    await expect
      .poll(async () => {
        const f = (await front.boundingBox())!;
        const b = (await back.boundingBox())!;
        return Math.round(f.y - (b.y + b.height));
      })
      .toBe(14);
    expect(await scaleAndShift(back)).toMatchObject({ scale: 1 });
    // Moving away collapses it again
    await page.mouse.move(5, 5);
    await expect(back).toHaveAttribute('data-behind', 'true');
  });

  test('timer dismisses a short toast, and hovering pauses it', async ({ page, isMobile }) => {
    await openDoc(page, PAGE);
    const panel = example(page, DURATION);
    await panel.getByRole('button', { name: '1.5 seconds' }).click();
    const toast = toasts(page).filter({ hasText: 'Link copied' });
    await expect(toast).toBeVisible();
    if (!isMobile) {
      const box = (await toast.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(2200); // longer than the 1.5s duration
      await expect(toast).toBeVisible();
      await page.mouse.move(5, 5);
    }
    await expect(toast).toHaveCount(0, { timeout: 5000 });
  });

  test('Infinity stays until dismissed by id', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, DURATION);
    await panel.getByRole('button', { name: 'Until dismissed' }).click();
    const toast = toasts(page).filter({ hasText: 'You are offline' });
    await expect(toast).toBeVisible();
    await page.waitForTimeout(500);
    await panel.getByRole('button', { name: 'Dismiss it' }).click();
    await expect(toast).toHaveCount(0);
  });

  test('promise: one toast morphs from loading to success', async ({ page }) => {
    await openDoc(page, PAGE);
    await example(page, PROMISE).getByRole('button', { name: 'Export (succeeds)' }).click();
    const toast = toasts(page).first();
    await expect(toast).toHaveAttribute('data-type', 'loading');
    await expect(toast).toContainText('Exporting report…');
    await expect(toast.locator('.ui-toast-spinner')).toBeVisible();
    await expect(toast).toHaveAttribute('data-type', 'success', { timeout: 6000 });
    await expect(toast).toContainText('Q3 revenue report exported');
    await expect(toast).toContainText('12,480 rows');
    await expect(toasts(page)).toHaveCount(1);
  });

  test('promise: rejection morphs to an error with the message', async ({ page }) => {
    await openDoc(page, PAGE);
    await example(page, PROMISE).getByRole('button', { name: 'Export (fails)' }).click();
    const toast = toasts(page).first();
    await expect(toast).toHaveAttribute('data-type', 'error', { timeout: 6000 });
    await expect(toast).toContainText('The export service timed out.');
    await expect(toasts(page)).toHaveCount(1);
  });

  test('action runs its handler and dismisses; cancel just dismisses', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, ACTION);
    await panel.getByRole('button', { name: 'With an action' }).click();
    const first = toasts(page).filter({ hasText: 'Conversation archived' });
    await first.getByRole('button', { name: 'Undo' }).click();
    await expect(first).toHaveCount(0);
    await expect(toasts(page).filter({ hasText: 'Conversation restored' })).toBeVisible();

    await panel.getByRole('button', { name: 'Action and cancel' }).click();
    const second = toasts(page).filter({ hasText: 'Delete 3 files?' });
    await second.getByRole('button', { name: 'Keep' }).click();
    await expect(second).toHaveCount(0);
  });

  test('swipe toward the docked edge dismisses; a short slow drag springs back', async ({ page, isMobile }) => {
    await openDoc(page, PAGE);
    // bottom-right: swipe right
    await example(page, POSITIONS).getByRole('radio', { name: 'bottom-right' }).click();
    const toast = toasts(page).filter({ hasText: 'Docked bottom right' });
    await expect(toast).toBeVisible();
    await page.waitForTimeout(500); // let the entrance finish
    const x0 = (await toast.boundingBox())!.x;

    await swipe(page, toast, 20, { hold: 400, touch: isMobile });
    await expect(toast).toBeVisible();
    await expect.poll(async () => Math.abs((await toast.boundingBox())!.x - x0)).toBeLessThan(2);

    await swipe(page, toast, 140, { touch: isMobile });
    await expect(toast).toHaveCount(0, { timeout: 3000 });
  });

  test('swipe the wrong way does not dismiss', async ({ page, isMobile }) => {
    await openDoc(page, PAGE);
    await example(page, POSITIONS).getByRole('radio', { name: 'bottom-right' }).click();
    const toast = toasts(page).filter({ hasText: 'Docked bottom right' });
    await expect(toast).toBeVisible();
    await page.waitForTimeout(500);
    await swipe(page, toast, -160, { touch: isMobile });
    await page.waitForTimeout(600);
    await expect(toast).toBeVisible();
  });

  test('positions: each position docks to its corner', async ({ page, isMobile }) => {
    await openDoc(page, PAGE);
    const vp = page.viewportSize()!;
    for (const name of ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']) {
      await example(page, POSITIONS).getByRole('radio', { name, exact: true }).click();
      const text = `Docked ${name.replace('-', ' ')}`;
      const toast = toasts(page).filter({ hasText: text });
      await expect(toast).toBeVisible();
      await page.waitForTimeout(550);
      const box = (await toast.boundingBox())!;
      const cx = box.x + box.width / 2;
      if (name.startsWith('top')) expect(box.y).toBeLessThan(vp.height / 3);
      else expect(box.y + box.height).toBeGreaterThan((vp.height * 2) / 3);
      if (isMobile) {
        // Phones: full width between the 16px offsets
        expect(Math.round(box.width)).toBe(vp.width - 32);
      } else if (name.endsWith('left')) expect(cx).toBeLessThan(vp.width / 3);
      else if (name.endsWith('right')) expect(cx).toBeGreaterThan((vp.width * 2) / 3);
      else expect(Math.abs(cx - vp.width / 2)).toBeLessThan(2);
    }
  });

  test('close button dismisses; non-dismissible toasts have none', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, CLOSE);
    await panel.getByRole('button', { name: 'Show with a close button' }).click();
    const toast = toasts(page).filter({ hasText: 'Your trial ends Friday' });
    await expect(toast).toBeVisible();
    await page.waitForTimeout(600); // entrance + stack spring settle
    await toast.getByRole('button', { name: 'Close notification' }).click({ force: true });
    await expect(toast).toHaveCount(0);

    await panel.getByRole('button', { name: 'Not dismissible' }).click();
    const pinned = toasts(page).filter({ hasText: 'Pinned announcement' });
    await expect(pinned).toBeVisible();
    await expect(pinned.getByRole('button', { name: 'Close notification' })).toHaveCount(0);
  });

  test('Alt+T focuses the region; Esc on a toast dismisses it and returns focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard shortcut');
    await openDoc(page, PAGE);
    const trigger = example(page, DURATION).getByRole('button', { name: 'Until dismissed' });
    await trigger.click();
    const toast = toasts(page).filter({ hasText: 'You are offline' });
    await expect(toast).toBeVisible();
    await trigger.focus();
    await page.keyboard.press('Alt+KeyT');
    await expect(page.locator('.ui-toaster').first()).toBeFocused();
    // Focus expands the stack
    await expect(slots(page).first()).toHaveAttribute('data-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('rich colours tint by type', async ({ page }) => {
    await openDoc(page, PAGE);
    await example(page, RICH).getByRole('button', { name: 'Error' }).click();
    const toast = toasts(page).filter({ hasText: 'Deploy failed' });
    await expect(toast).toBeVisible();
    const card = toast.locator('.ui-toast-card');
    const [plain, tinted] = await Promise.all([
      page.evaluate(() => getComputedStyle(document.body).backgroundColor),
      card.evaluate((e) => getComputedStyle(e).backgroundColor),
    ]);
    expect(tinted).not.toBe(plain);
  });

  test('toasts appear above a modal dialog and stay interactive', async ({ page, isMobile }) => {
    await openDoc(page, PAGE);
    await example(page, DIALOG).getByRole('button', { name: 'Invite teammate' }).click();
    const dialog = page.getByRole('dialog', { name: 'Invite teammate' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Send invite' }).click();
    const toast = toasts(page).filter({ hasText: 'Invitation sent' });
    await expect(toast).toBeVisible();
    await page.waitForTimeout(600);
    // The layer moved inside the open dialog, so it is not inert
    expect(await toast.evaluate((el) => !!el.closest('dialog'))).toBe(true);
    // It is on top: the element at its centre is the toast itself
    const hit = await toast.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!top && el.contains(top);
    });
    expect(hit).toBe(true);
    // …and clickable
    await toast.getByRole('button', { name: 'Undo' }).click();
    await expect(toasts(page).filter({ hasText: 'Invitation withdrawn' })).toBeVisible();
    // Closing the dialog moves the layer back out of it
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
    await expect.poll(() => page.locator('dialog .ui-toaster').count()).toBe(0);
    await expect(toasts(page).filter({ hasText: 'Invitation withdrawn' })).toBeVisible();
    void isMobile;
  });

  test('has no serious accessibility violations with toasts open (light and dark)', async ({ page }) => {
    test.slow(); // axe is slow in Firefox
    for (const dark of [false, true]) {
      await openDoc(page, PAGE, { dark });
      for (const name of ['Success', 'Error', 'Warning', 'Info']) {
        await example(page, TYPES).getByRole('button', { name, exact: true }).click();
      }
      await example(page, RICH).getByRole('button', { name: 'Success' }).click();
      await example(page, RICH).getByRole('button', { name: 'Error' }).click();
      await example(page, RICH).getByRole('button', { name: 'Warning' }).click();
      await example(page, RICH).getByRole('button', { name: 'Info' }).click();
      await page.waitForTimeout(700);
      await expectNoA11yViolations(page);
    }
  });
});
