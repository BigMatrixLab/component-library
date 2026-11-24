import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SheetSettings from '@/examples/sheet/settings';
import SheetMobileNav from '@/examples/sheet/mobile-nav';
import SheetBottom from '@/examples/sheet/bottom-sheet';
import SheetSides from '@/examples/sheet/sides';

export const metadata: Metadata = { title: 'Sheet' };

export default function SheetPage() {
  return (
    <DocPage href="/docs/components/sheet">
      <Section id="usage" title="Usage">
        <P>
          A sheet is a panel that slides in from an edge while the page stays in view behind it. It is built on the native <Code>&lt;dialog&gt;</Code> like Dialog, so the top layer, focus containment and an inert page come from the browser. The panel moves on the smooth spring (no overshoot) while the overlay fades.
        </P>
        <Example component="sheet" file="sheet/settings" title="Settings sheet">
          <SheetSettings />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Focused secondary work that is longer than a dialog: settings, filters, a record’s details.',
            'Navigation on phones (a left sheet) and quick actions (a bottom sheet).',
          ]}
        />
        <P>Not for: a short decision (use a dialog), a destructive confirmation (use an alert dialog), small contextual content (use a popover).</P>
      </Section>

      <Section id="sides" title="Sides and sizes">
        <P>
          <Code>side</Code> picks the edge. <Code>size</Code> sets the width of a side sheet (320 / 400 / 520 / 640px, or <Code>full</Code>) and the maximum width of a top or bottom sheet.
        </P>
        <Example component="sheet" file="sheet/sides" title="Four sides">
          <SheetSides />
        </Example>
      </Section>

      <Section id="mobile-nav" title="Mobile navigation">
        <P>
          On phones a left or right sheet can take the whole screen with <Code>mobileFull</Code>. This example is controlled so that choosing a link closes the sheet.
        </P>
        <Example component="sheet" file="sheet/mobile-nav" title="Mobile navigation">
          <SheetMobileNav />
        </Example>
      </Section>

      <Section id="bottom" title="Bottom sheet">
        <P>
          A bottom sheet shows a grab handle. Drag it down to dismiss: past 35% of the height, or with a quick flick, it closes from where you let go; otherwise it springs back. Esc and the overlay still work.
        </P>
        <Example component="sheet" file="sheet/bottom-sheet" title="Bottom sheet" minHeight={160}>
          <SheetBottom />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Sheet"
          rows={[
            { name: 'open', type: 'boolean', description: 'Controlled open state.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the sheet asks to open or close.' },
          ]}
        />
        <PropsTable
          title="SheetContent"
          rows={[
            { name: 'side', type: "'right' | 'left' | 'top' | 'bottom'", default: "'right'", description: 'Edge the sheet slides in from.' },
            { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Width of a side sheet: 320 / 400 / 520 / 640px or full.' },
            { name: 'dismissible', type: 'boolean', default: 'true', description: 'Close on Esc and on an overlay click.' },
            { name: 'showClose', type: 'boolean', default: 'true', description: 'The × button in the corner.' },
            { name: 'showHandle', type: 'boolean', default: 'true', description: 'Grab handle and drag-to-dismiss on a bottom sheet.' },
            { name: 'mobileFull', type: 'boolean', default: 'false', description: 'A left/right sheet fills the screen width below 640px.' },
            { name: 'panelClassName', type: 'string', description: 'Classes for the panel. className styles the overlay layer.' },
          ]}
        />
        <P>
          <Code>SheetTrigger</Code> and <Code>SheetClose</Code> are buttons; pass <Code>asChild</Code> to use your own. <Code>SheetHeader</Code>, <Code>SheetTitle</Code>, <Code>SheetDescription</Code>, <Code>SheetBody</Code> (scrolls) and <Code>SheetFooter</Code> are layout parts.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Esc', 'Closes the sheet (unless dismissible is false).'],
            ['Tab', 'Moves focus to the next element inside the sheet.'],
            ['Shift + Tab', 'Moves focus to the previous element inside the sheet.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA modal dialog pattern; the page behind is inert.',
            'The title and description are wired to aria-labelledby / aria-describedby when present.',
            'Focus moves to the first [autofocus] field, otherwise the panel, and returns to the trigger on close.',
            'The grab handle is decorative. Dragging is an extra; Esc and the close controls always work.',
            'Page scroll is locked while open, without layout shift from the scrollbar.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Open: the panel slides in on the smooth spring (about 540ms, no overshoot); the overlay fades in.',
            'Close: the panel slides out in 200ms; the sheet unmounts only after the animation ends.',
            'Drag: the panel follows the pointer one to one and the overlay fades with it.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
