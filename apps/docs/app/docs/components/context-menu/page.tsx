import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ContextMenuFileRow from '@/examples/context-menu/file-row';

export const metadata: Metadata = { title: 'Context menu' };

export default function ContextMenuPage() {
  return (
    <DocPage href="/docs/components/context-menu">
      <Section id="usage" title="Usage">
        <P>
          Wrap an area in <Code>ContextMenuTrigger</Code> and describe the actions in <Code>ContextMenuContent</Code>. The menu opens at the pointer on right-click, on a long press (500ms) on touch, and from the keyboard with <Code>Shift + F10</Code> or the ContextMenu key. Items, labels, separators, checkbox and radio items and submenus are the dropdown menu&apos;s own parts under a <Code>ContextMenu</Code> name.
        </P>
        <Example component="context-menu" file="context-menu/file-row" title="File row" minHeight={380} align="start">
          <ContextMenuFileRow />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Shortcuts to actions on an object that already has a visible way to reach them (rows, cards, canvas items).',
            'Never the only way to do something: touch and keyboard users must be able to reach the same actions from a visible control.',
          ]}
        />
        <P>Not for: the primary actions of a screen (use buttons), or a menu opened from a button (use the dropdown menu).</P>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="ContextMenu"
          rows={[
            { name: 'open', type: 'boolean', description: 'Controlled open state.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the menu asks to open or close.' },
          ]}
        />
        <PropsTable
          title="ContextMenuTrigger"
          rows={[
            { name: 'asChild', type: 'boolean', description: 'Use your own element as the area.' },
            { name: 'disabled', type: 'boolean', description: 'Let the browser show its own context menu.' },
            { name: 'longPressDelay', type: 'number', default: '500', description: 'Touch long-press time, ms.' },
            { name: 'tabIndex', type: 'number', default: '0', description: 'The area must be focusable for the keyboard shortcut.' },
          ]}
        />
        <PropsTable
          title="ContextMenuContent"
          rows={[
            { name: 'placement', type: "'bottom-start' | …", default: "'bottom-start'", description: 'Side and alignment against the pointer; flips and shifts to stay on screen.' },
            { name: 'offset', type: 'number', default: '2', description: 'Gap to the pointer, px.' },
          ]}
        />
        <P>
          Also: <Code>ContextMenuItem</Code> (icon, shortcut, variant, disabled, onSelect), <Code>ContextMenuCheckboxItem</Code>, <Code>ContextMenuRadioGroup</Code>, <Code>ContextMenuRadioItem</Code>, <Code>ContextMenuLabel</Code>, <Code>ContextMenuSeparator</Code>, <Code>ContextMenuGroup</Code>, <Code>ContextMenuSub</Code>, <Code>ContextMenuSubTrigger</Code> and <Code>ContextMenuSubContent</Code>. They take the same props as their <Code>DropdownMenu</Code> counterparts.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Shift + F10 / ContextMenu', 'On the area: opens the menu with the first item focused.'],
            ['↓ / ↑', 'Next / previous item (wraps around).'],
            ['Home / End', 'First / last item.'],
            ['A–Z', 'Typeahead: jumps to the item that starts with what you type.'],
            ['Enter / Space', 'Chooses the item.'],
            ['→ / ←', 'Opens / closes a submenu.'],
            ['Esc', 'Closes the menu and returns focus to the area.'],
            ['Tab', 'Closes the menu.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="menu" with menuitem, menuitemcheckbox and menuitemradio items, the same as the dropdown menu.',
            'The trigger area is focusable so the keyboard can reach the menu; a menu opened with the keyboard lands on its first item.',
            'Focus returns to the area on close, except after a click outside.',
            'Touch: long press opens it; the page text selection and the iOS callout are switched off on the area.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Open: pops from the pointer, scale .96 (150ms, ease-out). Close: 160ms fade.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
