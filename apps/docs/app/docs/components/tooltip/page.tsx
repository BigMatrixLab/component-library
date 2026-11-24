import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import TooltipToolbar from '@/examples/tooltip/toolbar';
import TooltipPlacement from '@/examples/tooltip/placement';

export const metadata: Metadata = { title: 'Tooltip' };

export default function TooltipPage() {
  return (
    <DocPage href="/docs/components/tooltip">
      <Section id="usage" title="Usage">
        <P>
          Wrap a group of tooltips in <Code>TooltipProvider</Code>, then compose <Code>Tooltip</Code>, <Code>TooltipTrigger</Code> and <Code>TooltipContent</Code>. Hover a button for a moment, or Tab to it: the bubble appears next to it. Move along the toolbar and the next tooltips open at once.
        </P>
        <Example component="tooltip" file="tooltip/toolbar" title="Toolbar tooltips" minHeight={160}>
          <TooltipToolbar />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Naming an icon-only button, or showing its keyboard shortcut.',
            'One short line of supporting text that is nice to have, never essential.',
          ]}
        />
        <P>
          Not for: anything interactive or long (use a popover), anything touch users must read (tooltips never open from touch), or errors and instructions (put them on the page).
        </P>
      </Section>

      <Section id="placement" title="Placement">
        <P>
          <Code>placement</Code> picks the preferred side; the tooltip flips to the opposite side when there is no room and shifts to stay inside the viewport. Add <Code>shortcut</Code> for a key hint.
        </P>
        <Example component="tooltip" file="tooltip/placement" title="Placement" minHeight={200}>
          <TooltipPlacement />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="TooltipProvider"
          rows={[
            { name: 'delayDuration', type: 'number', default: '700', description: 'Hover delay before a tooltip opens, ms.' },
            { name: 'skipDelayDuration', type: 'number', default: '300', description: 'After one closes, moving to another within this window opens it with no delay.' },
          ]}
        />
        <PropsTable
          title="Tooltip"
          rows={[
            { name: 'open', type: 'boolean', description: 'Controlled open state.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the tooltip asks to open or close.' },
            { name: 'delayDuration', type: 'number', description: 'Overrides the provider’s hover delay for this tooltip.' },
          ]}
        />
        <PropsTable
          title="TooltipContent"
          rows={[
            { name: 'placement', type: "'top' | 'right' | 'bottom' | 'left' (+ '-start' | '-end')", default: "'top'", description: 'Preferred side and alignment.' },
            { name: 'offset', type: 'number', default: '6', description: 'Gap to the trigger, px.' },
            { name: 'shortcut', type: 'ReactNode', description: 'A key hint shown inside the bubble.' },
          ]}
        />
        <P>
          <Code>TooltipTrigger</Code> renders a button; pass <Code>asChild</Code> to use your own element. A disabled button emits no pointer events, so wrap it in a span and make the span the trigger.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Focusing the trigger with the keyboard opens the tooltip at once.'],
            ['Esc', 'Closes the tooltip.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The bubble has role="tooltip" and the trigger points at it with aria-describedby while it is open.',
            'Opens on keyboard focus but not on a pointer click, and never from touch.',
            'Hoverable: the pointer can move onto the bubble without it closing (WCAG 1.4.13); Esc dismisses it.',
            'Closes on scroll, pointer down and blur.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Open: a tiny pop from the trigger, scale .96 with a light blur (150ms, ease-out).',
            'Close: 100ms fade. Inside the skip window the next tooltip appears with no delay.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
