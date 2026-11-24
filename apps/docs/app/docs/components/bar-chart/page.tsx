import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import BarRevenue from '@/examples/chart/bar-revenue';
import BarCashflow from '@/examples/chart/bar-cashflow';
import BarHorizontal from '@/examples/chart/bar-horizontal';

export const metadata: Metadata = { title: 'Bar chart' };

export default function BarChartPage() {
  return (
    <DocPage href="/docs/components/bar-chart">
      <Section id="usage" title="Usage">
        <P>
          <Code>BarChart</Code> groups series side by side by default. Only the end of each bar is rounded. Hovering a category dims the others and highlights its slot.
        </P>
        <Example component="chart" file="chart/bar-revenue" title="Revenue vs expenses, grouped" align="stretch">
          <BarRevenue />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Comparing values between categories or periods.',
            'Showing the parts of each total (stacked), including values below zero.',
          ]}
        />
        <P>Not for: dense time series with dozens of points (use a line or area chart).</P>
      </Section>

      <Section id="stacked" title="Stacked with negative values">
        <P>
          <Code>stacked</Code> piles the series. Positive values stack up from zero and negative ones stack down, so mixed data never overlaps, and a zero line is drawn when the chart crosses it.
        </P>
        <Example component="chart" file="chart/bar-cashflow" title="Cash flow" align="stretch">
          <BarCashflow />
        </Example>
      </Section>

      <Section id="horizontal" title="Horizontal">
        <P>
          Use <Code>orientation=&quot;horizontal&quot;</Code> for long labels. The left axis then shows the categories and the bottom axis the values.
        </P>
        <Example component="chart" file="chart/bar-horizontal" title="Top pages" align="stretch">
          <BarHorizontal />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="BarChart"
          rows={[
            { name: 'data', type: 'Record<string, unknown>[]', description: 'One record per category.' },
            { name: 'index', type: 'string', description: 'Key of the category in each record.' },
            { name: 'series', type: '{ key, label?, color? }[]', description: "color is 'series-1'…'series-6' or any CSS colour." },
            { name: 'stacked', type: 'boolean', default: 'false', description: 'One bar per category, segments stacked.' },
            { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Direction the bars grow.' },
            { name: 'radius', type: 'number', default: '4', description: 'Corner radius of the rounded end, in px.' },
            { name: 'height', type: 'number', default: '280', description: 'Plot height in px.' },
            { name: 'valueFormat', type: "'number' | 'currency' | 'percent' | 'compact' | Intl options | (n) => string", default: "'number'", description: 'Tooltip and axis value format.' },
            { name: 'indexFormat', type: '(value, i) => string', description: 'Formats the category everywhere.' },
            { name: 'xAxis / yAxis', type: 'boolean | options', default: 'true', description: 'Bottom and left axes. yAxis.format, ticks and domain always apply to the value axis.' },
            { name: 'grid', type: "boolean | 'horizontal' | 'vertical' | 'both'", default: 'true', description: 'true draws lines along the value axis.' },
            { name: 'legend', type: "'top' | 'bottom' | false", default: 'bottom when there are 2+ series', description: 'Toggles series.' },
            { name: 'tooltip', type: 'boolean | { labelFormat }', default: 'true', description: 'Shows every series for the hovered category.' },
            { name: 'animate', type: 'boolean', default: 'true', description: 'Bars grow from the baseline on mount.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Focuses the chart.'],
            ['← / →  or  ↑ / ↓', 'Moves to the previous or next category.'],
            ['Home / End', 'First or last category.'],
            ['Esc', 'Clears the selection.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="img" with a summary label and a visually hidden table of every value.',
            'Active category is announced through a polite live region for keyboard users.',
            'Colour is never the only cue: the legend and tooltip name each series.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Bars grow from the baseline over 500ms, staggered by at most 30ms, total under 700ms.',
            'The highlight slot glides between categories; the other bars fade to 40%.',
            'Reduced motion: bars appear in place.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
