// Compare an AI-generated example (apps/verify, port 4322) with our reference
// (docs, port 4321). Element by element: computed styles + pixel diff,
// light and dark, in Chromium and WebKit.
//
//   node scripts/prompt-verify/compare.mjs button/variants [--run=slug] [--out=dir]
//   (run slug defaults to "button-variants"; prepare it first with prepare.mjs)
//   Overlays: --click="Edit profile" --root=".ui-dialog-panel" --items=":scope, .ui-btn" --pin=off
//     clicks the button with that name on both pages first, then compares inside --root.
//
// Exit code 0 = pass, 1 = differences found.
import { chromium, webkit } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const [example, ...flags] = process.argv.slice(2);
if (!example) throw new Error('Usage: compare.mjs <component/example>');
const opts = Object.fromEntries(flags.map((f) => f.replace(/^--/, '').split('=')));
const outDir = resolve(opts.out ?? `test-results/prompt-verify/${example.replace('/', '-')}`);
await mkdir(outDir, { recursive: true });

const DOCS = 'http://localhost:4321';
const VERIFY = 'http://localhost:4322';
const PROPS = [
  'display', 'width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'gap',
  'border-top-width', 'border-top-color', 'border-top-left-radius', 'background-color', 'color',
  'font-size', 'font-weight', 'line-height', 'letter-spacing', 'box-shadow', 'opacity', 'cursor', 'text-decoration-line',
];
const PIXEL_TOLERANCE = 0.01; // 1% of pixels may differ (anti-aliasing)

async function snapshot(page, rootSelector, { pin = true, itemsSelector = ':scope > *' } = {}) {
  // Turn off animations and the docs dot pattern so both sides render the same way
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}[data-example]{background-image:none!important}' });
  // Pin both roots to the same integer position and layout, so sub-pixel
  // offsets from the surrounding page can't change how anything rasterises.
  if (pin) await page.addStyleTag({
    content: `${rootSelector}{position:fixed!important;top:0!important;left:0!important;width:1000px!important;min-height:0!important;margin:0!important;padding:40px!important;display:flex!important;flex-wrap:wrap!important;align-items:flex-start!important;justify-content:flex-start!important;gap:12px!important;z-index:2147483647!important;background:var(--ui-background)!important;will-change:transform}`,
  });
  const root = page.locator(rootSelector).first();
  await root.waitFor();
  const items = root.locator(itemsSelector);
  const count = await items.count();
  const out = [];
  for (let i = 0; i < count; i++) {
    const el = items.nth(i);
    const info = await el.evaluate((node, props) => {
      const cs = getComputedStyle(node);
      return {
        tag: node.tagName.toLowerCase(),
        text: (node.textContent || '').trim().slice(0, 40),
        className: node.getAttribute('class') || '',
        styles: Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)])),
      };
    }, PROPS);
    info.png = await el.screenshot();
    out.push(info);
  }
  return out;
}

function diffImages(a, b) {
  const A = PNG.sync.read(a);
  const B = PNG.sync.read(b);
  if (A.width !== B.width || A.height !== B.height) return { ratio: 1, note: `size ${A.width}x${A.height} vs ${B.width}x${B.height}`, png: null };
  const diff = new PNG({ width: A.width, height: A.height });
  const n = pixelmatch(A.data, B.data, diff.data, A.width, A.height, { threshold: 0.1 });
  return { ratio: n / (A.width * A.height), png: PNG.sync.write(diff) };
}

const results = [];
let failed = false;
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch();
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: theme, deviceScaleFactor: 1 });
    await ctx.addInitScript((t) => { try { localStorage.setItem('ui-theme-mode', t); } catch {} }, theme);
    const ref = await ctx.newPage();
    await ref.goto(`${DOCS}/docs/components/${example.split('/')[0]}`, { waitUntil: 'domcontentloaded' });
    await ref.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    const gen = await ctx.newPage();
    const run = opts.run ?? example.replace('/', '-');
    await gen.goto(`${VERIFY}/v/${run}?theme=${theme}`, { waitUntil: 'domcontentloaded' });
    await gen.waitForLoadState('load');

    const refRoot = opts.root ?? `[data-example="${example}"]`;
    const genRoot = opts.root ?? '[data-verify-preview]';
    if (opts.click) {
      for (const p of [ref, gen]) {
        await p.getByRole('button', { name: opts.click, exact: true }).first().click();
        await p.locator(genRoot).first().waitFor();
        await p.waitForTimeout(700); // let entrance animations finish
      }
    }
    const snapOpts = { pin: opts.pin !== 'off', itemsSelector: opts.items };
    const a = await snapshot(ref, refRoot, snapOpts);
    const b = await snapshot(gen, genRoot, snapOpts);
    const tag = `${engineName}-${theme}`;
    await writeFile(join(outDir, `${tag}-reference.png`), await ref.locator(refRoot).first().screenshot());
    await writeFile(join(outDir, `${tag}-generated.png`), await gen.locator(genRoot).first().screenshot());

    if (a.length !== b.length) {
      failed = true;
      results.push({ tag, element: '—', issue: `element count ${a.length} (reference) vs ${b.length} (generated)` });
    }
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const label = `${a[i].tag} "${a[i].text}"`;
      const styleDiffs = PROPS.filter((p) => a[i].styles[p] !== b[i].styles[p]).map((p) => `${p}: ${a[i].styles[p]} → ${b[i].styles[p]}`);
      const px = diffImages(a[i].png, b[i].png);
      if (px.png && px.ratio > PIXEL_TOLERANCE) await writeFile(join(outDir, `${tag}-${i}-diff.png`), px.png);
      const pass = styleDiffs.length === 0 && px.ratio <= PIXEL_TOLERANCE;
      if (!pass) failed = true;
      results.push({ tag, element: label, pixels: `${(px.ratio * 100).toFixed(2)}%${px.note ? ` (${px.note})` : ''}`, styles: styleDiffs, pass });
    }
    await ctx.close();
  }
  await browser.close();
}

const lines = [`# Prompt verification: ${example}`, '', `Result: **${failed ? 'FAIL' : 'PASS'}**`, '', '| Run | Element | Pixel diff | Style differences |', '|---|---|---|---|'];
for (const r of results) lines.push(`| ${r.tag} | ${r.element} | ${r.pixels ?? '—'} | ${r.issue ?? (r.styles?.length ? r.styles.join('<br>') : 'none')} |`);
await writeFile(join(outDir, 'report.md'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
console.log(`\nScreenshots and report: ${outDir}`);
process.exit(failed ? 1 : 0);
