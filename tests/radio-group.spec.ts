import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/radio-group';

test.describe('Radio group', () => {
  test('arrow keys move selection, skip disabled items and wrap', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'hardware keyboard only');
    const { errors } = await openDoc(page, PAGE);
    const group = page.getByRole('radiogroup', { name: 'Delivery speed' });
    const standard = group.getByLabel('Standard', { exact: true });
    await expect(standard).toBeChecked();
    await standard.focus();
    await page.keyboard.press('ArrowDown');
    await expect(group.getByLabel('Express', { exact: true })).toBeChecked();
    await expect(group.getByLabel('Express', { exact: true })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(group.getByLabel('Overnight', { exact: true })).toBeChecked();
    // the disabled "Pick up in store" is skipped; the list wraps to the start
    await page.keyboard.press('ArrowDown');
    await expect(standard).toBeChecked();
    await page.keyboard.press('ArrowUp');
    await expect(group.getByLabel('Overnight', { exact: true })).toBeChecked();
    expect(errors).toEqual([]);
  });

  test('a click selects, a disabled item cannot be selected, and the group shares one name', async ({ page }) => {
    await openDoc(page, PAGE);
    const group = page.getByRole('radiogroup', { name: 'Delivery speed' });
    await group.getByText('Overnight', { exact: true }).click();
    await expect(group.getByLabel('Overnight', { exact: true })).toBeChecked();
    await expect(group.getByLabel('Pick up in store', { exact: true })).toBeDisabled();
    const names = await group.locator('input').evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLInputElement).name))]);
    expect(names).toEqual(['delivery']);
  });

  test('the selected radio is the only tab stop', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'hardware keyboard only');
    await openDoc(page, PAGE);
    const group = page.getByRole('radiogroup', { name: 'Delivery speed' });
    const standard = group.getByLabel('Standard', { exact: true });
    await standard.focus();
    await page.keyboard.press('Tab');
    const stillInGroup = await group.evaluate((el) => el.contains(document.activeElement));
    expect(stillInGroup).toBe(false);
  });

  test('controlled horizontal group updates its status text', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(page.getByText('You save 20% with yearly billing.')).toBeVisible();
    await page.getByText('Monthly', { exact: true }).click();
    await expect(page.getByText('Billed every month. Cancel any time.')).toBeVisible();
  });

  test('card ring is measured to the checked card and glides between cards', async ({ page }) => {
    await openDoc(page, PAGE);
    const group = page.getByRole('radiogroup', { name: 'Plan' });
    await group.scrollIntoViewIfNeeded();
    await expect(group).toHaveAttribute('data-glide', '');
    const ring = group.locator('.ui-radio-ring');
    const sameBox = async (card: string) => {
      const a = (await ring.boundingBox())!;
      const b = (await group.locator('label', { hasText: card }).boundingBox())!;
      for (const k of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(a[k] - b[k])).toBeLessThan(1.5);
    };
    await settle(page);
    await sameBox('Pro');

    await group.getByText('Team', { exact: true }).click();
    // mid-flight the ring is somewhere between the two cards
    const midY = await ring.evaluate(
      (el) =>
        new Promise<number>((resolve) => setTimeout(() => resolve(el.getBoundingClientRect().y), 120)),
    );
    const teamY = (await group.locator('label', { hasText: 'Team' }).boundingBox())!.y;
    const proY = (await group.locator('label', { hasText: 'Pro' }).boundingBox())!.y;
    expect(midY).toBeGreaterThan(proY - 1);
    expect(midY).toBeLessThanOrEqual(teamY + 8); // the morph spring may overshoot slightly
    await settle(page);
    await sameBox('Team');
    await expect(page.getByText('Selected: Team')).toBeVisible();
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  test('card ring keeps up at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openDoc(page, PAGE);
    const group = page.getByRole('radiogroup', { name: 'Plan' });
    await group.scrollIntoViewIfNeeded();
    await group.getByText('Starter', { exact: true }).click();
    await settle(page);
    const a = (await group.locator('.ui-radio-ring').boundingBox())!;
    const b = (await group.locator('label', { hasText: 'Starter' }).boundingBox())!;
    expect(Math.abs(a.width - b.width)).toBeLessThan(1.5);
    expect(Math.abs(a.y - b.y)).toBeLessThan(1.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
