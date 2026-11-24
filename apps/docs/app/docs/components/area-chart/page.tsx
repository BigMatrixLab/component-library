import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import AreaVisitors from '@/examples/chart/area-visitors';
import AreaStacked from '@/examples/chart/area-stacked';

export const metadata: Metadata = { title: 'Area chart' };

export default function AreaChartPage() {
  return (
    <DocPage href="/docs/components/area-chart">
      <Section id="usage" title="Usage">
        <P>
          <Code>AreaChart</Code> draws a gradient that fades to transparent under each line. Pass the records, the key of the x value (<Code>index</Code>) and the series to plot. Colours come from CSS variables, so the chart follows theme, dark mode and accent with no re-render.
        </P>
        <Example component="chart" file="chart/area-visitors" title="Visitors, last 90 days" align="stretch">
          <AreaVisitors />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A trend over time where the volume under the line matters (traffic, revenue, usage).',
            'Two or three overlaid series, or a stacked composition of one total.',
          ]}
        />
        <P>Not for: exact comparisons between categories (use a bar chart) or many overlapping series (use a line chart).</P>
      </Section>

      <Section id="stacked" title="Stacked">
        <P>
          Set <Code>stacked</Code> to pile the series on top of each other. The tooltip still shows each series on its own, and the top edge is the total.
        </P>
        <Example component="chart" file="chart/area-stacked" title="Monthly recurring revenue by plan" align="stretch">
          <AreaStacked />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="AreaChart"
          rows={[
            { name: 'data', type: 'Record<string, unknown>[]', description: 'One record per x position.' },
            { name: 'index', type: 'string', description: 'Key of the x value in each record.' },
            { name: 'series', type: '{ key, label?, color? }[]', description: "Series to plot. color is 'series-1'…'series-6' or any CSS colour." },
            { name: 'stacked', type: 'boolean', default: 'false', description: 'Stack the series instead of overlaying them.' },
            { name: 'curve', type: "'monotone' | 'linear' | 'step'", default: "'monotone'", description: 'Monotone never overshoots the data.' },
            { name: 'height', type: 'number', default: '280', description: 'Plot height in px. The width fills the parent.' },
            { name: 'valueFormat', type: "'number' | 'currency' | 'percent' | 'compact' | Intl options | (n) => string", default: "'number'", description: 'Formats tooltip values; axis ticks use a compact form.' },
            { name: 'indexFormat', type: '(value, i) => string', description: 'Formats the x value in the axis, tooltip and data table.' },
            { name: 'xAxis / yAxis', type: 'boolean | options', default: 'true', description: 'yAxis options: format, ticks, width, domain. xAxis options: format.' },
            { name: 'grid', type: "boolean | 'horizontal' | 'vertical' | 'both'", default: 'true', description: 'Dashed grid; true means horizontal lines.' },
            { name: 'legend', type: "'top' | 'bottom' | false", default: 'bottom when there are 2+ series', description: 'Legend items toggle their series.' },
            { name: 'tooltip', type: 'boolean | { labelFormat }', default: 'true', description: 'Crosshair, dots and a readout.' },
            { name: 'animate', type: 'boolean', default: 'true', description: 'Draw-in on mount and smooth transitions between data.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Focuses the chart.'],
            ['← / →', 'Moves the active point; the readout is announced.'],
            ['Home / End', 'Jumps to the first or last point.'],
            ['Esc', 'Clears the active point.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The svg is role="img" with a generated summary (override with aria-label).',
            'A visually hidden table lists every value, so screen readers can read the data.',
            'Touch scrubs horizontally while vertical swipes still scroll the page.',
            'Series are told apart by position in the legend and tooltip as well as colour.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'On mount the line draws in and the area fades up (600ms, ease-out). Nothing animates during server render.',
            'The crosshair and dots glide between points; the tooltip follows the pointer and flips at the edge.',
            'Changing data eases the values over 450ms.',
            'Reduced motion: no draw-in, no glide; the state still changes.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
