import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import MenubarApp from '@/examples/menubar/app-menubar';

export const metadata: Metadata = { title: 'Menubar' };

export default function MenubarPage() {
  return (
    <DocPage href="/docs/components/menubar">
      <Section id="usage" title="Usage">
        <P>
          A bar of menus, like the File / Edit / View bar of a desktop app. Compose <Code>Menubar</Code>, one <Code>MenubarMenu</Code> per title, each with a <Code>MenubarTrigger</Code> and <Code>MenubarContent</Code>. Items, checkbox and radio items and submenus are the dropdown menu&apos;s own parts under a <Code>Menubar</Code> name.
        </P>
        <Example component="menubar" file="menubar/app-menubar" title="App menubar" minHeight={420} align="start">
          <MenubarApp />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Apps with many commands grouped by area (editors, design tools, admin consoles on desktop).',
            'Once one menu is open, moving to another title switches to it without another click.',
          ]}
        />
        <P>Not for: site navigation (use the navbar or navigation menu) or a single list of actions (use the dropdown menu).</P>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Menubar"
          rows={[
            { name: 'value', type: 'string | null', description: 'Controlled: the value of the open menu.' },
            { name: 'defaultValue', type: 'string | null', default: 'null', description: 'Initial open menu when uncontrolled.' },
            { name: 'onValueChange', type: '(value: string | null) => void', description: 'Called when the open menu changes.' },
          ]}
        />
        <PropsTable
          title="MenubarMenu"
          rows={[{ name: 'value', type: 'string', description: 'Identifies the menu in the bar value. Generated when omitted.' }]}
        />
        <P>
          <Code>MenubarContent</Code> takes <Code>placement</Code> (default <Code>bottom-start</Code>) and <Code>offset</Code> (default 6). Also: <Code>MenubarItem</Code>, <Code>MenubarCheckboxItem</Code>, <Code>MenubarRadioGroup</Code>, <Code>MenubarRadioItem</Code>, <Code>MenubarLabel</Code>, <Code>MenubarSeparator</Code>, <Code>MenubarGroup</Code>, <Code>MenubarSub</Code>, <Code>MenubarSubTrigger</Code> and <Code>MenubarSubContent</Code> with the same props as their <Code>DropdownMenu</Code> counterparts.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['← / →', 'On a title: moves to the previous / next title. With a menu open: switches to that menu.'],
            ['↓ / Enter / Space', 'On a title: opens the menu with the first item focused.'],
            ['↑', 'On a title: opens the menu with the last item focused.'],
            ['Home / End', 'On a title: first / last title.'],
            ['↓ / ↑ / Home / End / A–Z', 'In a menu: move between items.'],
            ['→ / ←', 'In a menu: opens / closes a submenu; on a plain item moves to the next / previous menu.'],
            ['Esc', 'Closes the menu and returns focus to its title.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA menubar pattern: role="menubar" with menuitem titles that have aria-haspopup, aria-expanded and aria-controls.',
            'The bar is one tab stop (roving tabindex); arrows move within it.',
            'Each menu is labelled by its title.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Titles tint in 150ms; menus pop open from their title (150ms) and fade out in 160ms.',
            'Switching menus closes one and opens the next at once, with no gap.',
            'Reduced motion: menus appear without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
