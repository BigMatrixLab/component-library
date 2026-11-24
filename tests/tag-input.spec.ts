import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/tag-input';

test.describe('TagInput', () => {
  test('Enter, comma and Tab add chips and the hidden input holds the joined value', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const box = example(page, 0);
    const input = page.getByRole('textbox', { name: 'Send the invoice to' });
    await expect(box.locator('.ui-tag')).toHaveCount(2);

    await input.fill('linus@northwind.com');
    await input.press('Enter');
    await expect(box.locator('.ui-tag')).toHaveCount(3);
    await expect(input).toHaveValue('');

    await input.pressSequentially('alan@northwind.com,');
    await expect(box.locator('.ui-tag')).toHaveCount(4);
    await expect(input).toHaveValue('');

    await input.fill('edsger@northwind.com');
    await input.press('Tab');
    await expect(box.locator('.ui-tag')).toHaveCount(5);
    await expect(input).toBeFocused();

    await expect(box.locator('input[name="recipients"]')).toHaveValue(
      'ada@northwind.com,grace@northwind.com,linus@northwind.com,alan@northwind.com,edsger@northwind.com',
    );
    expect(errors).toEqual([]);
  });

  test('invalid text is refused with a message and kept in the field', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = example(page, 0);
    const input = page.getByRole('textbox', { name: 'Send the invoice to' });
    await input.fill('not-an-email');
    await input.press('Enter');
    await expect(box.locator('.ui-tag')).toHaveCount(2);
    await expect(input).toHaveValue('not-an-email');
    await expect(box.getByRole('status')).toHaveText('not-an-email is not a valid email address');
  });

  test('a duplicate is rejected and the existing chip shakes', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = example(page, 0);
    const input = page.getByRole('textbox', { name: 'Send the invoice to' });
    await input.fill('ADA@northwind.com');
    await input.press('Enter');
    await expect(box.locator('.ui-tag')).toHaveCount(2);
    await expect(box.locator('.ui-tag[data-tag-value="ada@northwind.com"]')).toHaveAttribute('data-shake', '');
    await expect(box.getByRole('status')).toHaveText('ADA@northwind.com is already added');
  });

  test('maxTags stops further tags', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = example(page, 0);
    const input = page.getByRole('textbox', { name: 'Send the invoice to' });
    for (const email of ['a@x.com', 'b@x.com', 'c@x.com']) {
      await input.fill(email);
      await input.press('Enter');
    }
    await expect(box.locator('.ui-tag')).toHaveCount(5);
    await expect(box.getByText('5 of 5 added.', { exact: false })).toBeVisible();
    await input.fill('e@x.com');
    await input.press('Enter');
    await expect(box.locator('.ui-tag')).toHaveCount(5);
    await expect(box.getByRole('status')).toHaveText('Limit of 5 tags reached');
  });

  test('pasting a list splits it on commas and new lines', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = example(page, 0);
    const input = page.getByRole('textbox', { name: 'Send the invoice to' });
    await input.focus();
    await input.evaluate((el) => {
      const data = new DataTransfer();
      data.setData('text/plain', 'a@x.com, b@x.com\nc@x.com');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    });
    await expect(box.locator('.ui-tag')).toHaveCount(5);
    await expect(input).toHaveValue('');
  });

  test('Backspace highlights the last chip, then removes it; the x removes a chip', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = example(page, 0);
    const input = page.getByRole('textbox', { name: 'Send the invoice to' });
    await input.focus();
    await input.press('Backspace');
    await expect(box.locator('.ui-tag[data-highlighted]')).toHaveCount(1);
    await expect(box.locator('.ui-tag')).toHaveCount(2);
    await input.press('Backspace');
    await expect(box.locator('.ui-tag')).toHaveCount(1);
    await box.getByRole('button', { name: 'Remove ada@northwind.com' }).click();
    await expect(box.locator('.ui-tag')).toHaveCount(0);
    await expect(input).toBeFocused();
  });

  test('suggestions: typing filters, arrows and Enter add, Escape closes', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = example(page, 1);
    const input = page.getByRole('combobox', { name: 'Skills' });
    await input.focus();
    await input.pressSequentially('node');
    const list = page.getByRole('listbox', { name: 'Suggestions' });
    await expect(list.getByRole('option')).toHaveText(['Node.js']);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', /.+/);
    await input.press('Enter');
    await expect(box.locator('.ui-tag[data-tag-value="Node.js"]')).toBeVisible();

    // Skills already added are not suggested
    await input.fill('type');
    await expect(list).toBeHidden();
    await input.fill('');
    await input.press('ArrowDown');
    await expect(list).toBeVisible();
    await expect(list.getByRole('option', { name: 'React' })).toHaveCount(0);
    await input.press('Escape');
    await expect(list).toBeHidden();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking a suggestion adds it and keeps focus in the field', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = example(page, 1);
    const input = page.getByRole('combobox', { name: 'Skills' });
    await input.focus();
    await input.press('ArrowDown');
    await page.getByRole('option', { name: 'Figma' }).click();
    await expect(box.locator('.ui-tag[data-tag-value="Figma"]')).toBeVisible();
    await expect(input).toBeFocused();
  });

  test('heights: one row is 36px (md) and 44px (lg); the box grows when chips wrap', async ({ page }) => {
    await openDoc(page, PAGE);
    const md = example(page, 0).locator('.ui-tag-input');
    const lg = example(page, 1).locator('.ui-tag-input');
    expect(Math.round((await md.boundingBox())!.height)).toBe(36);
    expect(Math.round((await lg.boundingBox())!.height)).toBe(44);
    const input = page.getByRole('combobox', { name: 'Skills' });
    for (const skill of ['Accessibility', 'Design systems', 'GraphQL', 'PostgreSQL', 'User research']) {
      await input.fill(skill);
      await input.press('Enter');
    }
    expect((await lg.boundingBox())!.height).toBeGreaterThan(50);
  });

  test('focus draws the ring on the box', async ({ page }) => {
    await openDoc(page, PAGE);
    const box = example(page, 0).locator('.ui-tag-input');
    await page.getByRole('textbox', { name: 'Send the invoice to' }).focus();
    expect(await box.evaluate((e) => getComputedStyle(e).boxShadow)).not.toBe('none');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, '[role="tabpanel"]');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, '[role="tabpanel"]');
  });
});
