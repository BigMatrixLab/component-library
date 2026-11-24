import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/tabs';

/** The indicator box must sit exactly on the selected trigger. */
async function expectIndicatorOn(list: Locator, trigger: Locator, vertical = false) {
  await expect
    .poll(
      async () => {
        const i = await list.locator('.ui-tabs-indicator').boundingBox();
        const t = await trigger.boundingBox();
        if (!i || !t) return 999;
        // underline variants draw a 2px bar on one edge, so compare the long axis only
        return vertical ? Math.abs(i.y - t.y) + Math.abs(i.height - t.height) : Math.abs(i.x - t.x) + Math.abs(i.width - t.width);
      },
      { timeout: 4000 },
    )
    .toBeLessThan(1.5);
}

const list = (page: Page, name: string) => page.getByRole('tablist', { name });

test.describe('Tabs', () => {
  test('selects on click, shows the right panel and the indicator follows', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    // first example: account tabs (no aria-label); find by its tab names
    const account = page.getByRole('tab', { name: 'Account' });
    const password = page.getByRole('tab', { name: 'Password' });
    const tl = page.locator('.ui-tabs-list', { has: account });
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await expect(tl).toHaveAttribute('data-ready', '');
    await expectIndicatorOn(tl, account);

    await password.click();
    await expect(password).toHaveAttribute('aria-selected', 'true');
    await expect(account).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('tabpanel', { name: 'Password' })).toBeVisible();
    await expect(page.getByLabel('Current password')).toBeVisible();
    await settle(page);
    await expectIndicatorOn(tl, password);
    expect(errors).toEqual([]);
  });

  test('keyboard: arrows select, wrap, Home/End, disabled tabs are skipped', async ({ page }) => {
    await openDoc(page, PAGE);
    const tabs = list(page, 'segmented tabs');
    await tabs.scrollIntoViewIfNeeded();
    const overview = tabs.getByRole('tab', { name: 'Overview' });
    await overview.focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.getByRole('tab', { name: 'Activity' })).toBeFocused();
    await expect(tabs.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    // Archived is disabled, so End lands on Settings
    await expect(tabs.getByRole('tab', { name: 'Settings' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(overview).toBeFocused();
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(overview).toBeFocused();
    // roving tabindex
    await expect(tabs.getByRole('tab', { name: 'Activity' })).toHaveAttribute('tabindex', '-1');
    await expectIndicatorOn(tabs, overview);
  });

  test('manual activation moves focus only; Enter selects (vertical)', async ({ page }) => {
    await openDoc(page, PAGE);
    const tabs = list(page, 'Project settings');
    await tabs.scrollIntoViewIfNeeded();
    const general = tabs.getByRole('tab', { name: 'General' });
    const domains = tabs.getByRole('tab', { name: 'Domains' });
    await expect(tabs).toHaveAttribute('aria-orientation', 'vertical');
    await general.focus();
    await page.keyboard.press('ArrowDown');
    await expect(domains).toBeFocused();
    await expect(domains).toHaveAttribute('aria-selected', 'false');
    await page.keyboard.press('Enter');
    await expect(domains).toHaveAttribute('aria-selected', 'true');
    await settle(page);
    await expectIndicatorOn(tabs, domains, true);
  });

  test('the indicator is not animated on first render', async ({ page }) => {
    await openDoc(page, PAGE);
    const tl = page.locator('.ui-tabs-list').first();
    // data-animate arrives only after the first placement has painted
    await expect(tl).toHaveAttribute('data-animate', '');
    const t = await tl.locator('.ui-tabs-indicator').evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(t).toContain('transform');
  });

  test('a narrow list scrolls and keeps the selected tab in view', async ({ page }) => {
    await openDoc(page, PAGE);
    const tabs = list(page, 'Month');
    await tabs.scrollIntoViewIfNeeded();
    const m = await tabs.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
    expect(m.sw).toBeGreaterThan(m.cw);
    const december = tabs.getByRole('tab', { name: 'December' });
    await december.focus();
    await page.keyboard.press('Enter');
    await expect(december).toHaveAttribute('aria-selected', 'true');
    await expect
      .poll(async () => {
        const [t, l] = [await december.boundingBox(), await tabs.boundingBox()];
        return !!t && !!l && t.x >= l.x - 1 && t.x + t.width <= l.x + l.width + 1;
      })
      .toBe(true);
    await settle(page);
    await expectIndicatorOn(tabs, december);
  });

  test('period tabs: underline bar sits under the active tab', async ({ page }) => {
    await openDoc(page, PAGE);
    const tabs = list(page, 'Reporting period');
    await tabs.scrollIntoViewIfNeeded();
    await tabs.getByRole('tab', { name: 'Month' }).click();
    await expect(page.getByText('84,120')).toBeVisible();
    await settle(page);
    const bar = (await tabs.locator('.ui-tabs-indicator').boundingBox())!;
    const t = (await tabs.getByRole('tab', { name: 'Month' }).boundingBox())!;
    expect(Math.round(bar.height)).toBe(2);
    expect(Math.abs(bar.y + bar.height - (t.y + t.height))).toBeLessThan(1.5);
  });

  for (const dark of [false, true]) {
    test(`has no serious accessibility violations (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      test.slow();
      await openDoc(page, PAGE, { dark });
      await settle(page);
      await expectNoA11yViolations(page, 'main');
    });
  }
});
