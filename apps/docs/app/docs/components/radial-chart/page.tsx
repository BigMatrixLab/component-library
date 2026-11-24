import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import RadialStorage from '@/examples/chart/radial-storage';
import RadialGoals from '@/examples/chart/radial-goals';

export const metadata: Metadata = { title: 'Radial & gauge' };

export default function RadialChartPage() {
  return (
    <DocPage href="/docs/components/radial-chart">
      <Section id="usage" title="Usage">
        <P>
          <Code>RadialChart</Code> shows progress toward a goal. With one row it is a gauge with the value in the centre; with several rows the rings nest, first row outermost. The empty track stays visible so the remaining distance is obvious.
        </P>
        <Example component="chart" file="chart/radial-storage" title="Storage used (gauge)" align="stretch">
          <RadialStorage />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List items={['One number against a known maximum: quota, completion, score.', 'Up to four related goals measured on the same scale.']} />
        <P>Not for: values without a natural maximum or precise comparisons (use bars).</P>
      </Section>

      <Section id="rings" title="Several rings">
        <P>
          Pass more than one row for concentric rings. Hover a ring to see its value in the centre. Use <Code>variant=&quot;semicircle&quot;</Code> for a half-gauge.
        </P>
        <Example component="chart" file="chart/radial-goals" title="Quarter goals" align="stretch">
          <RadialGoals />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="RadialChart"
          rows={[
            { name: 'data', type: 'Record<string, unknown>[]', description: 'One record per ring.' },
            { name: 'index', type: 'string', description: 'Key of the ring name.' },
            { name: 'valueKey', type: 'string', description: 'Key of the ring value.' },
            { name: 'max', type: 'number', default: '100', description: 'Value that fills a ring.' },
            { name: 'variant', type: "'ring' | 'semicircle'", default: "'ring'", description: 'Full circles or a half-gauge.' },
            { name: 'thickness', type: 'number', description: 'Stroke width in px (default 16 for one ring, 12 for several).' },
            { name: 'track', type: 'boolean', default: 'true', description: 'Draw the empty track behind each ring.' },
            { name: 'colors', type: 'SeriesColor[]', description: 'Colour per ring.' },
            { name: 'centerLabel / centerValue', type: 'ReactNode', description: 'Override the centre text.' },
            { name: 'height', type: 'number', default: '240 · 160 for semicircle', description: 'Plot height in px.' },
            { name: 'valueFormat', type: 'ValueFormat', default: "'number'", description: "'percent' expects 0–100 values." },
            { name: 'legend / tooltip / animate', type: 'see Donut', description: 'Legend shows when there are several rings.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Focuses the chart.'],
            ['← / →', 'Moves to the previous or next ring.'],
            ['Esc', 'Clears the selection.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="img" labelled with each value and its maximum; a hidden table repeats them.',
            'The centre text is also in the label, so nothing depends on seeing the ring.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={['Rings sweep from zero to their value on mount (700ms, ease-out).', 'Reduced motion: drawn at their value straight away.']}
        />
      </Section>
    </DocPage>
  );
}
