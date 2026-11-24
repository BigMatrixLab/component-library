import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import MultiSelectTeamMembers from '@/examples/multi-select/team-members';
import MultiSelectMaxSelection from '@/examples/multi-select/max-selection';

export const metadata: Metadata = { title: 'Multi-select' };

export default function MultiSelectPage() {
  return (
    <DocPage href="/docs/components/multi-select">
      <Section id="usage" title="Usage">
        <P>
          Pick several values. Each choice becomes a removable chip in the field; the list filters as you type, shows a checkbox per option and stays open so you can keep picking.
        </P>
        <Example component="multi-select" file="multi-select/team-members" title="Team members">
          <MultiSelectTeamMembers />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Assigning several people, tags or channels from a known list.',
            'Filters where the current selection should always be visible.',
          ]}
        />
        <P>Not for: a handful of on/off options (use checkboxes), or one value (use a select or combobox).</P>
      </Section>

      <Section id="max" title="Limit and overflow">
        <P>
          <Code>max</Code> disables the remaining options once reached and shows “n selected of max”. <Code>maxChips</Code> collapses the rest into a “+n more” pill (default 3). <Code>Clear all</Code> sits above the options.
        </P>
        <Example component="multi-select" file="multi-select/max-selection" title="Maximum selection">
          <MultiSelectMaxSelection />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="MultiSelect"
          rows={[
            { name: 'value / defaultValue', type: 'string[]', description: 'Selected values, in the order they were picked.' },
            { name: 'onValueChange', type: '(value: string[]) => void', description: 'Called when a value is added or removed.' },
            { name: 'max', type: 'number', description: 'Most values that can be selected.' },
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'Control the list open state.' },
            { name: 'name', type: 'string', description: 'Submits one hidden input per value, all under this name.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
          ]}
        />
        <PropsTable
          title="MultiSelectInput"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height of one row: 32 / 36 / 44px. The field grows as chips wrap.' },
            { name: 'maxChips', type: 'number', default: '3', description: 'Chips shown before “+n more”.' },
            { name: 'placeholder', type: 'string', description: 'Shown while nothing is selected.' },
          ]}
        />
        <P>
          Also: <Code>MultiSelectContent</Code>, <Code>MultiSelectItem</Code> (<Code>value</Code>, <Code>disabled</Code>, <Code>textValue</Code>), <Code>MultiSelectEmpty</Code>, <Code>MultiSelectGroup</Code>, <Code>MultiSelectLabel</Code> and <Code>MultiSelectSeparator</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Type', 'Filter the list; the first match is highlighted.'],
            ['↓ / ↑', 'Open the list, then move the highlight.'],
            ['Enter', 'Toggle the highlighted option; the list stays open.'],
            ['Backspace (empty input)', 'Remove the last chip.'],
            ['Esc', 'Close the list and clear the search text.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The input has role="combobox" and points at a listbox with aria-multiselectable; options expose aria-selected.',
            'Each chip’s remove button is labelled “Remove <name>”. Keyboard users remove with Backspace; the buttons stay out of the tab order.',
            'The “n selected” summary is a polite live region.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['Chips pop in with the soft rise; checkboxes change colour in 150ms.', 'Reduced motion keeps the state change and drops the movement.']} />
      </Section>
    </DocPage>
  );
}
