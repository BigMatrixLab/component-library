import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import DashboardAnalytics from '@/examples/blocks/dashboard/analytics';
import DashboardCompact from '@/examples/blocks/dashboard/compact';
import DashboardSales from '@/examples/blocks/dashboard/sales';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardBlockPage() {
  return (
    <DocPage href="/docs/blocks/dashboard" wide>
      <Section id="analytics" title="Analytics overview">
        <P>
          KPIs with sparklines and deltas, a revenue trend against the previous period, revenue by channel, the latest orders and a
          store activity feed. The date range drives every number on the page. Each block is one self-contained file: copy it, swap
          the data for your own, and keep the layout.
        </P>
        <Example component="blocks/dashboard" file="blocks/dashboard/analytics" title="Analytics overview" align="stretch" minHeight={640}>
          <DashboardAnalytics />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'The first page after sign-in, when people need to know how things are going before they do anything.',
            'An at-a-glance view that links into the detail pages (orders, deals, deploys), not a replacement for them.',
          ]}
        />
        <P>
          Not for: a report people read top to bottom (use a document page with one chart per finding), or a single number that
          needs explaining (use a Stat with help text).
        </P>
      </Section>

      <Section id="sales" title="Sales and operations">
        <P>
          A quota gauge, ARR split by plan, plan usage meters that warn at 75% and 90%, stacked bookings by month and a rep
          leaderboard. The region switch rescales every figure.
        </P>
        <Example component="blocks/dashboard" file="blocks/dashboard/sales" title="Sales and operations" align="stretch" minHeight={640}>
          <DashboardSales />
        </Example>
      </Section>

      <Section id="compact" title="Compact cards">
        <P>
          Small cards with 16px padding for a dense status board or a widget area. It has no state and passes no functions to the
          charts, so in Next.js it renders as a Server Component; only the charts hydrate.
        </P>
        <Example component="blocks/dashboard" file="blocks/dashboard/compact" title="Compact cards" align="stretch" minHeight={480}>
          <DashboardCompact />
        </Example>
      </Section>

      <Section id="anatomy" title="Anatomy">
        <List
          items={[
            <>
              Page header: an <Code>h2</Code> title, a one-line context (store, period, quarter) and the page controls on the right, a{' '}
              <Code>SegmentedControl</Code> for the range plus at most one primary action.
            </>,
            <>
              KPI row: <Code>StatGroup</Code> with <Code>Stat</Code>, <Code>StatDelta</Code> and a <Code>Sparkline</Code> in{' '}
              <Code>StatChart</Code>. Set <Code>tone</Code> on the delta when down is good (churn, latency, cycle time).
            </>,
            <>
              Charts in <Code>Card</Code>s: <Code>AreaChart</Code> for trends, <Code>BarChart</Code> for comparisons,{' '}
              <Code>DonutChart</Code> for a split of one total, <Code>RadialChart</Code> for progress towards a goal.
            </>,
            <>
              Detail: <Code>DataTable</Code> for rows people act on, <Code>Timeline</Code> for what happened,{' '}
              <Code>UsageMeter</Code> and <Code>Progress</Code> for limits and quotas.
            </>,
          ]}
        />
      </Section>

      <Section id="design" title="Design rules">
        <List
          items={[
            'One accent per chart: the series that matters gets series-1; comparisons (previous period) use the muted foreground.',
            'Cards rest on a 1px border with no shadow; the page background stays plain.',
            'Every number is tabular and formatted with Intl (currency, compact, percent) so columns line up and nothing jumps when a range changes.',
            'Deltas always say what they compare against ("vs previous period", "vs Q3").',
          ]}
        />
      </Section>

      <Section id="responsive" title="Responsive">
        <P>
          The blocks respond to the width of their own container (Tailwind <Code>@container</Code> queries), not the window, so they
          behave the same in a full page, next to a sidebar or inside this preview. KPI rows wrap by available width; chart rows go from
          one column to two or three at 56rem; tables scroll sideways inside their card. Nothing overflows at 360px.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>
              Each chart has an accessible name and a data table for screen readers; sparklines take an <Code>aria-label</Code> that
              says what they show.
            </>,
            'Deltas announce their direction in words ("Up 12.4%"), not only with an arrow and a colour.',
            'The range and region switches are radio groups: arrow keys move between options.',
            <>
              Lists of reps, endpoints and deploys are real lists with an <Code>aria-label</Code>; progress bars name the person or
              endpoint they measure.
            </>,
          ]}
        />
      </Section>
    </DocPage>
  );
}
