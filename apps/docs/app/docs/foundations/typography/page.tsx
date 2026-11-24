import type { Metadata } from 'next';
import { Code, DocPage, P, Section } from '@/components/docs/doc';
import { CodeBlock } from '@/components/docs/code-block';
import { FontSample } from './font-sample';

export const metadata: Metadata = { title: 'Typography' };

const systemStack = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const scale = [
  ['text-xs', '12px', 'Captions, table meta'],
  ['text-sm', '13px', 'Labels, secondary text'],
  ['text-base', '14px', 'Body and controls (default)'],
  ['text-md', '15px', 'Comfortable reading text'],
  ['text-lg', '17px', 'Dialog titles, leads'],
  ['text-xl', '20px', 'Card titles, metric values'],
  ['text-2xl', '24px', 'Section headings'],
  ['text-3xl', '28px', 'Page titles in apps'],
  ['text-4xl', '34px', 'Docs and marketing titles'],
  ['text-5xl', '40px', 'Hero headlines'],
];

export default function TypographyPage() {
  return (
    <DocPage href="/docs/foundations/typography" wide>
      <Section id="font" title="Font">
        <P>
          ui-kit uses the <strong className="font-medium text-foreground">system font stack</strong>: San Francisco on Apple devices, Segoe UI on Windows, Roboto on Android. Nothing is downloaded, text renders instantly and feels native on every platform.
        </P>
        <FontSample name="System stack" note="Default" sans={systemStack} display={systemStack} />
        <div className="h-6" />
        <P>
          Need a brand font? Load it (for example with <Code>next/font</Code>) and point the two variables at it:
        </P>
        <CodeBlock
          lang="css"
          code={`:root {
  --ui-font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --ui-font-display: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}`}
        />
      </Section>

      <Section id="scale" title="Type scale">
        <P>
          Ten steps, overriding Tailwind’s defaults so <Code>text-base</Code> is our 14px body size. Weights are 400 and 500, with 600 for headings. Anything that changes or lines up in columns uses <Code>tabular-nums</Code>.
        </P>
        <div className="mb-6 divide-y divide-border rounded-xl border border-border">
          {scale.map(([cls, px, use]) => (
            <div key={cls} className="flex items-baseline gap-4 px-4 py-3">
              <code className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{cls}</code>
              <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{px}</span>
              <span className={`${cls} truncate font-medium`}>{use}</span>
            </div>
          ))}
        </div>
      </Section>
    </DocPage>
  );
}
