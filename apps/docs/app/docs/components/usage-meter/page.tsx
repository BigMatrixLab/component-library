import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import UsageMeterStorage from '@/examples/usage-meter/storage';
import UsageMeterThresholds from '@/examples/usage-meter/thresholds';
import UsageMeterSegmented from '@/examples/usage-meter/segmented';

export const metadata: Metadata = { title: 'Usage meter' };

export default function UsageMeterPage() {
  return (
    <DocPage href="/docs/components/usage-meter">
      <Section id="storage" title="Storage">
        <P>How much of a quota is used, in words and as a bar. The fill grows in once when it mounts.</P>
        <Example component="usage-meter" file="usage-meter/storage" title="Storage">
          <UsageMeterStorage />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A plan limit or quota: storage, seats, API requests, build minutes.',
            'Anything where “how close am I to the limit” matters more than the exact number.',
            'Breaking one quota into categories (photos, videos, mail) with a segmented bar.',
          ]}
        />
        <P>Not for: work that finishes (an upload, a setup flow) — use Progress. Not for comparing many values — use a bar chart.</P>
      </Section>

      <Section id="thresholds" title="Thresholds">
        <P>
          At 75% the fill turns to the warning colour and at 90% to destructive, with a status line so colour is never the only signal. Change the points with <Code>thresholds</Code>, or pass <Code>false</Code> for none. Use up requests to see it shift.
        </P>
        <Example component="usage-meter" file="usage-meter/thresholds" title="Thresholds">
          <UsageMeterThresholds />
        </Example>
      </Section>

      <Section id="segmented" title="Segmented">
        <P>
          Pass <Code>segments</Code> to split the fill by category. Each takes the next data-series colour and gets a legend entry; the total is their sum. Thresholds still show in the status line.
        </P>
        <Example component="usage-meter" file="usage-meter/segmented" title="Segmented">
          <UsageMeterSegmented />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="UsageMeter"
          rows={[
            { name: 'value', type: 'number', description: 'Amount used. Omit with segments to use their sum.' },
            { name: 'max', type: 'number', description: 'The quota. Required.' },
            { name: 'label', type: 'ReactNode', description: 'Visible name; names the meter. Without it, pass aria-label.' },
            { name: 'unit', type: 'string', description: 'Appended to numbers: "GB" gives "7.2 GB of 10 GB".' },
            { name: 'formatValue', type: '(value: number) => string', description: 'Custom number format (replaces unit).' },
            { name: 'summary', type: 'ReactNode | false', description: 'Replace or hide the "x of y" text.' },
            { name: 'thresholds', type: '{ warning?: number; destructive?: number } | false', default: '{ warning: 75, destructive: 90 }', description: 'Percentages where the colour shifts.' },
            { name: 'segments', type: '{ label: string; value: number; color?: string }[]', description: 'Categories; colours default to --ui-series-1…6.' },
            { name: 'legend', type: 'boolean', default: 'true with segments', description: 'Show the legend list.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Track thickness: 4 / 8 / 12px.' },
            { name: 'description', type: 'ReactNode', description: 'Secondary text under the bar, wired with aria-describedby.' },
            { name: 'labels', type: '{ of?; warning?; destructive?; full? }', description: 'Text for i18n.' },
            { name: 'getValueText', type: '(value, max) => string', description: 'Screen-reader value. Default "7.2 GB of 10 GB (72%)" plus the status.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the root; aria-label/-labelledby/-describedby go to the meter.' },
          ]}
        />
        <P>
          Data attributes: <Code>data-tone</Code> (<Code>default | warning | destructive</Code>) and <Code>data-segmented</Code> on the root. <Code>usageMeterTone(pct, thresholds)</Code> returns the tone for your own UI.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['—', 'Not interactive; it is skipped by Tab. Links or buttons you put inside keep their own keys.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="meter" (WAI-ARIA meter pattern) with aria-valuemin, -max, -now and a readable aria-valuetext.',
            'The value text includes the status (“approaching limit”), and the status is visible text with an icon — colour is never the only signal.',
            'The visual “x of y” summary is hidden from screen readers so it is not read twice; the legend is a real list.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'On mount the fill uncovers from the start edge on the smooth spring (CSS only, so it works in Server Components).',
            'Value changes glide on the smooth spring; colours cross-fade.',
            'Reduced motion: the fill appears at its value with no movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
