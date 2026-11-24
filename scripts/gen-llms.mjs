// `npm run gen:llms` — AI-readable docs into apps/docs/public/.
//
//   llms.txt             index in the llmstxt.org format (links to the files below)
//   llms-full.txt        system prompt + token files + every component and block spec
//   md/system.md         the design language (system prompt + token files)
//   md/<name>.md         one component: install lines, exports, then its spec
//   md/blocks/<name>.md  one block spec
//
// Sources: prompts/system.md, prompts/components/*.md, prompts/blocks/*.md, the
// token files listed in apps/docs/lib/prompt-sources.ts, and the component folders.
//
// Environment: UI_SITE_URL — public origin of the docs site (default: placeholder).
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  PKG_DESCRIPTION,
  PKG_NAME,
  PKG_VERSION,
  SITE_URL,
  componentGraph,
  componentNames,
  docsNav,
  readRepo,
  repoRoot,
  specFiles,
  specSummary,
  systemSources,
  titleCase,
} from './lib/source.mjs';

const PUBLIC = join(repoRoot, 'apps', 'docs', 'public');
const MD = join(PUBLIC, 'md');
const url = (path) => `${SITE_URL}/${path.replace(/^\/+/, '')}`;

const fence = (path, code) => {
  const lang = path.endsWith('.css') ? 'css' : path.endsWith('.tsx') ? 'tsx' : 'ts';
  return `\`\`\`${lang} title="${path.replace('packages/ui/src/', 'ui/')}"\n${code.trimEnd()}\n\`\`\``;
};

function write(abs, text) {
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, `${text.trimEnd()}\n`);
}

/* ---------------------------------------------------------------------------
   Design language: the same text the docs Prompt tab prepends (see apps/docs/lib/prompts.ts) */

const system = (() => {
  const intro = readRepo('prompts/system.md').trimEnd();
  const tokens = systemSources().map((p) => fence(p, readRepo(p)));
  return `${intro}\n\n## Design tokens (exact values — copy these files as-is)\n\n${tokens.join('\n\n')}`;
})();

/* ---------------------------------------------------------------------------
   Entries: every spec, plus component folders that have no spec yet */

const nav = docsNav();
const specs = specFiles();
const specByKey = new Map(specs.map((s) => [`${s.kind}/${s.name}`, s]));
const folders = componentNames();

const entries = [];
for (const name of [...new Set([...folders, ...specs.filter((s) => s.kind === 'components').map((s) => s.name)])].sort()) {
  entries.push({ kind: 'components', name, spec: specByKey.get(`components/${name}`) ?? null });
}
for (const s of specs.filter((x) => x.kind === 'blocks')) entries.push({ kind: 'blocks', name: s.name, spec: s });

for (const e of entries) {
  e.md = e.spec ? readRepo(e.spec.path).trimEnd() : `## Component: ${titleCase(e.name)}\n\n(Spec pending.)`;
  const sum = specSummary(e.md);
  const doc = nav.get(e.name);
  e.title = doc?.title ?? sum.title ?? titleCase(e.name);
  e.description = doc?.description || sum.description || '';
  e.docsUrl = doc && !doc.soon ? url(doc.url) : null;
  e.mdPath = e.kind === 'blocks' ? `md/blocks/${e.name}.md` : `md/${e.name}.md`;
  e.graph = e.kind === 'components' && folders.includes(e.name) ? componentGraph(e.name) : null;
}

/* ---------------------------------------------------------------------------
   Per-entry markdown */

