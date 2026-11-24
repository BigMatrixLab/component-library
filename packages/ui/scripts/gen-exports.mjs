// Per-component entry points: write package.json "exports" so that
// `import { Button } from 'ui-kit/button'` works, one entry per folder in
// src/components that has an index.ts. Runs first in `npm run build`.
// Fixed entries ('.', './styles.css', './kit.css', './package.json') are kept.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = join(pkgDir, 'package.json');
const componentsDir = join(pkgDir, 'src', 'components');

const raw = readFileSync(pkgPath, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const pkg = JSON.parse(raw);

const names = readdirSync(componentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((n) => ['index.ts', 'index.tsx'].some((f) => existsSync(join(componentsDir, n, f))))
  .sort();

const exportsMap = {
  '.': { types: './dist/index.d.ts', import: './dist/index.js' },
};
for (const name of names) {
  exportsMap[`./${name}`] = {
    types: `./dist/components/${name}/index.d.ts`,
    import: `./dist/components/${name}/index.js`,
  };
}
exportsMap['./styles.css'] = './dist/styles.css';
exportsMap['./kit.css'] = './src/styles/kit.css';
exportsMap['./package.json'] = './package.json';

pkg.exports = exportsMap;
const next = `${JSON.stringify(pkg, null, 2)}\n`.replace(/\n/g, eol);
if (next !== raw) {
  writeFileSync(pkgPath, next);
  console.log(`gen-exports: ${names.length} component entry points written`);
} else {
  console.log(`gen-exports: ${names.length} component entry points, unchanged`);
}
