import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/components/accordion';

test.describe('Accordion', () => {
  test('single + collapsible: one item open, height animates to the content height, then closes', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const first = page.getByRole('button', { name: 'Can I change plans later?' });
    const second = page.getByRole('button', { name: 'How does the 14-day trial work?' });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    const region2 = page.getByRole('region', { name: 'How does the 14-day trial work?' });
    await expect(region2).toBeHidden();

    await second.scrollIntoViewIfNeeded();
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await settle(page);
    // end state: the region is as tall as its content
    const h = await region2.evaluate((el) => ({
      box: el.getBoundingClientRect().height,
      content: (el.querySelector('.ui-accordion-body') as HTMLElement).getBoundingClientRect().height,
    }));
    expect(Math.abs(h.box - h.content)).toBeLessThan(1);
    expect(h.box).toBeGreaterThan(20);

    await second.click(); // collapsible: closes
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(region2).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('keyboard: Up/Down/Home/End move between headers, Enter toggles', async ({ page }) => {
    await openDoc(page, PAGE);
    const q = (name: string) => page.getByRole('button', { name });
    await q('Can I change plans later?').focus();
    await page.keyboard.press('ArrowDown');
    await expect(q('How does the 14-day trial work?')).toBeFocused();
    await page.keyboard.press('End');
    await expect(q('Where is my data stored?')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(q('Can I change plans later?')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(q('Where is my data stored?')).toBeFocused();
    await page.keyboard.press('Home');
    await expect(q('Can I change plans later?')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(q('Can I change plans later?')).toHaveAttribute('aria-expanded', 'false');
  });

  test('multiple + disabled: items open independently, disabled stays closed', async ({ page }) => {
    await openDoc(page, PAGE);
    const shipping = page.getByRole('button', { name: 'Shipping' }).first();
    const returns = page.getByRole('button', { name: 'Returns' }).first();
    await shipping.scrollIntoViewIfNeeded();
    await expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await returns.click();
    await expect(returns).toHaveAttribute('aria-expanded', 'true');
    await expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: /Warranty/ }).first()).toBeDisabled();
  });

  test('chevron rotates and the cards variant is a bordered surface', async ({ page }) => {
    await openDoc(page, PAGE);
    const t = page.getByRole('button', { name: 'Shipping' }).nth(1);
    await t.scrollIntoViewIfNeeded();
    await settle(page);
    const tf = await t.locator('.ui-accordion-chevron').evaluate((el) => getComputedStyle(el).transform);
    expect(tf).not.toBe('none'); // rotated 180deg while expanded
    const item = t.locator('xpath=ancestor::div[contains(@class,"ui-accordion-item")]');
    expect(await item.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('1px');
  });

  test('collapsible: show more reveals the rest of the list', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = page.getByRole('button', { name: 'Show all' });
    await trigger.scrollIntoViewIfNeeded();
    const region = page.getByText('README.md');
    await expect(region).toBeHidden();
    await trigger.click();
    await expect(page.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
    await expect(region).toBeVisible();
    await settle(page);
    await page.getByRole('button', { name: 'Show less' }).click();
    await expect(region).toBeHidden();
  });

  test('closed content stays in the DOM (until-found) so find-in-page can reach it', async ({ page }) => {
    await openDoc(page, PAGE);
    const body = page.getByText('Keys start with sk_live_');
    await expect(body).toHaveCount(1);
    const attr = await page.locator('#' + (await page.locator('.ui-accordion-content[hidden]').first().getAttribute('id'))).getAttribute('hidden');
    expect(attr).toBe('until-found');
  });

  test('a closed item opens when the browser reveals it (beforematch)', async ({ page }) => {
    await openDoc(page, PAGE);
    const trigger = page.getByRole('button', { name: 'How do webhooks retry?' });
    await trigger.scrollIntoViewIfNeeded();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await page.evaluate(() => {
      const region = [...document.querySelectorAll<HTMLElement>('.ui-accordion-content')].find((e) =>
        e.textContent?.includes('exponential backoff'),
      )!;
      region.dispatchEvent(new Event('beforematch', { bubbles: true }));
    });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
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
