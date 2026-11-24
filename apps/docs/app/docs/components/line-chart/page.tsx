import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import LineRevenue from '@/examples/chart/line-revenue';
import LineCurves from '@/examples/chart/line-curves';

export const metadata: Metadata = { title: 'Line chart' };

export default function LineChartPage() {
  return (
    <DocPage href="/docs/components/line-chart">
      <Section id="usage" title="Usage">
        <P>
          <Code>LineChart</Code> compares a few series over an ordered x axis. Click a legend item to hide a series; the last visible one cannot be hidden.
        </P>
        <Example component="chart" file="chart/line-revenue" title="Revenue and expenses" align="stretch">
          <LineRevenue />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Comparing several series over time without the weight of filled areas.',
            'Values where the exact path matters (latency, price, temperature).',
          ]}
        />
        <P>Not for: parts of a whole (use a donut) or comparing unordered categories (use bars).</P>
      </Section>

      <Section id="curves" title="Curves">
        <P>
          <Code>monotone</Code> (default) smooths the line without ever drawing a peak higher than the data. <Code>linear</Code> joins points with straight segments and <Code>step</Code> holds each value until the next.
        </P>
        <Example component="chart" file="chart/line-curves" title="Curve types" align="stretch">
          <LineCurves />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="LineChart"
          rows={[
            { name: 'data', type: 'Record<string, unknown>[]', description: 'One record per x position. Missing values leave a gap in the line.' },
            { name: 'index', type: 'string', description: 'Key of the x value in each record.' },
            { name: 'series', type: '{ key, label?, color? }[]', description: "color is 'series-1'…'series-6' or any CSS colour." },
            { name: 'curve', type: "'monotone' | 'linear' | 'step'", default: "'monotone'", description: 'Line interpolation.' },
            { name: 'height', type: 'number', default: '280', description: 'Plot height in px.' },
            { name: 'valueFormat', type: "'number' | 'currency' | 'percent' | 'compact' | Intl options | (n) => string", default: "'number'", description: "'percent' expects 0–100 values; pass { style: 'percent' } for fractions." },
            { name: 'indexFormat', type: '(value, i) => string', description: 'Formats the x value everywhere.' },
            { name: 'xAxis / yAxis', type: 'boolean | options', default: 'true', description: 'yAxis options: format, ticks, width, domain: [min, max].' },
            { name: 'grid', type: "boolean | 'horizontal' | 'vertical' | 'both'", default: 'true', description: 'Dashed grid lines.' },
            { name: 'legend', type: "'top' | 'bottom' | false", default: 'bottom when there are 2+ series', description: 'Clicking an item toggles its series.' },
            { name: 'tooltip', type: 'boolean | { labelFormat }', default: 'true', description: 'Snaps to the nearest point.' },
            { name: 'animate', type: 'boolean', default: 'true', description: 'Draw-in and data transitions.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Focuses the chart (then the legend buttons).'],
            ['← / →', 'Moves the active point.'],
            ['Home / End', 'First or last point.'],
            ['Esc', 'Clears the active point.'],
            ['Enter / Space', 'On a legend item: hides or shows the series.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="img" with an aria-label summary, plus a visually hidden table of every value.',
            'Legend items are toggle buttons (aria-pressed).',
            'The tooltip is a visual aid; keyboard users hear the same text through a polite live region.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Lines draw in over 600ms with ease-out, staggered by 40ms per series.',
            'The crosshair glides in 160ms; the tooltip in 120ms.',
            'Reduced motion removes the draw-in and glide.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
