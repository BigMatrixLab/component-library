import { allExamples } from '@/lib/examples';
import { buildPrompts } from '@/lib/prompts';

/**
 * Plain-text prompts as static files, one pair per docs example:
 *   /prompts/button/variants/recreate.txt
 *   /prompts/blocks/hero/centered/adapt.txt
 * The path is the example file (apps/docs/examples/<file>.tsx) plus the mode.
 * Used by the prompt verification flow (AUTHORING.md) and AI tools.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

const MODES = { 'recreate.txt': 'recreate', 'adapt.txt': 'adapt' } as const;
type ModeFile = keyof typeof MODES;

export async function generateStaticParams() {
  const examples = await allExamples();
  return examples.flatMap(({ file }) =>
    (Object.keys(MODES) as ModeFile[]).map((name) => ({ path: [...file.split('/'), name] })),
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const name = path.at(-1) as ModeFile;
  const file = path.slice(0, -1).join('/');
  const example = (await allExamples()).find((e) => e.file === file);
  if (!example || !(name in MODES)) return new Response('Not found', { status: 404 });

  const prompts = await buildPrompts(example.component, example.file, example.title);
  return new Response(prompts[MODES[name]], { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
