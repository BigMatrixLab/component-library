import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import HoverCardUser from '@/examples/hover-card/user';

export const metadata: Metadata = { title: 'Hover card' };

export default function HoverCardPage() {
  return (
    <DocPage href="/docs/components/hover-card">
      <Section id="usage" title="Usage">
        <P>
          A rich preview of a link, shown on hover or keyboard focus. Compose <Code>HoverCard</Code>, a <Code>HoverCardTrigger</Code> (an <Code>&lt;a&gt;</Code>) and <Code>HoverCardContent</Code>. It opens after 700ms and closes 300ms after the pointer has left both the link and the card, so you can move onto the card.
        </P>
        <Example component="hover-card" file="hover-card/user" title="User preview" minHeight={320}>
          <HoverCardUser />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Extra context for a mention or link: a profile, a repository, a document.',
            'Only content that is also reachable by following the link. The card never opens on touch.',
          ]}
        />
        <P>Not for: anything the person must act on (use a popover), or short labels (use a tooltip).</P>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="HoverCard"
          rows={[
            { name: 'open', type: 'boolean', description: 'Controlled open state.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the card asks to open or close.' },
            { name: 'openDelay', type: 'number', default: '700', description: 'Hover time before it opens, ms.' },
            { name: 'closeDelay', type: 'number', default: '300', description: 'Time after leaving trigger and card before it closes, ms.' },
          ]}
        />
        <PropsTable
          title="HoverCardContent"
          rows={[
            { name: 'placement', type: "'bottom' | 'top' | … (+ '-start' | '-end')", default: "'bottom'", description: 'Preferred side; flips when there is no room.' },
            { name: 'offset', type: 'number', default: '8', description: 'Gap to the trigger, px.' },
            { name: 'arrow', type: 'boolean', default: 'false', description: 'Draw an arrow pointing at the trigger.' },
          ]}
        />
        <P>
          <Code>HoverCardTrigger</Code> takes <Code>asChild</Code> to use your own link, such as a Next.js <Code>Link</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab to the link', 'Opens the card straight away (no delay for keyboard focus).'],
            ['Tab', 'Moves into the card when it holds links or buttons; leaving it closes the card.'],
            ['Esc', 'Closes the card.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The card is supplementary: the trigger is a real link and must work without it.',
            'Keyboard focus on the link opens it; touch never does.',
            'Interactive content inside the card is reachable with Tab because the card follows the link in the DOM.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Open: pops from the trigger side, 6px travel, scale .96 (220ms, ease-out). Close: 160ms fade.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
