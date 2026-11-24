import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import StatKpis from '@/examples/stat/kpis';
import StatCards from '@/examples/stat/cards';

export const metadata: Metadata = { title: 'Stat & metric' };

export default function StatPage() {
  return (
    <DocPage href="/docs/components/stat">
      <Section id="kpis" title="KPI row">
        <P>
          A <Code>StatGroup</Code> with the <Code>shared</Code> variant draws one surface with hairlines between metrics. Each stat can hold a sparkline. Server Component–safe.
        </P>
        <Example component="stat" file="stat/kpis" title="KPI row with sparklines" align="stretch">
          <StatKpis />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Headline numbers at the top of a dashboard or a detail page.',
            'A single number with context: the change, the period, a trend.',
          ]}
        />
        <P>Not for many numbers in rows (use a table) or for the trend itself (use a chart).</P>
      </Section>

      <Section id="cards" title="Separate cards and tones">
        <P>
          The default variant gives every stat its own card. Delta colour follows meaning, not direction: set <Code>tone</Code> when down is good (churn) or up is bad (outstanding balance), and use <Code>flat</Code> for no change.
        </P>
        <Example component="stat" file="stat/cards" title="Separate cards" align="stretch">
          <StatCards />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="StatGroup"
          rows={[
            { name: 'variant', type: "'separate' | 'shared'", default: "'separate'", description: 'Cards, or one surface with hairlines.' },
            { name: 'minItemWidth', type: 'string', default: "'13rem'", description: 'Narrowest a stat gets before the grid wraps.' },
          ]}
        />
        <PropsTable
          title="StatDelta"
          rows={[
            { name: 'value', type: 'ReactNode', description: 'The formatted change, e.g. "12.4%".' },
            { name: 'direction', type: "'up' | 'down' | 'flat'", default: "'up'", description: 'Arrow direction.' },
            { name: 'tone', type: "'positive' | 'negative' | 'neutral'", description: 'Colour; defaults from direction.' },
            { name: 'comparison', type: 'ReactNode', description: 'Context, e.g. "vs last month".' },
          ]}
        />
        <P>
          <Code>Stat</Code>, <Code>StatLabel</Code>, <Code>StatValue</Code>, <Code>StatHelp</Code> and <Code>StatChart</Code> are plain elements that forward their props. Put an <Code>AnimatedNumber</Code> inside <Code>StatValue</Code> for a rolling number.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The delta includes hidden text (“Up”, “Down”) so the arrow and colour are not the only signal.',
            'Give each sparkline an aria-label that says what it shows.',
            'Success and destructive text colours pass 4.5:1 on the surface in light and dark.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['None by default. Wrap a group in ui-stagger for a soft-rise entrance.']} />
      </Section>
    </DocPage>
  );
}
