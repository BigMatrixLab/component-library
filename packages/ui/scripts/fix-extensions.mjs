// Unbundled ESM output keeps source import specifiers ("./lib/cn"). Strict ESM
// (Node, Next.js server) needs full paths, so rewrite relative specifiers in
// dist to "./lib/cn.js" or "./components/button/index.js".
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const root = resolve('dist');
const exists = (p) => stat(p).then(() => true, () => false);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (/\.(js|d\.ts)$/.test(entry.name)) yield p;
  }
}

const re = /(from\s+|import\s*\(\s*|import\s+)(["'])(\.{1,2}\/[^"']+)\2/g;
let changed = 0;
for await (const file of walk(root)) {
  const src = await readFile(file, 'utf8');
  const matches = [...src.matchAll(re)];
  if (!matches.length) continue;
  let out = src;
  for (const m of matches) {
    const spec = m[3];
    if (/\.(js|json|css)$/.test(spec)) continue;
    const base = resolve(dirname(file), spec);
    let next;
    if (await exists(`${base}.js`)) next = `${spec}.js`;
    else if (await exists(join(base, 'index.js'))) next = `${spec}/index.js`;
    if (next) out = out.replace(`${m[2]}${spec}${m[2]}`, `${m[2]}${next}${m[2]}`);
  }
  if (out !== src) {
    await writeFile(file, out);
    changed++;
  }
}
console.log(`fix-extensions: rewrote ${changed} files`);
