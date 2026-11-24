import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type Locator } from '@playwright/test';

/** Open a docs page with a fixed theme and collect console errors. */
export async function openDoc(page: Page, path: string, { dark = false } = {}) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.addInitScript((mode) => {
    try {
      localStorage.setItem('ui-theme-mode', mode);
    } catch {}
  }, dark ? 'dark' : 'light');
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // Not 'networkidle': the Next dev server keeps a hot-reload connection open
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  return { errors };
}

/** The preview panel of the n-th example on the page. */
export function example(page: Page, index: number): Locator {
  return page.locator('[role="tabpanel"]').nth(index);
}

/** axe-core scan of a region; fails on serious/critical violations. */
export async function expectNoA11yViolations(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

/** Wait until every animation in the document has finished. */
export async function settle(page: Page) {
  // Ignore infinite animations (spinners), which never finish
  await page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );
}
