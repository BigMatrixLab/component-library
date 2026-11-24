import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import TextShimmerThinking from '@/examples/text-shimmer/thinking';
import TextShimmerVariants from '@/examples/text-shimmer/variants';

export const metadata: Metadata = { title: 'Text shimmer' };

export default function TextShimmerPage() {
  return (
    <DocPage href="/docs/components/text-shimmer">
      <Section id="thinking" title="Thinking label">
        <P>
          A soft band of light sweeps across muted text while work is in progress. Set <Code>active={'{false}'}</Code> when it finishes and the text settles into plain type.
        </P>
        <Example component="text-shimmer" file="text-shimmer/thinking" title="Thinking label" align="start">
          <TextShimmerThinking />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Short status labels for work of unknown length: “Thinking…”, “Searching 1,284 documents”, “Generating report”.',
            'A heading of a section that is still being produced.',
          ]}
        />
        <P>
          Not for: content placeholders (use a skeleton), progress you can measure (use a progress bar), or body text people need to read — the moving band lowers contrast for a moment.
        </P>
      </Section>

      <Section id="variants" title="Headings, inline text and speed">
        <P>
          <Code>asChild</Code> puts the shimmer on your own element, such as a heading. <Code>duration</Code> sets one sweep in milliseconds. Colours come from <Code>--ui-text-shimmer-base</Code> and <Code>--ui-text-shimmer-highlight</Code>.
        </P>
        <Example component="text-shimmer" file="text-shimmer/variants" title="Headings, inline text and speed" align="start">
          <TextShimmerVariants />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="TextShimmer"
          rows={[
            { name: 'active', type: 'boolean', default: 'true', description: 'Run the sweep. False shows plain text in the inherited colour.' },
            { name: 'duration', type: 'number', default: '2000', description: 'One sweep, in milliseconds.' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child element (a heading, a paragraph) with the shimmer.' },
            { name: '...props', type: 'HTMLAttributes<HTMLSpanElement>', description: 'Forwarded to the <span>, including ref and className.' },
          ]}
        />
        <PropsTable
          title="CSS variables"
          rows={[
            { name: '--ui-text-shimmer-base', type: 'color', default: 'var(--ui-muted-foreground)', description: 'Resting text colour.' },
            { name: '--ui-text-shimmer-highlight', type: 'color', default: 'var(--ui-foreground)', description: 'Colour at the centre of the band.' },
            { name: '--ui-text-shimmer-band', type: 'percentage', default: '10%', description: 'Half-width of the band, as a share of the gradient.' },
            { name: '--ui-text-shimmer-duration', type: 'time', default: '2s', description: 'Set by the duration prop.' },
          ]}
        />
        <P>
          Server Component–safe: no JavaScript runs. In plain HTML: <Code>{'<span class="ui-text-shimmer" data-state="active">'}</Code>.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The text stays real text: selectable, translatable and read normally by screen readers.',
            <>It announces nothing by itself. When the label is the news, put it in a <Code>role=&quot;status&quot;</Code> region, as in the first example.</>,
            'The resting colour is the muted foreground, which meets 4.5:1 on the page background; the band only ever brightens it.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'One linear sweep, left to right (right to left in RTL), every 2s by default, looping while active.',
            'Pure CSS: a gradient clipped to the glyphs with background-clip: text, moved with background-position.',
            'Reduced motion: the band is removed and the text rests in the muted colour.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
