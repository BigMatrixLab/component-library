import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc } from './helpers';

const PATH = '/docs/foundations/themes';
const PACKS = ['neutral', 'stone', 'slate', 'soft', 'mono'];

/** Text/fill pairs every pack must keep at ≥ 4.5:1, in light and dark. */
const PAIRS: [string, string][] = [
  ['foreground', 'background'],
  ['foreground', 'surface'],
  ['foreground', 'surface-raised'],
  ['foreground', 'surface-muted'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'surface'],
  ['muted-foreground', 'surface-muted'],
  ['muted-foreground', 'accent'],
  ['primary-foreground', 'primary'],
  ['secondary-foreground', 'secondary'],
  ['accent-foreground', 'accent'],
  ['primary-text', 'background'],
  ['primary-text', 'surface'],
  ['control-glyph', 'control-on'],
  ['destructive-text', 'background'],
  ['destructive-text', 'surface-muted'],
  ['success-text', 'background'],
  ['success-text', 'surface-muted'],
  ['warning-text', 'background'],
  ['warning-text', 'surface-muted'],
  ['info-text', 'background'],
  ['info-text', 'surface-muted'],
  ['warning-foreground', 'warning'],
  ['sidebar-foreground', 'sidebar'],
];

const picker = (page: Page) => page.locator('main').getByRole('combobox', { name: 'Theme pack' });
const htmlVar = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

/** Resolve a CSS colour expression to rgb() via a probe element inside `scope`. */
async function colourIn(page: Page, scope: string, expr: string) {
  return page.evaluate(
    ([sel, value]) => {
      const host = sel === 'html' ? document.body : document.querySelector(sel)!;
      const probe = document.createElement('div');
      probe.style.background = value;
      host.append(probe);
      const out = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return out;
    },
    [scope, expr] as const,
  );
}