function entryMarkdown(e) {
  const lines = [`# ${e.title}`, '', e.description && `> ${e.description}`, ''];
  if (e.graph) {
    const names = e.graph.exports.length ? e.graph.exports.join(', ') : '…';
    lines.push(
      '## Install',
      '',
      `- Package: \`npm install ${PKG_NAME}\`, then \`import { ${names} } from '${PKG_NAME}/${e.name}';\``,
      `- Styles (app already on Tailwind v4): \`@import "tailwindcss";\` then \`@import "${PKG_NAME}/kit.css";\``,
      `- Styles (no Tailwind): \`import '${PKG_NAME}/styles.css';\``,
      `- Copy the source instead (shadcn CLI): \`npx shadcn@latest add ${url(`r/${e.name}.json`)}\``,
    );
    if (e.graph.components.length) lines.push(`- Uses: ${e.graph.components.map((c) => `[${c}](${url(`md/${c}.md`)})`).join(', ')}`);
    lines.push('');
  }
  lines.push(
    '## Links',
    '',
    e.docsUrl && `- Docs page: ${e.docsUrl}`,
    `- Design language (read first): ${url('md/system.md')}`,
    `- Everything in one file: ${url('llms-full.txt')}`,
    '',
    '## Specification',
    '',
    e.md,
  );
  return lines.filter((l) => l !== null && l !== false && l !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');
}

/* ---------------------------------------------------------------------------
   llms.txt and llms-full.txt */

function llmsIndex() {
  const link = (e) => `- [${e.title}](${url(e.mdPath)})${e.description ? `: ${e.description}` : ''}`;
  const comps = entries.filter((e) => e.kind === 'components');
  const blocks = entries.filter((e) => e.kind === 'blocks');
  return [
    `# ${PKG_NAME}`,
    '',
    `> ${PKG_DESCRIPTION}`,
    '',
    `React 18/19 + TypeScript + Tailwind CSS v4. No runtime dependencies besides React. Version ${PKG_VERSION}.`,
    `Install with \`npm install ${PKG_NAME}\`; import per component from \`${PKG_NAME}/<name>\` (or everything from \`${PKG_NAME}\`).`,
    `CSS: \`@import "${PKG_NAME}/kit.css";\` after \`@import "tailwindcss";\`, or the prebuilt \`${PKG_NAME}/styles.css\`.`,
    'Read the design language first: every component follows its tokens, motion and API conventions.',
    '',
    '## Design language',
    '',
    `- [System prompt and tokens](${url('md/system.md')}): visual language, motion presets, component conventions and the exact token files.`,
    '',
    '## Components',
    '',
    ...comps.map(link),
    ...(blocks.length ? ['', '## Blocks', '', ...blocks.map(link)] : []),
    '',
    '## Optional',
    '',
    `- [Full reference](${url('llms-full.txt')}): the design language and every spec in one file.`,
    `- [Source registry](${url('r/index.json')}): shadcn-compatible registry; \`npx shadcn@latest add ${url('r/<name>.json')}\` copies a component's source.`,
  ].join('\n');
}

function llmsFull() {
  const parts = [
    `# ${PKG_NAME} — full reference (v${PKG_VERSION})`,
    '',
    `> ${PKG_DESCRIPTION}`,
    '',
    system,
    ...entries.filter((e) => e.spec).map((e) => `---\n\n${e.md}`),
  ];
  return parts.join('\n\n');
}

/* ---------------------------------------------------------------------------
   Write */

rmSync(MD, { recursive: true, force: true });
write(join(MD, 'system.md'), `# ${PKG_NAME} design language\n\n${system}`);
for (const e of entries) write(join(PUBLIC, e.mdPath), entryMarkdown(e));
write(join(PUBLIC, 'llms.txt'), llmsIndex());
write(join(PUBLIC, 'llms-full.txt'), llmsFull());

const pending = entries.filter((e) => !e.spec).map((e) => e.name);
console.log(`gen-llms: ${entries.length} entries → apps/docs/public/{llms.txt,llms-full.txt,md/}  [site ${SITE_URL}]`);
if (pending.length) console.log(`gen-llms: no spec yet for ${pending.join(', ')}`);
if (!existsSync(join(repoRoot, 'prompts', 'blocks'))) console.log('gen-llms: prompts/blocks/ not found; no blocks listed');
