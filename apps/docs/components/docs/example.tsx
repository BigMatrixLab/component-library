import type { ReactNode } from 'react';
import { highlight } from '@/lib/highlight';
import { buildPrompts } from '@/lib/prompts';
import { readExample } from '@/lib/source';
import { ExampleTabs } from './example-tabs';

export interface ExampleProps {
  /** Component key in lib/prompt-sources.ts, e.g. "button". */
  component: string;
  /** Example file under apps/docs/examples, without extension, e.g. "button/variants". */
  file: string;
  /** Example name, used in the prompt title. */
  title: string;
  /** The rendered example (import the example module and render it here). */
  children: ReactNode;
  /** Preview layout. */
  align?: 'center' | 'start' | 'stretch';
  /** Minimum preview height in px. */
  minHeight?: number;
}

/**
 * One docs example: Preview / Code / Prompt.
 * The Code tab shows the example file verbatim, so it can never drift from the preview.
 */
export async function Example({ component, file, title, children, align = 'center', minHeight }: ExampleProps) {
  const source = (await readExample(file)).trim();
  const [codeHtml, prompts] = await Promise.all([highlight(source, 'tsx'), buildPrompts(component, file, title)]);
  return (
    <ExampleTabs file={file} code={source} codeHtml={codeHtml} prompts={prompts} align={align} minHeight={minHeight}>
      {children}
    </ExampleTabs>
  );
}
