import { expect, test } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/onboarding-checklist';

test.describe('Onboarding checklist', () => {
  test('renders a named section, a progress ring and an ordered list of steps', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const panel = example(page, 0);
    await expect(panel.getByRole('region', { name: 'Set up your workspace' })).toBeVisible();
    const ring = panel.getByRole('progressbar', { name: 'Setup progress' });
    await expect(ring).toHaveAttribute('aria-valuenow', '1');
    await expect(ring).toHaveAttribute('aria-valuemax', '5');
    await expect(ring).toHaveAttribute('aria-valuetext', '1 of 5 steps complete');
    await expect(ring).toContainText('1/5');
    await expect(panel.locator('ol > li')).toHaveCount(5);
    await expect(panel.getByRole('checkbox', { name: 'Create your workspace' })).toBeChecked();
    await expect(panel.locator('li[data-current]')).toContainText('Invite your team');
    expect(errors).toEqual([]);
  });

  test('ticking a step updates progress; the title toggles it too', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    const ring = panel.getByRole('progressbar', { name: 'Setup progress' });
    const team = panel.getByRole('checkbox', { name: 'Invite your team' });
    await expect(team).toHaveAccessibleDescription('Teammates get access to every project.');
    await team.check();
    await expect(ring).toHaveAttribute('aria-valuenow', '2');
    await expect(ring).toContainText('2/5');
    const step = panel.locator('li').filter({ hasText: 'Invite your team' });
    await expect(step).toHaveAttribute('data-state', 'complete');
    // The action goes away once the step is done
    await expect(step.getByRole('button', { name: 'Invite' })).toHaveCount(0);
    // Clicking the title (its label) unticks it
    await panel.getByText('Invite your team', { exact: true }).click();
    await expect(team).not.toBeChecked();
    await expect(ring).toHaveAttribute('aria-valuenow', '1');
    // Space on the focused checkbox ticks it
    await team.focus();
    await page.keyboard.press('Space');
    await expect(team).toBeChecked();
  });

  test('the header button collapses and expands the steps', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    const toggle = panel.getByRole('button', { name: 'Set up your workspace' });
    const list = panel.locator('.ui-onboarding-checklist-body');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-controls', (await list.getAttribute('id'))!);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(list).toBeHidden();
    await toggle.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(list).toBeVisible();
  });

  test('completing every step celebrates once and announces it', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 0);
    const card = panel.locator('.ui-onboarding-checklist');
    for (const name of ['Invite your team', 'Connect a repository', 'Add a payment method', 'Deploy your first project']) {
      await panel.getByRole('checkbox', { name }).check();
    }
    await expect(card).toHaveAttribute('data-complete', '');
    await expect(card).toHaveAttribute('data-celebrate', '');
    await expect(panel.getByRole('heading', { name: 'Your workspace is ready' })).toBeVisible();
    await expect(panel.getByRole('status')).toHaveText('All steps complete');
    const ring = panel.getByRole('progressbar', { name: 'Setup progress' });
    await expect(ring).toHaveAttribute('aria-valuenow', '5');
    await expect(ring.locator('.ui-onboarding-checklist-ring-check')).toBeVisible();
    // The celebration flag clears itself
    await expect(card).not.toHaveAttribute('data-celebrate', /.*/, { timeout: 3000 });
    // Unticking leaves the finished state
    await panel.getByRole('checkbox', { name: 'Deploy your first project' }).uncheck();
    await expect(card).not.toHaveAttribute('data-complete', /.*/);
    await expect(panel.getByRole('heading', { name: 'Set up your workspace' })).toBeVisible();
  });

  test('app-driven: no checkboxes, a bar, and a dismiss button when done', async ({ page }) => {
    await openDoc(page, PAGE);
    const panel = example(page, 1);
    await expect(panel.getByRole('checkbox')).toHaveCount(0);
    const bar = panel.getByRole('progressbar', { name: 'Setup progress' });
    await expect(bar).toHaveAttribute('aria-valuenow', '1');
    await expect(bar).toHaveClass(/\bui-progress\b/);
    await expect(panel.locator('li').first()).toContainText('(Completed)');
    for (const name of ['Add card', 'Connect', 'Publish']) {
      await panel.getByRole('button', { name, exact: true }).click();
    }
    await expect(bar).toHaveAttribute('aria-valuenow', '4');
    await expect(panel.getByRole('heading', { name: 'Your store is live' })).toBeVisible();
    await panel.getByRole('button', { name: 'Dismiss', exact: true }).click();
    await expect(panel.getByText('Checklist dismissed.')).toBeVisible();
    await panel.getByRole('button', { name: 'Start over' }).click();
    await expect(panel.getByRole('progressbar', { name: 'Setup progress' })).toHaveAttribute('aria-valuenow', '1');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
