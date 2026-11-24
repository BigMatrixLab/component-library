import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SidebarApp from '@/examples/sidebar/app';
import SidebarOffcanvas from '@/examples/sidebar/offcanvas';

export const metadata: Metadata = { title: 'Sidebar' };

export default function SidebarPage() {
  return (
    <DocPage href="/docs/components/sidebar" wide>
      <Section id="usage" title="Usage">
        <P>
          Wrap the page in <Code>SidebarProvider</Code>, put a <Code>Sidebar</Code> next to a <Code>SidebarInset</Code> and build the menu from groups, rows and optional nested items. Press Ctrl + B (or the trigger) to collapse it to an icon rail; the label of each row appears in a tooltip while it is collapsed. The state is remembered between visits.
        </P>
        <Example component="sidebar" file="sidebar/app" title="App sidebar" align="stretch" minHeight={600}>
          <SidebarApp />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Apps with more than five destinations, or destinations with sub-pages.',
            'Tools people stay in all day, where the navigation should always be one click away.',
          ]}
        />
        <P>Not for: marketing sites (use a navbar) or a handful of tabs inside one page (use tabs).</P>
      </Section>

      <Section id="layout" title="Full page and framed">
        <P>
          On a full page the sidebar is sticky and as tall as the screen. Add <Code>framed</Code> to <Code>SidebarProvider</Code> and give it a height to lay it out inside a card or a docs preview; the inset then scrolls on its own. Below 768px (<Code>mobileBreakpoint</Code>) the same content opens as an off-canvas sheet.
        </P>
      </Section>

      <Section id="offcanvas" title="Off-canvas">
        <P><Code>{'collapsible="offcanvas"'}</Code> slides the sidebar away completely instead of leaving a rail. <Code>{'collapsible="none"'}</Code> never collapses on desktop.</P>
        <Example component="sidebar" file="sidebar/offcanvas" title="Off-canvas" align="stretch">
          <SidebarOffcanvas />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="SidebarProvider"
          rows={[
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', default: 'defaultOpen: true', description: 'Desktop state: expanded or collapsed.' },
            { name: 'storageKey', type: 'string | false', default: "'ui-sidebar'", description: 'localStorage key that remembers the state. Wrapped in try/catch; false turns it off.' },
            { name: 'shortcut', type: 'boolean', default: 'true', description: 'Ctrl / Cmd + B toggles. Ignored while typing in a field.' },
            { name: 'mobileBreakpoint', type: 'number', default: '768', description: 'Viewport width under which the sidebar is a sheet.' },
            { name: 'framed', type: 'boolean', default: 'false', description: 'Lay out inside a fixed-height container instead of the page.' },
          ]}
        />
        <PropsTable
          title="Sidebar"
          rows={[
            { name: 'side', type: "'left' | 'right'", default: "'left'", description: 'Edge it sits on.' },
            { name: 'collapsible', type: "'icon' | 'offcanvas' | 'none'", default: "'icon'", description: 'What collapsing does.' },
          ]}
        />
        <PropsTable
          title="SidebarMenuButton"
          rows={[
            { name: 'isActive', type: 'boolean', default: 'false', description: 'Current page: highlighted, aria-current="page".' },
            { name: 'tooltip', type: 'ReactNode', description: 'Shown to the right while the sidebar is collapsed.' },
            { name: 'size', type: "'default' | 'lg'", default: "'default'", description: '36px row, or a 48px row for a workspace or account.' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child element, e.g. a Next.js Link.' },
          ]}
        />
        <P>
          Layout: <Code>SidebarHeader</Code>, <Code>SidebarContent</Code> (scrolls), <Code>SidebarFooter</Code>, <Code>SidebarGroup</Code>, <Code>SidebarGroupLabel</Code>, <Code>SidebarMenu</Code>, <Code>SidebarMenuItem</Code>, <Code>SidebarMenuBadge</Code>, <Code>SidebarTrigger</Code>, <Code>SidebarInset</Code>. Nested items: <Code>SidebarMenuSub</Code> with a <Code>SidebarMenuSubTrigger</Code> and a <Code>SidebarMenuSubContent</Code> of <Code>SidebarMenuSubItem</Code> / <Code>SidebarMenuSubButton</Code>. <Code>useSidebar()</Code> returns <Code>open</Code>, <Code>collapsed</Code>, <Code>isMobile</Code> and <Code>toggle</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Ctrl / ⌘ + B', 'Collapse or expand the sidebar (opens the sheet on mobile).'],
            ['Tab', 'Moves through the rows; closed nested items are skipped.'],
            ['Enter / Space', 'Activates a row or opens a nested group.'],
            ['Esc', 'Closes the mobile sheet.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'An aside landmark with a label; on mobile a modal sheet with a title.',
            'The trigger reports aria-expanded; nested groups use aria-expanded and aria-controls.',
            'While collapsed each icon-only row keeps its accessible name (its label is clipped, not removed) and shows a tooltip on hover and keyboard focus.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The width animates on the smooth spring and never on first load; labels are clipped, so nothing reflows while it moves.',
            'Nested items open with a height spring; the chevron turns on the snappy spring.',
            'Reduced motion keeps the state change and drops the movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
