// Helpers for scripts/gen-ai-docs.mjs (the copy-paste install docs in ai/).
// Zero dependencies: node:fs + node:path only. Import-graph basics come from source.mjs.
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { UI_SRC, importsOf, read, readRepo, repoRoot, toSrc } from './source.mjs';

/* ---------------------------------------------------------------------------
   Where the docs live on GitHub. Change these two if the repo moves. */

export const GH_REPO = 'BigMatrixLab/component-library';
export const GH_BRANCH = 'main';
export const ghUrl = (path) => `https://github.com/${GH_REPO}/blob/${GH_BRANCH}/${path}`;
export const rawUrl = (path) => `https://raw.githubusercontent.com/${GH_REPO}/${GH_BRANCH}/${path}`;
/** Raw URL of a library file, from its packages/ui/src-relative path. */
export const srcRawUrl = (srcPath) => rawUrl(`packages/ui/src/${srcPath}`);

/** Folder the files go into, relative to the folder the `@/` alias points to. */
export const TARGET = 'ui';
export const target = (srcPath) => `${TARGET}/${srcPath}`;

/* ---------------------------------------------------------------------------
   Text */

/** Normalise line endings so output is identical on Windows and Linux checkouts. */
export const lf = (s) => s.replace(/\r\n?/g, '\n');
export const readSrc = (srcPath) => lf(read(join(UI_SRC, srcPath)));
export const readRepoLf = (path) => lf(readRepo(path));

const LANGS = { css: 'css', tsx: 'tsx', ts: 'ts', sh: 'sh', json: 'json', txt: 'text' };
const langOf = (path) => LANGS[path.split('.').pop()] ?? '';

/** Fenced code block, long enough to survive backticks inside the code. */
export function fence(path, code) {
  const longest = Math.max(0, ...[...code.matchAll(/`+/g)].map((m) => m[0].length));
  const ticks = '`'.repeat(Math.max(3, longest + 1));
  return `${ticks}${langOf(path)}\n${code.replace(/\n+$/, '')}\n${ticks}`;
}

/** A file section: "#### `ui/…`" + its full contents. */
export const fileBlock = (path, code, level = '###') => `${level} \`${path}\`\n\n${fence(path, code)}`;

/** Push every Markdown heading down `by` levels (outside code fences). */
export function demote(md, by = 1) {
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      if (inFence || !/^#{1,5}\s/.test(line)) return line;
      return '#'.repeat(by) + line;
    })
    .join('\n');
}

/** Join lines, dropping null/false, and squeeze blank runs. */
export const lines = (...xs) =>
  xs
    .flat(Infinity)
    .filter((x) => x !== null && x !== false && x !== undefined)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

/* ---------------------------------------------------------------------------
   Helper-file closure (lib/, hooks/, icons/, theme/): every non-component file
   reachable from the given files. Component folders are reported, not walked. */

const isCode = (f) => /\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f) && !/\.test\.tsx?$/.test(f);
function resolveSpec(fromAbs, spec) {
  const base = join(dirname(fromAbs), spec);
  for (const c of [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (existsSync(c) && isCode(c)) return c;
  }
  return null;
}

export function helperClosure(srcPaths) {
  const files = new Set();
  const components = new Set();
  const walk = (abs) => {
    const rel = toSrc(abs);
    const comp = rel.match(/^components\/([^/]+)\//)?.[1];
    if (comp) return void components.add(comp);
    if (files.has(rel)) return;
    files.add(rel);
    for (const spec of importsOf(abs).rel) {
      const next = resolveSpec(abs, spec);
      if (next && next.startsWith(UI_SRC)) walk(next);
    }
  };
  for (const p of srcPaths) walk(join(UI_SRC, p));
  return { files: [...files].sort(), components: [...components].sort() };
}

/* ---------------------------------------------------------------------------
   CSS: the setup files are the non-component @imports of kit.css, followed
   recursively (themes.css pulls in themes/*.css). */

export function setupCss() {
  const out = [];
  const visit = (srcPath) => {
    if (out.includes(srcPath)) return;
    const css = readSrc(srcPath);
    for (const m of css.matchAll(/@import\s+["']\.\/([^"']+)["']/g)) {
      const child = toSrc(join(UI_SRC, dirname(srcPath), m[1]));
      if (!child.startsWith('styles/components/') && existsSync(join(UI_SRC, child))) visit(child);
    }
    if (srcPath !== 'styles/kit.css') out.push(srcPath);
  };
  visit('styles/kit.css');
  return out;
}

/* ---------------------------------------------------------------------------
   Public names → the module that defines them, so a docs example's
   `from 'ui-kit'` import can be rewritten to per-file `@/ui/...` imports. */

const TYPE_RE = /export\s+(?:declare\s+)?(?:type|interface|enum)\s+([A-Za-z0-9_]+)/g;
const LIST_RE = /export\s+(?:type\s+)?\{([^}]+)\}/g;

function namesIn(src) {
  const names = new Set();
  for (const m of src.matchAll(TYPE_RE)) names.add(m[1]);
  for (const m of src.matchAll(LIST_RE)) {
    for (const part of m[1].split(',')) {
      const p = part.trim().replace(/^type\s+/, '');
      if (p) names.add(p.split(/\s+as\s+/).pop().trim());
    }
  }
  return names;
}

/** Map<name, module> where module is a src path without extension ("components/button", "icons/icon"). */
export function exportMap(graphs) {
  const map = new Map();
  const add = (name, mod) => {
    if (!map.has(name)) map.set(name, mod);
  };
  // Non-component modules, from the package's public index
  const index = readSrc('index.ts');
  for (const m of index.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}\s*from\s*['"]\.\/([^'"]+)['"]/g)) {
    for (const part of m[1].split(',')) {
      const p = part.trim().replace(/^type\s+/, '');
      if (p) add(p.split(/\s+as\s+/).pop().trim(), m[2]);
    }
  }
  // Components: value exports from the graph, type exports from their files
  for (const g of graphs) {
    const mod = `components/${g.name}`;
    for (const n of g.exports) add(n, mod);
    for (const f of g.files) for (const n of namesIn(readSrc(f))) add(n, mod);
  }
  return map;
}

