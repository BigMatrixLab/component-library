import 'server-only';
import { cache } from 'react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { allComponentNames, componentGraph, type ComponentGraph } from './component-graph';
import { systemSources } from './prompt-sources';
import { readExample, readRepoFile, repoRoot } from './source';

const fence = (path: string, code: string) => {
  const lang = path.endsWith('.css') ? 'css' : path.endsWith('.tsx') ? 'tsx' : 'ts';
  return `\`\`\`${lang} title="${path.replace('packages/ui/src/', 'ui/')}"\n${code.trimEnd()}\n\`\`\``;
};

/** prompts/system.md + every token/motion file, verbatim. */
const systemPrompt = cache(async () => {
  const intro = await readRepoFile('prompts/system.md');
  const files = await Promise.all(systemSources.map(async (p) => fence(p, await readRepoFile(p))));
  return `${intro.trimEnd()}\n\n## Design tokens (exact values — copy these files as-is)\n\n${files.join('\n\n')}`;
});

const componentSpec = cache(async (name: string) => {
  // "blocks/<name>" reads prompts/blocks/<name>.md; anything else is a component spec
  const path = name.startsWith('blocks/') ? `prompts/${name}.md` : `prompts/components/${name}.md`;
  return existsSync(join(/* turbopackIgnore: true */ repoRoot, path)) ? readRepoFile(path) : `## Component: ${name}\n\n(Spec pending.)\n`;
});

const graphs = cache(async () => {
  const names = await allComponentNames();
  const all = await Promise.all(names.map((n) => componentGraph(n)));
  return all.filter((g): g is ComponentGraph => g !== null);
});

/** Rewrite the example's package imports to the local files the AI will create. */
const localiseImports = (code: string) => code.replace(/from ['"]ui-kit['"]/g, "from '@/ui'");

const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export interface ExamplePrompts {
  recreate: string;
  adapt: string;
}

/**
 * Build the two prompts for one docs example.
 *  - Recreate: system + spec + the full reference source + the example → identical output.
 *  - Adapt:    system + spec + a slot for the reader's own content → same design language.
 * Which files to include is derived from the source (component-graph.ts).
 */
export async function buildPrompts(component: string, example: string, exampleTitle: string): Promise<ExamplePrompts> {
  const [system, spec, exampleSource, allGraphs] = await Promise.all([
    systemPrompt(),
    componentSpec(component),
    readExample(example),
    graphs(),
  ]);
  // "blocks/hero" → "Hero block"
  const title = component.startsWith('blocks/') ? `${titleCase(component.slice(7))} block` : titleCase(component);

  // Components the example uses (by imported names), plus the page's own component
  const imported = new Set(
    [...exampleSource.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]ui-kit['"]/g)].flatMap((m) =>
      m[1]!.split(',').map((s) => s.trim().split(/\s+as\s+/)[0]!.replace(/^type\s+/, '')),
    ),
  );
  const used = allGraphs.filter((g) => g.name === component || g.exports.some((e) => imported.has(e)));

  const helperSet = new Set(used.flatMap((g) => g.helperFiles));
  if (imported.has('Icon')) ['packages/ui/src/icons/icon.tsx', 'packages/ui/src/icons/paths.ts', 'packages/ui/src/lib/cn.ts'].forEach((p) => helperSet.add(p));
  // Helpers that live in another component's folder are written with that component
  const componentFileSet = new Set(used.flatMap((g) => g.componentFiles));
  for (const h of [...helperSet]) {
    if (/packages\/ui\/src\/components\//.test(h)) {
      componentFileSet.add(h);
      helperSet.delete(h);
    }
  }
  const cssFiles = [...new Set(used.flatMap((g) => g.cssFiles))];
  for (const f of componentFileSet) {
    const m = f.match(/packages\/ui\/src\/components\/([^/]+)\//);
    const css = m && `packages/ui/src/styles/components/${m[1]}.css`;
    if (css && existsSync(join(/* turbopackIgnore: true */ repoRoot, css)) && !cssFiles.includes(css)) cssFiles.push(css);
  }
  const helpers = [...helperSet].sort();
  const componentFiles = [...componentFileSet];

  const sources = await Promise.all(
    [...helpers, ...cssFiles, ...componentFiles].map(async (p) => fence(p, await readRepoFile(p))),
  );

  // Entry files are generated here so the AI never has to guess them.
  const ui = (p: string) => p.replace('packages/ui/src/', '');
  const kitCss = [...systemSources, ...cssFiles].map((p) => `@import "./${ui(p).replace('styles/', '')}";`).join('\n');
  const indexTs = [
    ...componentFiles.map((f) => `export * from './${ui(f).replace(/\.tsx?$/, '')}';`),
    ...(helpers.includes('packages/ui/src/icons/icon.tsx') ? [`export { Icon } from './icons/icon';`] : []),
    `export { cn } from './lib/cn';`,
  ];
  const entries = [fence('packages/ui/src/styles/kit.css', kitCss), fence('packages/ui/src/index.ts', [...new Set(indexTs)].join('\n'))];

  const recreate = `# Recreate: ${title} — ${exampleTitle}

You are a senior React + Tailwind CSS v4 engineer. Recreate the component and the example below so that they look and behave **exactly** like the reference. Do not redesign, rename classes, change values or add dependencies.

${system}

${spec.trimEnd()}

## Reference implementation (reproduce exactly)

Create these files under \`ui/\` (import alias \`@/ui\`). The app's global CSS is \`@import "tailwindcss";\` followed by \`@import "./ui/styles/kit.css";\` (adjust the relative path to where your global CSS lives), and Tailwind must scan the \`ui/\` folder and your app for class names.

${sources.join('\n\n')}

### Entry files

${entries.join('\n\n')}

## Render this example

${fence(`app/example.tsx`, localiseImports(exampleSource))}

## Output format

1. Every file above, complete, with its path.
2. Nothing else: no explanations, no extra libraries, no changed values.`;

  const adapt = `# Build: ${title} in the ui-kit design language

You are a senior React + Tailwind CSS v4 engineer. Build a ${title.toLowerCase()} for my app that follows the design system and the component specification below. Match the anatomy, states, keyboard behaviour, accessibility and motion exactly; only the content changes.

${system}

${spec.trimEnd()}

## Reference usage (for structure — adapt the content)

${fence('example.tsx', exampleSource)}

## My content

<!-- Describe what you need, e.g. labels, actions, copy, which variant/size. -->
[Describe your use case here]

## Output format

1. The component file(s) and the CSS for its \`ui-*\` classes, complete.
2. A usage example with my content.
3. No extra libraries; React and Tailwind CSS v4 only.`;

  return { recreate, adapt };
}
