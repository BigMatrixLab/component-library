import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import CommandPalette from '@/examples/command/palette';
import CommandInline from '@/examples/command/inline';

export const metadata: Metadata = { title: 'Command palette' };

export default function CommandPage() {
  return (
    <DocPage href="/docs/components/command">
      <Section id="usage" title="Usage">
        <P>
          A searchable list of pages and actions. <Code>CommandDialog</Code> puts the palette in a modal at the top of the screen; with <Code>hotkey</Code> it toggles on <Code>⌘K</Code> / <Code>Ctrl + K</Code> from anywhere on the page.
        </P>
        <Example component="command" file="command/palette" title="Command palette" minHeight={240}>
          <CommandPalette />
        </Example>
      </Section>

      <Section id="inline" title="Inline">
        <P>
          <Code>Command</Code> on its own is the same palette in the page flow, for a search page or a settings finder. Type to filter: results are ranked by prefix, then word start, then substring, and <Code>keywords</Code> find an item by other names (try &quot;dark mode&quot;).
        </P>
        <Example component="command" file="command/inline" title="Inline palette" align="start">
          <CommandInline />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Apps with many destinations and actions, where power users want to jump by typing.',
            'As an addition to navigation, never the only way to reach something.',
          ]}
        />
        <P>Not for: a short choice from a fixed list (use a select), or free-text search results with their own page.</P>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Command"
          rows={[
            { name: 'search', type: 'string', description: 'Controlled search text; also defaultSearch and onSearchChange.' },
            { name: 'shouldFilter', type: 'boolean', default: 'true', description: 'Filter and rank items. Set false to filter yourself, e.g. async results.' },
            { name: 'filter', type: '(value, search, keywords) => number', description: 'Custom scorer: 0 hides an item, higher ranks it first.' },
            { name: 'label', type: 'string', description: 'Accessible name of the palette.' },
            { name: 'onItemSelect', type: '(value: string) => void', description: 'Called after any item runs.' },
          ]}
        />
        <PropsTable
          title="CommandItem"
          rows={[
            { name: 'value', type: 'string', description: 'What the search matches. Defaults to the item text.' },
            { name: 'keywords', type: 'string[]', description: 'Extra words that find the item.' },
            { name: 'icon', type: 'ReactNode', description: 'Leading 16px icon.' },
            { name: 'shortcut', type: 'ReactNode', description: 'A string such as "⌘N" becomes key caps; or pass your own node.' },
            { name: 'disabled', type: 'boolean', description: 'Skipped by the arrows, cannot run.' },
            { name: 'onSelect', type: '(value: string) => void', description: 'Runs on click or Enter.' },
          ]}
        />
        <PropsTable
          title="CommandDialog"
          rows={[
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'Controlled or uncontrolled open state.' },
            { name: 'hotkey', type: 'boolean', default: 'false', description: 'Toggle with ⌘K / Ctrl + K.' },
            { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'Close after an item runs.' },
            { name: 'title', type: 'string', default: "'Command palette'", description: 'Visually hidden dialog title.' },
          ]}
        />
        <P>
          Also: <Code>CommandInput</Code>, <Code>CommandList</Code>, <Code>CommandGroup</Code> (<Code>heading</Code>), <Code>CommandEmpty</Code>, <Code>CommandSeparator</Code> and <Code>CommandFooter</Code>. Groups hide when a search leaves them empty; separators hide while searching. Better matches float to the top of their group.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['⌘K / Ctrl + K', 'Opens or closes the dialog (when hotkey is on).'],
            ['↓ / ↑', 'Next / previous item (wraps around). Focus stays in the search field.'],
            ['Home / End', 'First / last item.'],
            ['Enter', 'Runs the highlighted item.'],
            ['Esc', 'Closes the dialog.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The search field is a combobox with aria-controls on the listbox and aria-activedescendant on the highlighted option, so focus never leaves the field.',
            'Items are role="option" with aria-selected; groups are labelled by their heading.',
            'The dialog is a modal with a hidden title; the field is focused on open and the search resets on close.',
            'Pointer hover moves the highlight; touch taps run the item.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The dialog uses the standard soft rise: overlay fade, panel rise 8px with scale .96 and un-blur.',
            'The highlight changes instantly (100ms tint) so fast typing never feels laggy.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
