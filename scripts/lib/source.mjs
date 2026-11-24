// Shared helpers for the distribution scripts (gen-registry, gen-llms).
// Zero dependencies: node:fs + node:path only.
//
// The import-graph logic mirrors apps/docs/lib/component-graph.ts: what a
// component needs is worked out from its source imports, never listed by hand.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const UI_SRC = join(repoRoot, 'packages', 'ui', 'src');
export const toPosix = (p) => p.split('\\').join('/');
/** Path relative to packages/ui/src, e.g. "components/button/button.tsx". */
export const toSrc = (abs) => toPosix(relative(UI_SRC, abs));
export const read = (abs) => readFileSync(abs, 'utf8');
export const readRepo = (path) => read(join(repoRoot, path));

/* ---------------------------------------------------------------------------
   Naming and URLs. The npm name (decision D8) is read from
   packages/ui/package.json so there is exactly one place to change it.
   The site URL comes from the environment; the placeholder is obvious. */

const uiPkg = JSON.parse(read(join(repoRoot, 'packages', 'ui', 'package.json')));
export const PKG_NAME = uiPkg.name;
export const PKG_VERSION = uiPkg.version;
export const PKG_DESCRIPTION = uiPkg.description ?? '';
export const SITE_URL = (process.env.UI_SITE_URL || 'https://ui-kit.example.com').replace(/\/+$/, '');

/* ---------------------------------------------------------------------------
   Import graph */

// Statement-level only: `[^'";=(]` keeps a match inside one import/export clause
const IMPORT_RE = /^\s*(?:import|export)\s[^'";=(]*?from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm;
const isTest = (f) => /\.test\.tsx?$/.test(f);
const isCode = (f) => /\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f);

/** Strip comments so specifiers inside them ("from today") are not matched. */
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');

function resolveImport(fromFile, spec) {
  const base = join(dirname(fromFile), spec);
  for (const c of [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx'), base]) {
    if (existsSync(c) && isCode(c)) return c;
  }
  return null;
}

/** Relative and bare import specifiers of one file. */
export function importsOf(file) {
  const rel = [];
  const bare = [];
  for (const m of stripComments(read(file)).matchAll(IMPORT_RE)) {
    const spec = m[1] ?? m[2];
    if (spec.startsWith('.')) rel.push(spec);
    else bare.push(spec);
  }
  return { rel, bare };
}

/** npm package name of a bare specifier ("@scope/pkg/sub" → "@scope/pkg"). */
const pkgOf = (spec) => (spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
const PEERS = new Set(['react', 'react-dom']);

/** Every component folder (has an index.ts/tsx), sorted. */
export function componentNames() {
  const dir = join(UI_SRC, 'components');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => existsSync(join(dir, n, 'index.ts')) || existsSync(join(dir, n, 'index.tsx')))
    .sort();
}

const componentOf = (abs) => toSrc(abs).match(/^components\/([^/]+)\//)?.[1] ?? null;
const EXPORT_RE = /export\s+(?:const|function|class|let)\s+([A-Za-z0-9_]+)/g;
const REEXPORT_RE = /export\s*\{([^}]+)\}\s*from/g;

/**
 * What one component needs, from its imports:
 *  - files:        its own folder (index included, tests excluded)
 *  - helpers:      shared lib/hooks/icons/theme files reachable from it
 *  - components:   other components it imports (installed as their own items)
 *  - css:          its own stylesheet, if any
 *  - dependencies: npm packages it imports (React excluded: a peer)
 *  - exports:      public names (for docs and llms)
 */
export function componentGraph(name) {
  const dir = join(UI_SRC, 'components', name);
  if (!existsSync(dir)) return null;
  const own = readdirSync(dir)
    .filter((f) => isCode(f) && !isTest(f))
    .map((f) => join(dir, f));
  if (!own.length) return null;

  const seen = new Set();
  const components = new Set();
  const dependencies = new Set();
  const walk = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const { rel, bare } = importsOf(file);
    for (const spec of bare) if (!PEERS.has(pkgOf(spec))) dependencies.add(pkgOf(spec));
    for (const spec of rel) {
      const next = resolveImport(file, spec);
      if (!next || !next.startsWith(UI_SRC) || isTest(next)) continue;
      const other = componentOf(next);
      // Another component's files come with that component's own item
      if (other && other !== name) components.add(other);
      else walk(next);
    }
  };
  own.forEach(walk);

  const files = [...seen].filter((f) => f.startsWith(dir)).map(toSrc).sort();
  const helpers = [...seen].filter((f) => !f.startsWith(dir)).map(toSrc).sort();
  const cssPath = join(UI_SRC, 'styles', 'components', `${name}.css`);

  return {
    name,
    files,
    helpers,
    components: [...components].sort(),
    css: existsSync(cssPath) ? toSrc(cssPath) : null,
    dependencies: [...dependencies].sort(),
    exports: publicExports(dir),
  };
}

