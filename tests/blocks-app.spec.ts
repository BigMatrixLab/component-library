import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

/** The preview of one block example, found by its file (stable even when a block has its own tab panels). */
const block = (page: Page, file: string) => page.locator(`[data-example="${file}"]`);

const PAGES = ['/docs/blocks/auth', '/docs/blocks/settings', '/docs/blocks/pricing', '/docs/blocks/error-pages'];

test.describe('Blocks: every page renders and passes axe', () => {
  for (const path of PAGES) {
    for (const dark of [false, true]) {
      test(`${path} (${dark ? 'dark' : 'light'})`, async ({ page }) => {
        const { errors } = await openDoc(page, path, { dark });
        await expect(page.locator('[data-example^="blocks/"]').first()).toBeVisible();
        await settle(page);
        await expectNoA11yViolations(page, '[data-example^="blocks/"]');
        expect(errors).toEqual([]);
      });
    }
  }
});

test.describe('Auth', () => {
  const PATH = '/docs/blocks/auth';

  test('sign in: empty submit shows both errors and focuses email; valid submit welcomes back', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/auth/sign-in-split');
    await scope.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(scope.getByText('Enter your email address.')).toBeVisible();
    await expect(scope.getByText('Enter your password.')).toBeVisible();
    const email = scope.getByLabel('Work email');
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute('aria-invalid', 'true');

    await email.fill('ada@northwind');
    await expect(scope.getByText('Enter your email address.')).toHaveCount(0); // typing clears the error
    await scope.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(scope.getByText('Enter an email like name@company.com.')).toBeVisible();

    await email.fill('ada@northwind.com');
    await scope.getByLabel('Password', { exact: true }).fill('correct horse battery');
    await scope.getByRole('button', { name: 'Sign in', exact: true }).click();
    const welcome = scope.getByRole('heading', { name: 'Welcome back' });
    await expect(welcome).toBeVisible();
    await expect(welcome).toBeFocused();
    await expect(scope.getByText('ada@northwind.com')).toBeVisible();
  });

  test('sign in: brand panel shows only when the block is wide', async ({ page, isMobile }) => {
    await openDoc(page, PATH);
    const quote = block(page, 'blocks/auth/sign-in-split').locator('blockquote');
    if (isMobile) await expect(quote).toBeHidden();
    else await expect(quote).toBeVisible();
  });

  test('sign up: validation, then the code step verifies on the sixth digit', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/auth/sign-up-card');
    await scope.getByRole('button', { name: 'Create account' }).click();
    for (const msg of ['Enter your full name.', 'Enter your work email.', 'Use at least 8 characters, including a number.', 'Accept the terms to create an account.']) {
      await expect(scope.getByText(msg)).toBeVisible();
    }
    await expect(scope.getByLabel('Full name')).toBeFocused();

    await scope.getByLabel('Full name').fill('Ada Lovelace');
    await scope.getByLabel('Work email').fill('ada@northwind.com');
    await scope.getByLabel('Password', { exact: true }).fill('engines1843');
    await scope.getByRole('checkbox').check();
    await scope.getByRole('button', { name: 'Create account' }).click();

    await expect(scope.getByRole('heading', { name: 'Check your email' })).toBeVisible();
    const otp = scope.getByRole('textbox', { name: 'Verification code' });
    await expect(otp).toBeFocused();
    await expect(scope.getByRole('button', { name: 'Verify email' })).toBeDisabled();
    await expect(scope.getByText(/Resend code in 0:\d\d/)).toBeVisible();
    await otp.pressSequentially('123456');
    await expect(scope.getByRole('heading', { name: 'You’re all set' })).toBeVisible();
  });

  test('forgot password: validates, then confirms without revealing the account', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/auth/forgot-password');
    await scope.getByRole('button', { name: 'Send reset link' }).click();
    await expect(scope.getByText('Enter the email you signed up with.')).toBeVisible();
    await scope.getByLabel('Email').fill('ada@northwind.com');
    await scope.getByRole('button', { name: 'Send reset link' }).click();
    const heading = scope.getByRole('heading', { name: 'Check your inbox' });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expect(scope.getByText(/If an account exists for/)).toBeVisible();
    await scope.getByRole('button', { name: 'Try another email' }).click();
    await expect(scope.getByLabel('Email')).toHaveValue('ada@northwind.com');
  });

  test('reset password: strength follows the rules, mismatch is caught, success after a match', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/auth/reset-password');
    const bar = scope.getByRole('progressbar', { name: 'Password strength' });
    const input = scope.getByLabel('New password');
    await input.fill('abc12345');
    await expect(bar).toHaveAttribute('aria-valuetext', 'Too weak');
    await input.fill('Abcdefgh12');
    await expect(bar).toHaveAttribute('aria-valuetext', 'Good');
    await input.fill('Abcdefgh12!');
    await expect(bar).toHaveAttribute('aria-valuetext', 'Strong');
    await expect(scope.getByText('(not met)')).toHaveCount(0);

    await scope.getByLabel('Confirm new password').fill('Abcdefgh12?');
    await scope.getByRole('button', { name: 'Update password' }).click();
    await expect(scope.getByText('Passwords don’t match.')).toBeVisible();
    await expect(scope.getByLabel('Confirm new password')).toBeFocused();
    await scope.getByLabel('Confirm new password').fill('Abcdefgh12!');
    await scope.getByRole('button', { name: 'Update password' }).click();
    await expect(scope.getByRole('heading', { name: 'Password updated' })).toBeVisible();
  });
});

