import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import PopoverShareLink from '@/examples/popover/share-link';
import PopoverDimensions from '@/examples/popover/dimensions';
import PopoverPlacement from '@/examples/popover/placement';

export const metadata: Metadata = { title: 'Popover' };

export default function PopoverPage() {
  return (
    <DocPage href="/docs/components/popover">
      <Section id="usage" title="Usage">
        <P>
          Compose <Code>Popover</Code>, <Code>PopoverTrigger</Code> and <Code>PopoverContent</Code>. The content floats in the browser top layer next to the trigger, so an <Code>overflow: hidden</Code> parent never clips it. It is non-modal: the page stays usable and Esc or a click outside closes it.
        </P>
        <Example component="popover" file="popover/share-link" title="Share link" minHeight={260} align="start">
          <PopoverShareLink />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Small contextual content or a short form that belongs to one control.',
            'Anything that should not block the page.',
          ]}
        />
        <P>Not for: a decision that must be finished first (use a dialog), a list of actions (use a dropdown menu), or a one-line hint (use a tooltip).</P>
      </Section>

      <Section id="form" title="Forms and closing">
        <P>
          Focus moves to the first field when it opens. <Code>PopoverClose</Code> closes it from inside; focus goes back to the trigger.
        </P>
        <Example component="popover" file="popover/dimensions" title="Dimensions" minHeight={300} align="start">
          <PopoverDimensions />
        </Example>
      </Section>

      <Section id="placement" title="Placement and arrow">
        <P>
          <Code>placement</Code> picks the side (and <Code>-start</Code> / <Code>-end</Code> alignment); it flips when there is no room. Add <Code>arrow</Code> to point at the trigger. <Code>matchWidth</Code> makes the panel at least as wide as the trigger.
        </P>
        <Example component="popover" file="popover/placement" title="Placement" minHeight={300}>
          <PopoverPlacement />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Popover"
          rows={[
            { name: 'open', type: 'boolean', description: 'Controlled open state.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the popover asks to open or close.' },
          ]}
        />
        <PropsTable
          title="PopoverContent"
          rows={[
            { name: 'placement', type: "'top' | 'right' | 'bottom' | 'left' (+ '-start' | '-end')", default: "'bottom'", description: 'Preferred side and alignment.' },
            { name: 'align', type: "'start' | 'center' | 'end'", description: 'Overrides the alignment of placement.' },
            { name: 'offset', type: 'number', default: '6 (10 with arrow)', description: 'Gap to the trigger, px.' },
            { name: 'matchWidth', type: 'boolean', default: 'false', description: 'At least as wide as the trigger.' },
            { name: 'arrow', type: 'boolean', default: 'false', description: 'Show an arrow pointing at the trigger.' },
            { name: 'dismissible', type: 'boolean', default: 'true', description: 'Close on Esc, an outside click, or Tab leaving.' },
          ]}
        />
        <P>
          <Code>PopoverTrigger</Code> and <Code>PopoverClose</Code> are buttons; pass <Code>asChild</Code> to use your own. Give the content an <Code>aria-label</Code> if the trigger’s text is not a good name for it.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter / Space', 'On the trigger: toggles the popover.'],
            ['Tab', 'Moves through the content; leaving it closes the popover.'],
            ['Esc', 'Closes the popover and returns focus to the trigger.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Non-modal dialog: the trigger has aria-haspopup="dialog", aria-expanded and aria-controls; the content is role="dialog".',
            'Focus moves into the content on open and returns to the trigger on close (also in Safari and Firefox, which do not focus buttons on click).',
            'After an outside click focus stays where the person clicked.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Open: pops from the trigger side, scale .96, 4px travel, light blur (220ms, ease-out).',
            'Close: 160ms fade; unmounts after the animation ends.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
