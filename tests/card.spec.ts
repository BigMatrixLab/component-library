import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/card';

test.describe('Card', () => {
  test('rests on a border with no shadow; the action is top-right', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const card = example(page, 0).locator('.ui-card');
    await expect(card).toHaveCSS('box-shadow', 'none');
    await expect(card).toHaveCSS('border-top-width', '1px');
    const box = (await card.boundingBox())!;
    const action = (await card.locator('.ui-card-action').boundingBox())!;
    expect(action.x + action.width).toBeGreaterThan(box.x + box.width - 30);
    expect(action.y).toBeLessThan(box.y + 40);
    expect(errors).toEqual([]);
  });

  test('interactive cards are links and lift on hover with a fine pointer', async ({ page }, info) => {
    await openDoc(page, PAGE);
    const link = example(page, 1).getByRole('link', { name: /Dialog/ });
    await expect(link).toHaveClass(/ui-card-interactive/);
    if (info.project.name === 'chromium' || info.project.name === 'webkit' || info.project.name === 'firefox') {
      await link.hover();
      await page.waitForTimeout(700);
      const t = await link.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
      expect(t).toBeCloseTo(-2, 0);
    }
    await link.focus();
    await expect(link).toBeFocused();
  });

  test('inset radius is concentric: outer radius minus the gap', async ({ page }) => {
    await openDoc(page, PAGE);
    const radii = await example(page, 2).evaluate((root) => {
      const inset = root.querySelector('.ui-card-inset') as HTMLElement;
      const outer = inset.parentElement as HTMLElement;
      return [parseFloat(getComputedStyle(outer).borderTopLeftRadius), parseFloat(getComputedStyle(inset).borderTopLeftRadius)];
    });
    expect(radii[1]).toBeCloseTo(radii[0]! - 8, 0);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