test.describe('Settings', () => {
  const PATH = '/docs/blocks/settings';
  const FILE = 'blocks/settings/sidebar-tabs';

  test('tabs are vertical when wide and a horizontal row on phones', async ({ page, isMobile }) => {
    await openDoc(page, PATH);
    const list = block(page, FILE).getByRole('tablist', { name: 'Settings sections' });
    await expect(list).toHaveAttribute('aria-orientation', isMobile ? 'horizontal' : 'vertical');
    const [a, b] = await Promise.all(['Account', 'Notifications'].map((n) => list.getByRole('tab', { name: n }).boundingBox()));
    if (isMobile) expect(Math.abs(a!.y - b!.y)).toBeLessThanOrEqual(1);
    else expect(b!.y).toBeGreaterThan(a!.y + 10);
  });

  test('switching tabs shows each panel', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, FILE);
    for (const [tab, heading] of [
      ['Notifications', 'Notifications'],
      ['Billing', 'Billing'],
      ['Danger zone', 'Danger zone'],
      ['Account', 'Profile'],
    ]) {
      await scope.getByRole('tab', { name: tab }).click();
      await expect(scope.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
      await expect(scope.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    }
  });

  test('account: an empty name is rejected, a valid save shows Saved', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, FILE);
    const name = scope.getByLabel('Full name');
    await name.fill('');
    await scope.getByRole('button', { name: 'Save changes' }).click();
    await expect(scope.getByText(/Enter your name/)).toBeVisible();
    await expect(name).toBeFocused();
    await name.fill('Ada King');
    await scope.getByRole('button', { name: 'Save changes' }).click();
    await expect(scope.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
  });

  test('danger zone: delete stays disabled until the workspace name is typed', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, FILE);
    await scope.getByRole('tab', { name: 'Danger zone' }).click();
    await scope.getByRole('button', { name: 'Delete workspace' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    const confirm = dialog.getByRole('button', { name: 'Delete workspace' });
    await expect(confirm).toBeDisabled();
    await dialog.getByRole('textbox').fill('northwind');
    await expect(confirm).toBeDisabled();
    await dialog.getByRole('textbox').fill('northwind-finance');
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(dialog).toBeHidden();
    await expect(scope.getByText('Workspace scheduled for deletion')).toBeVisible();
  });
});