/**
 * Rewrite `import { A, type B } from 'ui-kit'` (single or multi-line) into
 * one import per module under `@/ui/...`. Returns the code, the components
 * the example uses and the non-component modules (src paths) it imports.
 */
export function rewriteExample(code, map) {
  const components = new Set();
  const modules = new Set();
  const unknown = [];
  const out = code.replace(/import\s+(type\s+)?\{([^}]+)\}\s*from\s*['"]ui-kit['"];?/g, (_, allType, list) => {
    const byMod = new Map();
    for (const raw of list.split(',')) {
      const spec = raw.trim();
      if (!spec) continue;
      const name = spec.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
      const mod = map.get(name);
      if (!mod) unknown.push(name);
      const key = mod ?? 'index';
      if (!byMod.has(key)) byMod.set(key, []);
      byMod.get(key).push(allType ? `type ${spec}` : spec);
      if (mod?.startsWith('components/')) components.add(mod.slice('components/'.length));
      else if (mod) modules.add(mod);
    }
    return [...byMod.keys()]
      .sort()
      .map((mod) => `import { ${byMod.get(mod).join(', ')} } from '@/${TARGET}/${mod}';`)
      .join('\n');
  });
  return { code: out, components: [...components].sort(), modules: [...modules].sort(), unknown };
}

/** Src path of a non-component module ("icons/icon" → "icons/icon.tsx"). */
export function moduleFile(mod) {
  for (const ext of ['.ts', '.tsx']) if (existsSync(join(UI_SRC, `${mod}${ext}`))) return `${mod}${ext}`;
  return null;
}

/* ---------------------------------------------------------------------------
   Docs examples, in the order the docs page shows them. Falls back to the
   folder listing (sorted) for any file the page does not mention. */

export function examplesFor(slug, pagePath) {
  const dir = join(repoRoot, 'apps', 'docs', 'examples', ...slug.split('/'));
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx')).sort();
  const ordered = [];
  const page = join(repoRoot, pagePath);
  if (existsSync(page)) {
    for (const m of lf(read(page)).matchAll(/<Example\b[^>]*>/g)) {
      const file = m[0].match(/\bfile="([^"]+)"/)?.[1];
      const title = m[0].match(/\btitle="([^"]+)"/)?.[1] ?? null;
      const base = file?.startsWith(`${slug}/`) ? file.slice(slug.length + 1) : null;
      if (base && files.includes(`${base}.tsx`) && !ordered.some((o) => o.base === base)) ordered.push({ base, title });
    }
  }
  for (const f of files) {
    const base = f.replace(/\.tsx$/, '');
    if (!ordered.some((o) => o.base === base)) ordered.push({ base, title: null });
  }
  return ordered.map((o) => ({ ...o, path: `apps/docs/examples/${slug}/${o.base}.tsx` }));
}
