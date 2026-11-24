import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/switch';

test.describe('Switch', () => {
  test('toggles by click, label click and keyboard, without console errors', async ({ page, hasTouch }) => {
    const { errors } = await openDoc(page, PAGE);
    const digest = page.getByRole('switch', { name: 'Weekly digest' });
    await expect(digest).toHaveAttribute('aria-checked', 'false');
    await digest.click();
    await expect(digest).toHaveAttribute('aria-checked', 'true');
    await page.getByText('Weekly digest', { exact: true }).click();
    await expect(digest).toHaveAttribute('aria-checked', 'false');
    if (!hasTouch) {
      await digest.focus();
      await page.keyboard.press('Space');
      await expect(digest).toHaveAttribute('aria-checked', 'true');
      await page.keyboard.press('Enter');
      await expect(digest).toHaveAttribute('aria-checked', 'false');
    }
    expect(errors).toEqual([]);
  });

  test('thumb travels track − thumb − 4px and never overshoots', async ({ page }) => {
    await openDoc(page, PAGE);
    const sw = example(page, 1).getByRole('switch', { name: 'Medium, 40 × 24' });
    await sw.scrollIntoViewIfNeeded();
    await settle(page);
    const geometry = () =>
      sw.evaluate((el) => {
        const t = el.getBoundingClientRect();
        const h = el.querySelector('.ui-switch-thumb')!.getBoundingClientRect();
        return { track: t.width, thumb: h.width, x: h.left - t.left };
      });
    const on = await geometry();
    expect(on.track).toBe(40);
    expect(on.thumb).toBe(20);
    expect(on.x).toBeCloseTo(40 - 20 - 2, 0);

    // Turn off, sampling the thumb every frame: it only moves toward 2px, never past it
    const samples = await sw.evaluate(async (el) => {
      const thumb = el.querySelector('.ui-switch-thumb')!;
      const out: number[] = [];
      (el as HTMLElement).click();
      const start = performance.now();
      await new Promise<void>((done) => {
        const tick = () => {
          out.push(thumb.getBoundingClientRect().left - el.getBoundingClientRect().left);
          if (performance.now() - start < 700) requestAnimationFrame(tick);
          else done();
        };
        tick();
      });
      return out;
    });
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(2 - 0.5);
    expect(samples.at(-1)).toBeCloseTo(2, 0);
    expect(samples[0]).toBeGreaterThan(samples.at(-1)!);
  });

  test('uses the control tokens for the track', async ({ page }) => {
    await openDoc(page, PAGE);
    const sw = page.getByRole('switch', { name: 'Deploy notifications' });
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    await settle(page);
    const [on, off] = await Promise.all([
      sw.evaluate((el) => getComputedStyle(el).backgroundColor),
      page.getByRole('switch', { name: 'Weekly digest' }).evaluate((el) => getComputedStyle(el).backgroundColor),
    ]);
    expect(on).not.toBe(off);
  });

  test('sizes: sm is 32 × 18, md is 40 × 24', async ({ page }) => {
    await openDoc(page, PAGE);
    const sizes = await example(page, 1).getByRole('switch').evaluateAll((els) =>
      els.map((e) => [Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)]),
    );
    expect(sizes).toEqual([[32, 18], [40, 24]]);
  });

  test('controlled switch reports state, submits through a hidden input and respects disabled', async ({ page }) => {
    await openDoc(page, PAGE);
    const autosave = page.getByRole('switch', { name: 'Auto-save drafts' });
    const hidden = () => page.locator('input[type="hidden"][name="autosave"]').count();
    await expect(autosave).toHaveAttribute('aria-checked', 'true');
    expect(await hidden()).toBe(1);
    await autosave.click();
    await expect(page.getByText('Drafts are only saved when you click save.')).toBeVisible();
    expect(await hidden()).toBe(0);

    const sso = page.getByRole('switch', { name: 'Single sign-on' });
    await expect(sso).toBeDisabled();
    await sso.click({ force: true });
    await expect(sso).toHaveAttribute('aria-checked', 'true');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