test.describe('Pricing', () => {
  const PATH = '/docs/blocks/pricing';

  test('yearly switch changes prices and billing notes', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/pricing/tiers');
    const pro = scope.locator('[data-plan="pro"]');
    await expect(pro.locator('.ui-number-sr')).toHaveText('$24');
    await expect(pro.locator('[data-billing-note]')).toHaveText('per seat / month, billed monthly');
    await scope.getByRole('radio', { name: 'Yearly' }).click();
    await expect(scope.getByRole('radio', { name: 'Yearly' })).toHaveAttribute('aria-checked', 'true');
    await expect(pro.locator('.ui-number-sr')).toHaveText('$19');
    await expect(pro.locator('[data-billing-note]')).toHaveText('per seat / month, billed yearly ($228)');
    await expect(scope.locator('[data-plan="business"] .ui-number-sr')).toHaveText('$39');
    await expect(scope.locator('[data-plan="starter"] [data-billing-note]')).toHaveText('Free forever, no card needed');
    await scope.getByRole('radio', { name: 'Monthly' }).click();
    await expect(pro.locator('.ui-number-sr')).toHaveText('$24');
  });

  test('exactly one plan is highlighted', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/pricing/tiers');
    await expect(scope.getByText('Most popular')).toHaveCount(1);
    await expect(scope.locator('[data-plan="pro"]').getByText('Most popular')).toBeVisible();
  });

  test('cards stack on phones and sit in a row on desktop', async ({ page, isMobile }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/pricing/tiers');
    const [a, b] = await Promise.all(['starter', 'pro'].map((id) => scope.locator(`[data-plan="${id}"]`).boundingBox()));
    if (isMobile) expect(b!.y).toBeGreaterThan(a!.y + a!.height - 1);
    else expect(Math.abs(a!.y - b!.y)).toBeLessThanOrEqual(1);
  });

  test('comparison table names its icons and scrolls sideways on phones', async ({ page, isMobile }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/pricing/comparison');
    const region = scope.getByRole('region', { name: 'Plan comparison' });
    await expect(region).toBeVisible();
    expect(await region.getByRole('img', { name: 'Included' }).count()).toBeGreaterThan(5);
    expect(await region.getByRole('img', { name: 'Not included' }).count()).toBeGreaterThan(5);
    await expect(region.getByRole('rowheader', { name: 'SAML single sign-on' })).toBeVisible();
    if (isMobile) {
      const overflow = await region.evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(overflow).toBeGreaterThan(0);
      // The feature column stays pinned while the table scrolls
      const cell = region.getByRole('rowheader', { name: 'Seats' });
      const before = (await cell.boundingBox())!.x;
      await region.evaluate((el) => el.scrollTo({ left: 200 }));
      expect(Math.abs((await cell.boundingBox())!.x - before)).toBeLessThanOrEqual(1);
    }
  });

  test('FAQ: first answer open, opening another closes it', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/pricing/faq');
    const first = scope.getByRole('button', { name: 'How does the 14-day trial work?' });
    const second = scope.getByRole('button', { name: 'What counts as a seat?' });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(scope.getByText(/read-only guests are free/)).toBeVisible();
  });
});

test.describe('Error pages', () => {
  const PATH = '/docs/blocks/error-pages';

  test('404: empty search shows an error; a query filters the popular pages', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/error-pages/not-found');
    await expect(scope.getByRole('heading', { level: 1, name: 'We can’t find that page' })).toBeVisible();
    await expect(scope.getByRole('heading', { name: 'Popular pages' })).toBeVisible();
    const search = scope.getByRole('search');
    await search.getByRole('button', { name: 'Search' }).click();
    await expect(scope.getByText('Type what you were looking for.')).toBeVisible();
    await expect(search.getByRole('searchbox', { name: 'Search Lumen' })).toBeFocused();
    await search.getByRole('searchbox', { name: 'Search Lumen' }).fill('invoice');
    await search.getByRole('button', { name: 'Search' }).click();
    await expect(scope.getByRole('heading', { name: 'Results for “invoice”' })).toBeVisible();
    await expect(scope.getByRole('listitem')).toHaveCount(1);
    await expect(scope.getByRole('link', { name: /Invoices/ })).toBeVisible();
    await expect(scope.getByRole('link', { name: /Back to home/ })).toBeVisible();
  });

  test('500: first retry still fails, the second recovers', async ({ page }) => {
    await openDoc(page, PATH);
    const scope = block(page, 'blocks/error-pages/server-error');
    const retry = scope.getByRole('button', { name: 'Try again' });
    await retry.click();
    await expect(retry).toHaveAttribute('aria-busy', 'true');
    await expect(scope.getByText(/Still not loading/)).toBeVisible();
    await retry.click();
    await expect(scope.getByText(/We’re back/)).toBeVisible();
    await expect(retry).toBeDisabled();
    await expect(scope.getByRole('button', { name: 'Copy error ID' })).toBeVisible();
    await expect(scope.getByText('err_7f3a91c2e04b')).toBeVisible();
  });
});
