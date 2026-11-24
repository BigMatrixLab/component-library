import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ResizableMailClient from '@/examples/resizable/mail-client';
import ResizableVertical from '@/examples/resizable/vertical';

export const metadata: Metadata = { title: 'Resizable panels' };

export default function ResizablePage() {
  return (
    <DocPage href="/docs/components/resizable" wide>
      <Section id="mail-client" title="Mail client">
        <P>
          Three panes you can trade space between. Drag a divider or focus it and use the arrow keys. The first pane is collapsible: press Enter on its divider to fold it away and again to bring it back. The layout is saved under the group’s <Code>id</Code>, so a reload keeps it.
        </P>
        <Example component="resizable" file="resizable/mail-client" title="Mail client" align="stretch" minHeight={500}>
          <ResizableMailClient />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Workspaces where people balance two or three regions: mail, code editors, file browsers.',
            'Panes whose useful size depends on the task, such as a terminal beside code.',
          ]}
        />
        <P>Not for a fixed layout (use CSS grid) or for sidebars that only open and close (use a sidebar or sheet).</P>
      </Section>

      <Section id="vertical" title="Vertical">
        <P>
          <Code>direction=&quot;vertical&quot;</Code> stacks the panels. <Code>withHandle</Code> adds a grip that makes the divider easy to find and to hit on touch screens.
        </P>
        <Example component="resizable" file="resizable/vertical" title="Vertical" align="stretch" minHeight={420}>
          <ResizableVertical />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="ResizablePanelGroup"
          rows={[
            { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Side by side or stacked.' },
            { name: 'id', type: 'string', description: 'Saves sizes in localStorage under this id. Without one nothing is stored. Storage errors are ignored.' },
            { name: 'onLayout', type: '(sizes: number[]) => void', description: 'Sizes in % (document order) when a drag or key press ends.' },
          ]}
        />
        <PropsTable
          title="ResizablePanel"
          rows={[
            { name: 'defaultSize', type: 'number', description: 'Starting size in % of the group. Panels without one share what is left.' },
            { name: 'minSize / maxSize', type: 'number', default: '0 / 100', description: 'Limits in %.' },
            { name: 'collapsible', type: 'boolean', default: 'false', description: 'Dragging below half of minSize snaps it shut; Enter on its handle toggles it.' },
            { name: 'collapsedSize', type: 'number', default: '0', description: 'Size in % when collapsed.' },
            { name: 'onResize', type: '(size: number) => void', description: 'Called when the panel’s size changes.' },
          ]}
        />
        <PropsTable
          title="ResizableHandle"
          rows={[
            { name: 'withHandle', type: 'boolean', default: 'false', description: 'Show a small grip.' },
            { name: 'aria-label', type: 'string', default: "'Resize panels'", description: 'Accessible name; make it specific when several handles exist.' },
          ]}
        />
        <P>
          Give the group a size (<Code>h-96</Code>); it fills its parent. Panels hide overflow, so put a <Code>ScrollArea</Code> inside panels that scroll. A <Code>ResizableHandle</Code> must sit directly between two panels.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['← / →', 'Moves a vertical divider by 5% (↑ / ↓ for a horizontal divider in a vertical group).'],
            ['Home / End', 'Moves the divider to the start / end limit the panels allow.'],
            ['Enter', 'Collapses or restores a collapsible neighbour.'],
            ['Tab', 'Moves to the next divider.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Each divider is a WAI-ARIA window splitter: role="separator", focusable, aria-orientation, aria-valuenow / min / max (the size of the panel before it, in %) and aria-controls.',
            'Dragging uses pointer capture, so it keeps tracking when the pointer leaves the divider, on mouse, touch and pen.',
            'Touch targets: the invisible hit area grows from 8px to 24px on coarse pointers.',
            'The focused or dragged divider is drawn in the ring colour.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Dragging follows the pointer with no easing.',
            'Keyboard collapse and restore glide on the smooth spring.',
            'Reduced motion: collapse and restore are instant.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
