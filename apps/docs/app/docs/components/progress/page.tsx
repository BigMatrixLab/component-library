import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ProgressLinear from '@/examples/progress/linear';
import ProgressCircular from '@/examples/progress/circular';
import ProgressLive from '@/examples/progress/live';

export const metadata: Metadata = { title: 'Progress' };

export default function ProgressPage() {
  return (
    <DocPage href="/docs/components/progress">
      <Section id="linear" title="Linear">
        <P>
          A bar for a known amount of work. Set <Code>max</Code> when the total is not 100. Use a status tone only when the colour carries meaning: nearly full, complete, failed.
        </P>
        <Example component="progress" file="progress/linear" title="Linear progress">
          <ProgressLinear />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Uploads, installs, onboarding steps and quotas: anything with a known total.',
            'Without a value, the bar becomes indeterminate: a short sliding bar for work of unknown length.',
          ]}
        />
        <P>Not for: a plain wait with no measure (use a spinner), or a value that is a score or rating (use a meter or chart).</P>
      </Section>

      <Section id="circular" title="Circular">
        <P>
          <Code>ProgressCircle</Code> draws the same value as a ring with the percentage in the middle, or your own content. Four sizes from 40 to 128px.
        </P>
        <Example component="progress" file="progress/circular" title="Circular progress">
          <ProgressCircular />
        </Example>
      </Section>

      <Section id="live" title="Live updates and indeterminate">
        <P>
          Value changes glide on the smooth spring and never overshoot. Pass <Code>value=&#123;null&#125;</Code> (or omit it) for the indeterminate state. Press start, or switch back to indeterminate.
        </P>
        <Example component="progress" file="progress/live" title="Live progress" align="start">
          <ProgressLive />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Progress"
          rows={[
            { name: 'value', type: 'number | null', description: 'Current value. null or omitted: indeterminate.' },
            { name: 'max', type: 'number', default: '100', description: 'The value that means done.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Track thickness 4 / 8 / 12px.' },
            { name: 'tone', type: "'default' | 'success' | 'warning' | 'destructive' | 'info'", default: "'default'", description: 'Indicator colour.' },
            { name: 'getValueText', type: '(value, max) => string', description: 'Text for aria-valuetext, e.g. “3 of 5 files”. Default: the percentage.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded, including ref and aria-label.' },
          ]}
        />
        <PropsTable
          title="ProgressCircle"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Diameter 40 / 64 / 96 / 128px.' },
            { name: 'children', type: 'ReactNode', description: 'Centre content. Default: the percentage. null for an empty ring.' },
            { name: '...', type: 'value, max, tone, getValueText', description: 'Same as Progress.' },
          ]}
        />
        <P>
          State is exposed as <Code>data-state=&quot;indeterminate | loading | complete&quot;</Code> and the value as the <Code>--ui-progress-pct</Code> custom property.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="progressbar" with aria-valuemin, aria-valuemax and aria-valuenow. Indeterminate bars omit aria-valuenow.',
            'Always give it a name: aria-label, or aria-labelledby pointing at a visible label.',
            'aria-valuetext defaults to the percentage; pass getValueText for something more useful.',
            'Progressbars are not live regions: announce milestones yourself (“Upload complete”) in a polite status.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Value changes move the indicator with transform on --ui-spring-smooth (the ring animates stroke-dashoffset). No overshoot.',
            'Indeterminate: a 40% bar slides across in 1.4s; the ring spins.',
            'Reduced motion: the value still updates; the indeterminate bar becomes a faint full-width bar.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
