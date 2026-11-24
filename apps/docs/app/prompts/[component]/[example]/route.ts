import { buildPrompts } from '@/lib/prompts';

/**
 * Plain-text prompts, e.g. /prompts/button/variants?mode=recreate
 * Used by the prompt verification script and (later) llms.txt.
 */
export async function GET(req: Request, { params }: { params: Promise<{ component: string; example: string }> }) {
  const { component, example } = await params;
  const mode = new URL(req.url).searchParams.get('mode') === 'adapt' ? 'adapt' : 'recreate';
  const title = example.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  try {
    const prompts = await buildPrompts(component, `${component}/${example}`, title);
    return new Response(prompts[mode], { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (err) {
    return new Response(String(err), { status: 404 });
  }
}
