import 'server-only';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Monorepo root, found by walking up from the docs app until /packages/ui exists. */
export const repoRoot = (() => {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(/* turbopackIgnore: true */ dir, 'packages', 'ui'))) return dir;
    dir = resolve(/* turbopackIgnore: true */ dir, '..');
  }
  throw new Error('Could not find the monorepo root from ' + process.cwd());
})();

/** Read a file relative to the monorepo root. */
export function readRepoFile(path: string) {
  return readFile(join(/* turbopackIgnore: true */ repoRoot, path), 'utf8');
}

/** Read a docs example's source (apps/docs/examples/<file>.tsx). */
export function readExample(file: string) {
  return readRepoFile(`apps/docs/examples/${file}.tsx`);
}
