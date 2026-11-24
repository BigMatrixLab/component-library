import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGE = '/docs/blocks/onboarding';
const FILES = ['wizard', 'getting-started', 'split-welcome'] as const;
const block = (page: Page, file: (typeof FILES)[number]) => page.locator(`[data-example="blocks/onboarding/${file}"]`);

/** Horizontal overflow of the page and of every example preview, in px (0 = none). */
async function overflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const previews = [...document.querySelectorAll<HTMLElement>('[data-example]')].map((el) => ({
      file: el.dataset.example,
      over: el.scrollWidth - el.clientWidth,
    }));
    return { page: root.scrollWidth - root.clientWidth, previews: previews.filter((p) => p.over > 1) };
  });
}

/** Fill step 1 of the wizard and continue. */
async function passWorkspace(page: Page, name = 'Northwind Labs') {
  const wizard = block(page, 'wizard');
  await wizard.getByLabel('Workspace name').fill(name);
  await wizard.getByRole('button', { name: 'Continue' }).click();
  await expect(wizard.getByRole('heading', { name: 'Invite your teammates' })).toBeVisible();
}

test.describe('Onboarding block', () => {
  test('renders the three variants without errors', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    await settle(page);
    await expect(page.locator('[data-example^="blocks/onboarding/"]')).toHaveCount(3);
    await expect(block(page, 'wizard').getByRole('list', { name: 'Workspace setup' })).toBeVisible();
    await expect(block(page, 'getting-started').getByRole('region', { name: 'Get ready to ship' })).toBeVisible();
    await expect(block(page, 'split-welcome').getByText('Question 1 of 3')).toBeVisible();
    // Focus is not moved on first load
    await expect(block(page, 'wizard').getByRole('heading', { name: 'Create your workspace' })).not.toBeFocused();
    expect(errors).toEqual([]);
  });

  test.describe('Wizard', () => {
    test('validates the workspace step and focuses the first invalid field', async ({ page }) => {
      await openDoc(page, PAGE);
      const wizard = block(page, 'wizard');
      const name = wizard.getByLabel('Workspace name');
      const address = wizard.getByLabel('Workspace address');

      await wizard.getByRole('button', { name: 'Continue' }).click();
      await expect(wizard.getByText('Enter a workspace name of at least 2 characters.')).toBeVisible();
      await expect(name).toHaveAttribute('aria-invalid', 'true');
      await expect(name).toBeFocused();

      // The address follows the name until edited by hand
      await name.fill('Northwind Labs');
      await expect(address).toHaveValue('northwind-labs');
      await expect(wizard.getByText('Enter a workspace name of at least 2 characters.')).toHaveCount(0);

      await address.fill('acme');
      await wizard.getByRole('button', { name: 'Continue' }).click();
      await expect(wizard.getByText('halcyon.app/acme is taken. Try another address.')).toBeVisible();
      await expect(address).toBeFocused();
      await name.fill('Northwind Research');
      await expect(address).toHaveValue('acme');

      await address.fill('northwind');
      await address.press('Enter');
      const heading = wizard.getByRole('heading', { name: 'Invite your teammates' });
      await expect(heading).toBeVisible();
      await expect(heading).toBeFocused();
      await expect(wizard.getByText('Step 2 of 3')).toBeVisible();
      await expect(wizard.getByRole('button', { name: /Workspace/ })).toContainText('(completed)');
    });

    test('next and back keep values; later steps stay disabled', async ({ page }) => {
      await openDoc(page, PAGE);
      const wizard = block(page, 'wizard');
      await expect(wizard.getByRole('button', { name: /Team/ })).toBeDisabled();
      await expect(wizard.getByRole('button', { name: /Plan/ })).toBeDisabled();
      await passWorkspace(page);

      await wizard.getByRole('button', { name: 'Back' }).click();
      await expect(wizard.getByRole('heading', { name: 'Create your workspace' })).toBeFocused();
      await expect(wizard.getByLabel('Workspace name')).toHaveValue('Northwind Labs');
      await wizard.getByRole('button', { name: 'Continue' }).click();

      await wizard.getByRole('button', { name: 'Skip for now' }).click();
      await expect(wizard.getByRole('heading', { name: 'Pick a plan and a colour' })).toBeVisible();
      await expect(wizard.getByRole('radio', { name: /Pro/ })).toBeChecked();

      // A completed step in the stepper goes back
      await wizard.getByRole('button', { name: /Workspace/ }).click();
      await expect(wizard.getByRole('heading', { name: 'Create your workspace' })).toBeVisible();
      await expect(wizard.getByRole('button', { name: /Plan/ })).toBeDisabled();
    });

    test('invites: valid addresses become chips, an invalid one blocks Continue', async ({ page }) => {
      await openDoc(page, PAGE);
      const wizard = block(page, 'wizard');
      await passWorkspace(page);
      const invites = wizard.getByLabel('Email addresses');

      await invites.fill('ada@northwind.dev');
      await invites.press('Enter');
      await invites.fill('grace@northwind.dev,');
      await expect(wizard.getByRole('button', { name: 'Send 2 invites' })).toBeVisible();
      await expect(wizard.getByRole('button', { name: 'Skip for now' })).toHaveCount(0);

      await invites.fill('bob@');
      await wizard.getByRole('button', { name: 'Send 2 invites' }).click();
      await expect(wizard.locator('.ui-field-error')).toContainText('bob@ is not a valid email address');
      await expect(invites).toBeFocused();
      await expect(wizard.getByRole('heading', { name: 'Invite your teammates' })).toBeVisible();

      await invites.fill('');
      await wizard.getByRole('radio', { name: 'Admin' }).check();
      await wizard.getByRole('button', { name: 'Send 2 invites' }).click();
      await expect(wizard.getByRole('heading', { name: 'Pick a plan and a colour' })).toBeVisible();

      await wizard.getByRole('button', { name: 'Back' }).click();
      await expect(wizard.getByRole('button', { name: 'Send 2 invites' })).toBeVisible();
    });

    test('the accent previews on the block and the finish screen sums up', async ({ page }) => {
      await openDoc(page, PAGE);
      const wizard = block(page, 'wizard');
      await passWorkspace(page);
      await wizard.getByRole('button', { name: 'Continue' }).click();

      await wizard.getByRole('radio', { name: /Team/ }).check();
      await wizard.getByRole('radio', { name: 'Violet' }).check();
      await expect(wizard.locator('section')).toHaveAttribute('data-accent', 'violet');
      await wizard.getByRole('radio', { name: 'Default' }).check();
      await expect(wizard.locator('section')).not.toHaveAttribute('data-accent', /.*/);

      await wizard.getByRole('button', { name: 'Finish setup' }).click();
      const done = wizard.getByRole('heading', { name: 'Northwind Labs is ready' });
      await expect(done).toBeVisible();
      await expect(done).toBeFocused();
      await expect(wizard.getByText('Setup complete')).toBeVisible();
      await expect(wizard.getByText('Team, 14-day trial')).toBeVisible();
      await expect(wizard.getByText('halcyon.app/northwind-labs')).toBeVisible();
      await expect(wizard.locator('.ui-stepper-item[data-state="complete"]')).toHaveCount(3);

      await wizard.getByRole('button', { name: 'Change something' }).click();
      await expect(wizard.getByRole('heading', { name: 'Pick a plan and a colour' })).toBeVisible();
    });
  });

  test.describe('Getting started', () => {
    test('actions, the empty state and checkboxes all update the progress', async ({ page }) => {
      await openDoc(page, PAGE);
      const home = block(page, 'getting-started');
      const ring = home.getByRole('progressbar', { name: 'Setup progress' });
      await expect(ring).toHaveAttribute('aria-valuenow', '1');
      await expect(ring).toHaveAttribute('aria-valuemax', '5');

      const trial = home.getByRole('progressbar', { name: 'Trial used' });
      await expect(trial).toHaveAttribute('aria-valuetext', '2 of 14 trial days used');

      // The empty state's action ticks the checklist too
      await home.getByRole('button', { name: 'Deploy a template' }).click();
      await expect(ring).toHaveAttribute('aria-valuenow', '2');
      await expect(home.getByRole('checkbox', { name: 'Deploy your first project' })).toBeChecked();
      await expect(home.getByRole('list', { name: 'Recent deployments' })).toContainText('northwind-web');
      await expect(home.getByText('No deployments yet')).toHaveCount(0);

      await home.getByRole('button', { name: 'Invite', exact: true }).click();
      await expect(ring).toHaveAttribute('aria-valuenow', '3');
      await home.getByRole('checkbox', { name: 'Connect a Git repository' }).check();
      await expect(ring).toHaveAttribute('aria-valuenow', '4');
      await home.getByRole('checkbox', { name: 'Connect a Git repository' }).uncheck();
      await expect(ring).toHaveAttribute('aria-valuenow', '3');
      await home.getByRole('button', { name: 'Connect', exact: true }).click();
      await home.getByRole('button', { name: 'Add domain' }).click();
      await expect(ring).toHaveAttribute('aria-valuenow', '5');

      await expect(home.getByRole('heading', { name: 'You are ready to ship' })).toBeVisible();
      await home.getByRole('button', { name: 'Dismiss' }).click();
      await expect(home.getByText('Setup finished. Nice work.')).toBeVisible();
      await home.getByRole('button', { name: 'Show checklist' }).click();
      await expect(home.getByRole('heading', { name: 'You are ready to ship' })).toBeVisible();
    });

    test('quick links are a named navigation list', async ({ page }) => {
      await openDoc(page, PAGE);
      const nav = block(page, 'getting-started').getByRole('navigation', { name: 'Quick links' });
      await expect(nav.getByRole('link')).toHaveCount(4);
      await expect(nav.getByRole('link', { name: /Documentation/ })).toBeVisible();
    });
  });

  test.describe('Split welcome', () => {
    test('each question needs an answer; the progress follows', async ({ page }) => {
      await openDoc(page, PAGE);
      const split = block(page, 'split-welcome');
      const progress = split.getByRole('progressbar', { name: 'Personalisation progress' });
      await expect(progress).toHaveAttribute('aria-valuenow', '0');

      await split.getByRole('button', { name: 'Continue' }).click();
      await expect(split.getByRole('alert')).toHaveText('Choose one option to continue.');
      await expect(split.getByRole('radiogroup', { name: 'What best describes your work?' })).toHaveAttribute(
        'aria-invalid',
        'true',
      );
      await split.getByRole('radio', { name: 'Engineering' }).check();
      await expect(split.getByRole('alert')).toHaveCount(0);
      await split.getByRole('button', { name: 'Continue' }).click();

      await expect(split.getByText('Question 2 of 3')).toBeVisible();
      await expect(split.getByRole('heading', { name: 'How big is your team?' })).toBeFocused();
      await expect(progress).toHaveAttribute('aria-valuenow', '1');
      await split.getByRole('radio', { name: '2 to 10' }).check();
      await split.getByRole('button', { name: 'Continue' }).click();

      await expect(progress).toHaveAttribute('aria-valuenow', '2');
      await split.getByRole('button', { name: 'Finish' }).click();
      await expect(split.getByRole('alert')).toHaveText('Pick at least one so we know where to start.');
      await split.getByRole('checkbox', { name: 'Deploy an app' }).check();
      await split.getByRole('checkbox', { name: 'Monitor errors' }).check();
      await split.getByRole('button', { name: 'Finish' }).click();

      await expect(split.getByRole('heading', { name: 'Your workspace is tailored' })).toBeFocused();
      await expect(progress).toHaveAttribute('aria-valuenow', '3');
      const answers = split.getByRole('list', { name: 'Your answers' });
      await expect(answers.getByRole('listitem')).toHaveText(['Engineering', '2 to 10 people', 'Deploy an app', 'Monitor errors']);

      // Editing starts over with the answers kept
      await split.getByRole('button', { name: 'Edit answers' }).click();
      await expect(split.getByRole('radio', { name: 'Engineering' })).toBeChecked();
    });

    test('skip goes straight to the end', async ({ page }) => {
      await openDoc(page, PAGE);
      const split = block(page, 'split-welcome');
      await split.getByRole('button', { name: 'Skip for now' }).click();
      await expect(split.getByRole('heading', { name: 'Your workspace is tailored' })).toBeVisible();
      await expect(split.getByText(/We kept the standard dashboard/)).toBeVisible();
    });
  });

  test('nothing overflows horizontally at 360px, including later steps', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openDoc(page, PAGE);
    await settle(page);
    expect(await overflow(page)).toEqual({ page: 0, previews: [] });

    // Step 3 (plan cards, accent radios) and the finish summary
    await passWorkspace(page);
    await block(page, 'wizard').getByRole('button', { name: 'Skip for now' }).click();
    await settle(page);
    expect(await overflow(page)).toEqual({ page: 0, previews: [] });
    await block(page, 'wizard').getByRole('button', { name: 'Finish setup' }).click();
    await block(page, 'getting-started').getByRole('button', { name: 'Deploy a template' }).click();
    await block(page, 'split-welcome').getByRole('button', { name: 'Skip for now' }).click();
    await settle(page);
    expect(await overflow(page)).toEqual({ page: 0, previews: [] });
  });

  for (const dark of [false, true]) {
    test(`axe passes (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PAGE, { dark });
      await settle(page);
      for (const file of FILES) {
        await expectNoA11yViolations(page, `[data-example="blocks/onboarding/${file}"]`);
      }
      // The finish screens too
      await passWorkspace(page);
      await block(page, 'wizard').getByRole('button', { name: 'Skip for now' }).click();
      await block(page, 'wizard').getByRole('button', { name: 'Finish setup' }).click();
      await block(page, 'split-welcome').getByRole('button', { name: 'Skip for now' }).click();
      await settle(page);
      await expectNoA11yViolations(page, '[data-example="blocks/onboarding/wizard"]');
      await expectNoA11yViolations(page, '[data-example="blocks/onboarding/split-welcome"]');
    });
  }
});
