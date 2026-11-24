import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SparklineKpi from '@/examples/chart/sparkline-kpi';

export const metadata: Metadata = { title: 'Sparkline' };

export default function SparklinePage() {
  return (
    <DocPage href="/docs/components/sparkline">
      <Section id="usage" title="Usage">
        <P>
          <Code>Sparkline</Code> is a tiny trend with no axes or tooltip, made for KPI tiles and table rows. It fills its parent&apos;s width. Pass <Code>trend</Code> to colour it by direction and give it an <Code>aria-label</Code> that states the point of the trend.
        </P>
        <Example component="chart" file="chart/sparkline-kpi" title="KPI tiles" align="stretch">
          <SparklineKpi />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List items={['Next to a number, to show where it is heading.', 'In dense tables, one per row.']} />
        <P>Not for: reading exact values (use a line chart with a tooltip).</P>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Sparkline"
          rows={[
            { name: 'data', type: '(number | Record<string, unknown>)[]', description: 'Numbers, or records read through valueKey.' },
            { name: 'valueKey', type: 'string', default: "'value'", description: 'Key to read from record data.' },
            { name: 'variant', type: "'line' | 'area' | 'bar'", default: "'line'", description: 'Bars emphasise the last value.' },
            { name: 'width / height', type: 'number', default: 'fill · 32', description: 'Width fills the parent unless set.' },
            { name: 'color', type: 'SeriesColor', default: 'series-1', description: 'Theme series or any CSS colour.' },
            { name: 'trend', type: 'boolean', default: 'false', description: 'Success colour when the last value is above the first, destructive when below. Not for metrics where down is good.' },
            { name: 'dot', type: 'boolean', default: 'true', description: 'Dot on the last point (line and area).' },
            { name: 'curve / strokeWidth', type: "'monotone' | 'linear' | 'step' · number", default: "'monotone' · 1.5", description: 'Line shape and weight.' },
            { name: 'aria-label', type: 'string', description: 'Defaults to "Trend, N points, from X to Y".' },
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List items={['role="img" with a label. It is decorative detail, so the number beside it must carry the information.']} />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['The line draws in (600ms) or the bars grow; nothing animates during server render. Reduced motion skips it.']} />
      </Section>
    </DocPage>
  );
}
