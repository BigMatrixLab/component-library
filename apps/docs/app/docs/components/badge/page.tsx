import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import BadgeVariants from '@/examples/badge/variants';
import BadgeStatus from '@/examples/badge/status';
import BadgeRemovable from '@/examples/badge/removable';
import BadgeCounter from '@/examples/badge/counter';

export const metadata: Metadata = { title: 'Badge' };

export default function BadgePage() {
  return (
    <DocPage href="/docs/components/badge">
      <Section id="variants" title="Variants and sizes">
        <P>Three neutral variants for metadata, in three sizes: 20, 24 and 28px tall.</P>
        <Example component="badge" file="badge/variants" title="Variants and sizes">
          <BadgeVariants />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Short status or metadata next to a title or a table cell: Paid, Draft, Beta, v2.4.',
            'A count on an icon button or avatar: unread messages, open tasks.',
            'Removable tags and filters that the user adds and takes away.',
          ]}
        />
        <P>Not for: actions (use a button), long text (use a description), or messages that need attention (use an alert).</P>
      </Section>

      <Section id="status" title="Status tones">
        <P>
          Success, warning, destructive and info use a faint tint with <Code>-text</Code> colour, so they stay readable in dark mode. Colour is only ever spent on status: pair it with a word or icon, never colour alone. <Code>dot</Code> adds a status dot; <Code>live</Code> makes it pulse for something happening right now.
        </P>
        <Example component="badge" file="badge/status" title="Status tones">
          <BadgeStatus />
        </Example>
      </Section>

      <Section id="removable" title="Removable">
        <P>
          <Code>BadgeRemove</Code> is the only client part; the badge around it stays a Server Component. Give each × a label that names what it removes.
        </P>
        <Example component="badge" file="badge/removable" title="Removable">
          <BadgeRemovable />
        </Example>
      </Section>

      <Section id="counter" title="Counter on an icon button">
        <P>
          <Code>BadgeAnchor</Code> pins a solid badge to the corner of the element beside it. Put the meaning in visually hidden text and in the button’s label.
        </P>
        <Example component="badge" file="badge/counter" title="Counter badge">
          <BadgeCounter />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Badge"
          rows={[
            { name: 'variant', type: "'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info'", default: "'default'", description: 'Colour. The last four are status tones.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height 20 / 24 / 28px.' },
            { name: 'solid', type: 'boolean', default: 'false', description: 'Status tones: solid fill instead of a tint.' },
            { name: 'dot', type: 'boolean', default: 'false', description: 'Leading status dot.' },
            { name: 'live', type: 'boolean', default: 'false', description: 'Pulsing dot. Implies dot.' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child (e.g. a link) with badge styles.' },
            { name: '...props', type: 'HTMLAttributes<HTMLSpanElement>', description: 'Forwarded, including ref and className.' },
          ]}
        />
        <PropsTable
          title="BadgeRemove"
          rows={[
            { name: 'aria-label', type: 'string', default: "'Remove'", description: 'Name what is removed: “Remove Design”.' },
            { name: '...props', type: 'ButtonHTMLAttributes', description: 'Forwarded to the <button>, including onClick.' },
          ]}
        />
        <P>
          <Code>BadgeAnchor</Code> wraps an element and a Badge. <Code>badgeClassName({'{ variant, size }'})</Code> returns the classes; in plain HTML: <Code>ui-badge ui-badge-success</Code>.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A badge is plain text in a <span>: no role, so its text is read in order with its neighbours.',
            'The status dot is decorative (aria-hidden); the word beside it carries the meaning.',
            'Tones use the -text colour tokens, measured at 4.5:1 or better on surfaces in light and dark.',
            'BadgeRemove is a real button with a label you supply; its hit area is 24px even though the × is smaller.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The live dot pulses once every 1.8s with an expanding ring.',
            'A counter badge pops in on the soft-rise curve; the × presses to .88 on the snappy spring.',
            'Reduced motion: the ring and pop are dropped; the dot stays.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