/** Value exports (not types) of a component's index, following `export *` and `export { }`. */
function publicExports(dir) {
  const index = ['index.ts', 'index.tsx'].map((f) => join(dir, f)).find(existsSync);
  const names = new Set();
  const visit = (file, depth) => {
    const src = stripComments(read(file));
    for (const m of src.matchAll(EXPORT_RE)) names.add(m[1]);
    for (const m of src.matchAll(REEXPORT_RE)) {
      for (const part of m[1].split(',')) {
        const p = part.trim();
        if (!p || /^type\s/.test(p)) continue;
        names.add(p.split(/\s+as\s+/).pop().trim());
      }
    }
    if (depth > 2) return;
    for (const m of src.matchAll(/export\s*\*\s*from\s*['"](\.[^'"]+)['"]/g)) {
      const next = resolveImport(file, m[1]);
      if (next) visit(next, depth + 1);
    }
  };
  if (index) visit(index, 0);
  return [...names].filter((n) => n !== 'default').sort();
}

/* ---------------------------------------------------------------------------
   Prompts (specs) and docs nav */

/** Token/motion files every system prompt carries, from apps/docs/lib/prompt-sources.ts. */
export function systemSources() {
  const src = readRepo('apps/docs/lib/prompt-sources.ts');
  return [...src.matchAll(/'(packages\/ui\/src\/styles\/[^']+\.css)'/g)].map((m) => m[1]);
}

/** Spec files: [{ kind: 'components'|'blocks', name, path }], sorted. */
export function specFiles() {
  const out = [];
  for (const kind of ['components', 'blocks']) {
    const dir = join(repoRoot, 'prompts', kind);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
      out.push({ kind, name: f.replace(/\.md$/, ''), path: `prompts/${kind}/${f}` });
    }
  }
  return out;
}

/** Title + one-line summary from a spec: "## Component: Button" and its first paragraph. */
export function specSummary(md) {
  const heading = md.match(/^##\s+(?:[A-Za-z ]+:\s*)?(.+)$/m)?.[1]?.trim() ?? null;
  const body = md.replace(/^##[^\n]*\n/, '').trim();
  const para = body.split(/\n\s*\n/).find((p) => p.trim() && !p.trim().startsWith('#')) ?? '';
  const flat = para.replace(/\s+/g, ' ').trim();
  const first = flat.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? flat;
  return { title: heading, description: first };
}

/** Docs nav from apps/docs/lib/registry.ts: slug → { title, description, url, soon }. */
export function docsNav() {
  const map = new Map();
  const file = join(repoRoot, 'apps', 'docs', 'lib', 'registry.ts');
  if (!existsSync(file)) return map;
  let base = '';
  const str = (key, line) => line.match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`))?.[1]?.replace(/\\'/g, "'");
  for (const line of read(file).split('\n')) {
    const b = str('base', line);
    if (b !== undefined) base = b;
    const slug = str('slug', line);
    if (!slug) continue;
    map.set(slug, {
      title: str('title', line) ?? slug,
      description: str('description', line) ?? '',
      url: `${base}/${slug}`,
      soon: /soon:\s*true/.test(line),
    });
  }
  return map;
}

export const titleCase = (s) => s.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
