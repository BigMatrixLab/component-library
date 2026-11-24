import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import LiveRevenue from '@/examples/animated-counter/revenue';
import CountUpStats from '@/examples/animated-counter/count-up';
import NumberFormats from '@/examples/animated-counter/formats';

export const metadata: Metadata = { title: 'Animated counter' };

export default function AnimatedCounterPage() {
  return (
    <DocPage href="/docs/components/animated-counter">
      <Section id="live" title="Live revenue">
        <P>
          Each digit is a column that rolls to its new value on the morph spring. Width stays steady and the currency symbol and separators never move.
        </P>
        <Example component="animated-counter" file="animated-counter/revenue" title="Live revenue counter">
          <LiveRevenue />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A number that changes while the user watches: revenue, active users, a balance.',
            <>A figure that should count up once on entry: use <Code>useCountUp</Code>.</>,
          ]}
        />
        <P>Not for tables of numbers that change on every sort or filter, where the motion would be noise.</P>
      </Section>

      <Section id="formats" title="Formats and locales">
        <P>
          Formatting is <Code>Intl.NumberFormat</Code>, so currency, percent, compact, signed and any locale work. Digits are matched by place value: 999 becoming 1,000 rolls the existing digits and lets the new ones rise in.
        </P>
        <Example component="animated-counter" file="animated-counter/formats" title="Number formats">
          <NumberFormats />
        </Example>
      </Section>

      <Section id="count-up" title="Count up on view">
        <P>
          <Code>useCountUp</Code> returns a float that tweens from zero when the element first scrolls into view. Format it yourself. For rolling digits that start at zero, use <Code>animateOnView</Code> on <Code>AnimatedNumber</Code>.
        </P>
        <Example component="animated-counter" file="animated-counter/count-up" title="Count up when visible">
          <CountUpStats />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="AnimatedNumber"
          rows={[
            { name: 'value', type: 'number', description: 'The number to show.' },
            { name: 'format', type: 'Intl.NumberFormatOptions', description: 'Currency, percent, compact, signDisplay…' },
            { name: 'locale', type: 'string', default: "'en-US'", description: 'Fixed by default so server and client render the same.' },
            { name: 'prefix / suffix', type: 'string', description: 'Static text around the number.' },
            { name: 'animateOnView', type: 'boolean', default: 'false', description: 'Start at 0 and roll up when first visible.' },
          ]}
        />
        <PropsTable
          title="useCountUp({ … }) → { ref, value, inView }"
          rows={[
            { name: 'end / start', type: 'number', default: '— / 0', description: 'Where to count to and from.' },
            { name: 'duration / delay', type: 'number', default: '1400 / 0', description: 'In milliseconds.' },
            { name: 'threshold', type: 'number', default: '0.4', description: 'Visible fraction that starts the count.' },
            { name: 'once', type: 'boolean', default: 'true', description: 'Count only the first time it is seen.' },
            { name: 'disabled', type: 'boolean', description: 'Return end immediately.' },
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Screen readers read one plain text node (“$128,430.50”); the rolling cells are aria-hidden.',
            <>It is not a live region by default. For a number people should hear updated, pass <Code>aria-live=&quot;polite&quot;</Code> and keep the update rate low.</>,
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Digits translate on the morph spring (~550ms). New characters rise in over 220ms with a light blur.',
            'Reduced motion: digits change instantly and useCountUp jumps to its end value.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
