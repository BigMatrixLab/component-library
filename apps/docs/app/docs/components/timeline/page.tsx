import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import TimelineDeploys from '@/examples/timeline/deploys';
import TimelineMarkers from '@/examples/timeline/markers';

export const metadata: Metadata = { title: 'Timeline' };

export default function TimelinePage() {
  return (
    <DocPage href="/docs/components/timeline">
      <Section id="deploys" title="Deploy activity">
        <P>Events in order along one connector line, split by day with <Code>TimelineGroup</Code>. Status tones colour the marker; the text stays neutral.</P>
        <Example component="timeline" file="timeline/deploys" title="Deploy activity" align="start">
          <TimelineDeploys />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'An activity feed, audit log or order history where the sequence matters.',
            'Status that changes over time: build and deploy steps, shipment tracking.',
          ]}
        />
        <P>Not for steps the person has to complete (use a stepper) or for unordered facts (use a description list).</P>
      </Section>

      <Section id="markers" title="Markers">
        <P>
          A dot is the default. Pass an <Code>Icon</Code> as <Code>marker</Code> for a tinted circle, or an <Code>Avatar size=&quot;xs&quot;</Code> with <Code>markerType=&quot;avatar&quot;</Code> to show who did it.
        </P>
        <Example component="timeline" file="timeline/markers" title="Markers" align="start">
          <TimelineMarkers />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="TimelineItem"
          rows={[
            { name: 'tone', type: "'default' | 'success' | 'warning' | 'destructive' | 'info'", default: "'default'", description: 'Marker colour.' },
            { name: 'marker', type: 'ReactNode', description: 'Replaces the dot: an Icon or a 24px Avatar.' },
            { name: 'markerType', type: "'icon' | 'avatar'", default: "'icon'", description: 'Icons are put in a tinted circle; avatars are kept as they are.' },
          ]}
        />
        <PropsTable
          title="TimelineGroup"
          rows={[
            { name: 'label', type: 'ReactNode', description: 'The day or section heading.' },
            { name: 'as', type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'", default: "'h3'", description: 'Heading element.' },
          ]}
        />
        <P>
          <Code>Timeline</Code> is an <Code>&lt;ol&gt;</Code>. <Code>TimelineHeader</Code> lays the title and time on one line; <Code>TimelineTime</Code> is a <Code>&lt;time&gt;</Code> (pass <Code>dateTime</Code>); <Code>TimelineTitle</Code> and <Code>TimelineDescription</Code> are text. Every part forwards <Code>ref</Code> and <Code>className</Code> and is Server Component–safe.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A real ordered list: screen readers announce “list, 6 items”. Groups nest a labelled list inside one item.',
            'Times use the <time> element with an ISO dateTime.',
            'Status is never colour alone: put the outcome in the title (“Deploy failed”) as well as the tone.',
            'Dot markers are decorative; icon markers should be decorative too, so name the state in text.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['Each item rises in once on mount.', 'Reduced motion: items appear without movement.']} />
      </Section>
    </DocPage>
  );
}
