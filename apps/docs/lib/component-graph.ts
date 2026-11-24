import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { repoRoot } from './source';

/* Works out, from the source itself, which files a component needs: its own
   folder and CSS, plus every library file it imports (recursively). Prompts
   built from this can't miss a helper or drift from the code. */

const UI_SRC = join(repoRoot, 'packages', 'ui', 'src');
const toRepo = (abs: string) => relative(repoRoot, abs).split('\\').join('/');

const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]/g;

function resolveImport(fromFile: string, spec: string): string | null {
  const base = join(dirname(fromFile), spec);
  for (const candidate of [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx'), base]) {
    if (existsSync(candidate) && /\.(ts|tsx)$/.test(candidate)) return candidate;
  }
  return null;
}

/** All library files (absolute paths) reachable from `entry` via relative imports. */
async function collect(entry: string, seen = new Set<string>()): Promise<Set<string>> {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const src = await readFile(entry, 'utf8');
  for (const m of src.matchAll(IMPORT_RE)) {
    const next = resolveImport(entry, m[1]!);
    if (next && next.startsWith(UI_SRC)) await collect(next, seen);
  }
  return seen;
}

export interface ComponentGraph {
  /** Component name, e.g. "dialog". */
  name: string;
  /** TS/TSX files of the component itself (excluding index files and tests). */
  componentFiles: string[];
  /** Shared library files it imports (lib, hooks, icons, other components). */
  helperFiles: string[];
  /** CSS files: its own plus those of other components it imports. */
  cssFiles: string[];
  /** Public export names (to detect which components an example uses). */
  exports: string[];
}

const EXPORT_RE = /export\s+(?:const|function|class|let)\s+([A-Za-z0-9_]+)/g;

export async function componentGraph(name: string): Promise<ComponentGraph | null> {
  const dir = join(UI_SRC, 'components', name);
  if (!existsSync(dir)) return null;
  const own = (await readdir(dir))
    .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\./.test(f) && !/^index\./.test(f))
    .map((f) => join(dir, f));
  if (!own.length) return null;

  const all = new Set<string>();
  for (const f of own) await collect(f, all);
  const files = [...all].filter((f) => !/[\\/]index\.tsx?$/.test(f));

  const componentFiles = files.filter((f) => f.startsWith(dir));
  const helperFiles = files.filter((f) => !f.startsWith(dir));

  // CSS: this component's file plus any other component it depends on
  const usedComponents = new Set([name]);
  for (const f of helperFiles) {
    const m = toRepo(f).match(/packages\/ui\/src\/components\/([^/]+)\//);
    if (m) usedComponents.add(m[1]!);
  }
  const cssFiles = [...usedComponents]
    .map((c) => join(UI_SRC, 'styles', 'components', `${c}.css`))
    .filter((p) => existsSync(p));

  const exports: string[] = [];
  for (const f of componentFiles) {
    const src = await readFile(f, 'utf8');
    for (const m of src.matchAll(EXPORT_RE)) exports.push(m[1]!);
  }

  return {
    name,
    componentFiles: componentFiles.map(toRepo),
    helperFiles: helperFiles.map(toRepo).sort(),
    cssFiles: cssFiles.map(toRepo),
    exports,
  };
}

/** Every component folder in the library. */
export async function allComponentNames(): Promise<string[]> {
  return (await readdir(join(UI_SRC, 'components'), { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
}

export const posixJoin = posix.join;