test.describe('Theme packs', () => {
  test('picking a pack sets data-theme and remaps the tokens', async ({ page }) => {
    const { errors } = await openDoc(page, PATH);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
    const neutralBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await picker(page).selectOption('stone');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'stone');
    expect(await htmlVar(page, '--ui-radius')).toBe('0.5rem');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(neutralBg);

    await picker(page).selectOption('neutral');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
    expect(await page.evaluate(() => localStorage.getItem('ui-theme-pack'))).toBe('neutral');
    expect(errors).toEqual([]);
  });

  test('the pack persists across a reload and is applied before the body renders', async ({ page }) => {
    // Record the attribute the moment <body> exists — before any paint of content
    await page.addInitScript(() => {
      const w = window as unknown as { __packAtBody?: string | null };
      new MutationObserver((_, obs) => {
        if (document.body) {
          w.__packAtBody = document.documentElement.getAttribute('data-theme');
          obs.disconnect();
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await openDoc(page, PATH);
    await picker(page).selectOption('slate');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'slate');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    expect(await page.evaluate(() => (window as unknown as { __packAtBody?: string | null }).__packAtBody)).toBe('slate');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'slate');
    await expect(picker(page)).toHaveValue('slate');
  });

  test('composes with dark mode and an accent on <html>', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ui-theme-pack', 'slate');
      localStorage.setItem('ui-theme-accent', 'violet');
    });
    await openDoc(page, PATH, { dark: true });
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    await expect(html).toHaveAttribute('data-theme', 'slate');
    await expect(html).toHaveAttribute('data-accent', 'violet');

    // Dark slate page, violet primary, violet-300 brand text
    expect(await colourIn(page, 'html', 'var(--ui-background)')).toBe(await colourIn(page, 'html', 'oklch(0.137 0.036 266)'));
    expect(await colourIn(page, 'html', 'var(--ui-primary)')).toBe(await colourIn(page, 'html', 'var(--ui-violet-600)'));
    expect(await colourIn(page, 'html', 'var(--ui-primary-text)')).toBe(await colourIn(page, 'html', 'var(--ui-violet-300)'));
    // A nested pack preview keeps the accent too
    const soft = '[data-pack-preview="soft-light"]';
    expect(await colourIn(page, soft, 'var(--ui-primary)')).toBe(await colourIn(page, 'html', 'var(--ui-violet-600)'));
    expect(await colourIn(page, soft, 'var(--ui-primary-text)')).toBe(await colourIn(page, 'html', 'var(--ui-violet-700)'));
  });

  test('previews stay in their own mode whatever the page mode is', async ({ page }) => {
    const read = () =>
      page.evaluate(() =>
        Object.fromEntries(
          [...document.querySelectorAll<HTMLElement>('[data-pack-preview]')].map((el) => [el.dataset.packPreview!, getComputedStyle(el).backgroundColor]),
        ),
      );
    await openDoc(page, PATH);
    const light = await read();
    await openDoc(page, PATH, { dark: true });
    const dark = await read();
    expect(Object.keys(light)).toHaveLength(PACKS.length * 2);
    expect(dark).toEqual(light);
    for (const p of PACKS) expect(light[`${p}-light`]).not.toBe(light[`${p}-dark`]);
  });

  test('radius and display face follow the pack on a subtree', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ui-theme-pack', 'mono'));
    await openDoc(page, PATH);
    const card = (p: string) => page.locator(`[data-pack-preview="${p}-light"] .ui-card`).first();
    const radius = async (p: string) => parseFloat(await card(p).evaluate((el) => getComputedStyle(el).borderTopLeftRadius));
    expect(await radius('soft')).toBeGreaterThan(await radius('neutral'));
    expect(await radius('neutral')).toBeGreaterThan(await radius('slate'));

    const face = (p: string) => card(p).locator('.ui-card-title').evaluate((el) => getComputedStyle(el).fontFamily);
    expect(await face('mono')).toMatch(/monospace|Menlo|Consolas/);
    // The site is on mono; nested packs take the sans face back
    expect(await face('stone')).not.toMatch(/ui-monospace/);
    expect(await face('neutral')).not.toMatch(/ui-monospace/);
  });

  test('every pack keeps text pairs at ≥ 4.5:1 in light and dark', async ({ page }) => {
    await openDoc(page, PATH);
    const failures = await page.evaluate(
      ({ packs, pairs }) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const rgb = (css: string) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = '#000';
          ctx.fillStyle = css;
          ctx.fillRect(0, 0, 1, 1);
          return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
        };
        const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        const host = document.createElement('div');
        document.body.append(host);
        const out: string[] = [];
        for (const pack of packs) {
          for (const mode of ['light', 'dark']) {
            host.setAttribute('data-theme', pack);
            host.className = mode === 'dark' ? 'dark' : '';
            if (mode === 'light') host.setAttribute('data-theme-mode', 'light');
            else host.removeAttribute('data-theme-mode');
            const cs = getComputedStyle(host);
            for (const [fg, bg] of pairs) {
              const a = lum(rgb(cs.getPropertyValue(`--ui-${fg}`).trim()));
              const b = lum(rgb(cs.getPropertyValue(`--ui-${bg}`).trim()));
              const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
              if (ratio < 4.5) out.push(`${pack} ${mode}: ${fg} on ${bg} = ${ratio.toFixed(2)}`);
            }
          }
        }
        host.remove();
        return out;
      },
      { packs: PACKS, pairs: PAIRS },
    );
    expect(failures).toEqual([]);
  });

  for (const dark of [false, true]) {
    test(`axe: no serious violations (${dark ? 'dark' : 'light'})`, async ({ page }) => {
      await openDoc(page, PATH, { dark });
      await expectNoA11yViolations(page, 'main');
    });
  }

  test('axe: no serious violations with a site-wide pack and accent', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ui-theme-pack', 'soft');
      localStorage.setItem('ui-theme-accent', 'amber');
    });
    await openDoc(page, PATH, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
