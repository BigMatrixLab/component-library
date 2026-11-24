import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { repoRoot } from './source';

/* Every <Example> on every docs page, read from the page sources. The prompt
   files (/prompts/<file>/{recreate,adapt}.txt) are generated from this list,
   so a new example gets its prompt files without being registered anywhere. */

export interface DocsExample {
  /** Component key passed to buildPrompts, e.g. "button" or "blocks/hero". */
  component: string;
  /** Example file under apps/docs/examples, e.g. "button/variants". */
  file: string;
  /** Title shown on the page and used in the prompt heading. */
  title: string;
}

const APP_DIR = join(/* turbopackIgnore: true */ repoRoot, 'apps', 'docs', 'app');
// Attributes in this order, as string literals (every page follows this shape)
const EXAMPLE_RE = /<Example\s+component="([^"]+)"\s+file="([^"]+)"\s+title="([^"]+)"/g;

let examples: Promise<DocsExample[]> | undefined;

async function load(): Promise<DocsExample[]> {
  const pages = (await readdir(APP_DIR, { recursive: true }))
    .filter((f) => /(^|[\\/])page\.tsx$/.test(f))
    .sort();
  const byFile = new Map<string, DocsExample>();
  for (const page of pages) {
    const src = await readFile(join(/* turbopackIgnore: true */ APP_DIR, page), 'utf8');
    for (const [, component, file, title] of src.matchAll(EXAMPLE_RE)) {
      if (!byFile.has(file!)) byFile.set(file!, { component: component!, file: file!, title: title! });
    }
  }
  return [...byFile.values()];
}

/** All docs examples, one entry per example file (first page that uses it wins). */
export function allExamples(): Promise<DocsExample[]> {
  // Read once per build; in dev, re-read so new examples show up without a restart
  if (process.env.NODE_ENV !== 'production') return load();
  return (examples ??= load());
}
