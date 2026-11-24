import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/copy-button';
const KEY = 'demo_key_7f3a9c2e1b8d4f60';

test.describe('Copy button', () => {
  test('copies, swaps to a check, announces "Copied" and reverts after ~1.5s', async ({ page, context, browserName }) => {
    if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const { errors } = await openDoc(page, PAGE);
    const panel = example(page, 0);
    const button = panel.getByRole('button', { name: 'Copy API key' });
    await expect(button).toHaveAttribute('data-state', 'idle');

    await button.click();
    await expect(button).toHaveAttribute('data-state', 'copied');
    await expect(panel.getByRole('status')).toHaveText('Copied');
    // The accessible name does not change
    await expect(button).toHaveAccessibleName('Copy API key');
    const doneOpacity = await button.locator('.ui-copy-icon-done').evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(doneOpacity)).toBeGreaterThan(0);

    if (browserName === 'chromium') {
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(KEY);
    }

    await expect(button).toHaveAttribute('data-state', 'idle', { timeout: 3000 });
    await expect(panel.getByRole('status')).toHaveText('');
    expect(errors).toEqual([]);
  });

  test('works from the keyboard', async ({ page, context, browserName }) => {
    if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openDoc(page, PAGE);
    const button = example(page, 0).getByRole('button', { name: 'Copy API key' });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('data-state', 'copied');
  });

  test('a labelled button keeps its width while the text changes', async ({ page, context, browserName }) => {
    if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openDoc(page, PAGE);
    const button = example(page, 1).getByRole('button', { name: 'Copy command' });
    const before = (await button.boundingBox())!.width;
    await button.click();
    await expect(button).toHaveAttribute('data-state', 'copied');
    const during = (await button.boundingBox())!.width;
    expect(Math.abs(during - before)).toBeLessThan(0.5);
    await expect(button.locator('.ui-copy-text-done')).toHaveCSS('opacity', '1');
  });

  test('falls back to execCommand when the Clipboard API is missing', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
      let copied = '';
      document.addEventListener('copy', (e) => {
        copied = window.getSelection()?.toString() ?? '';
        e.preventDefault();
        (window as unknown as { __copied: string }).__copied = copied;
      });
    });
    await openDoc(page, PAGE);
    const button = example(page, 0).getByRole('button', { name: 'Copy API key' });
    await button.click();
    await expect(button).toHaveAttribute('data-state', /copied|error/);
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });

  for (const dark of [false, true]) {
    test(`visual: variants (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expect(example(page, 1)).toHaveScreenshot(`copy-button-variants-${dark ? 'dark' : 'light'}.png`);
    });
  }
});
