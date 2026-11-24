import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ComboboxCountry from '@/examples/combobox/country';
import ComboboxFrameworkCreate from '@/examples/combobox/framework-create';

export const metadata: Metadata = { title: 'Combobox' };

export default function ComboboxPage() {
  return (
    <DocPage href="/docs/components/combobox">
      <Section id="usage" title="Usage">
        <P>
          An input that filters a list as you type. Matching ignores case and accents, and the matching part of each option is highlighted. The input keeps focus while the arrow keys move a highlight through the list.
        </P>
        <Example component="combobox" file="combobox/country" title="Country">
          <ComboboxCountry />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Lists long enough that scrolling is slow: countries, people, projects.',
            'People who know what they are looking for and would rather type than scroll.',
          ]}
        />
        <P>Not for: five or six options (use a select), or free text that does not have to match a list (use an input).</P>
      </Section>

      <Section id="create" title="Create an option">
        <P>
          Add <Code>ComboboxCreate</Code> to offer a “Create” row when the typed text matches nothing exactly. Add the new option in your state in <Code>onCreate</Code>; the value becomes the typed text.
        </P>
        <Example component="combobox" file="combobox/framework-create" title="Create an option">
          <ComboboxFrameworkCreate />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Combobox"
          rows={[
            { name: 'value / defaultValue', type: 'string', description: "Selected value. '' means nothing selected." },
            { name: 'onValueChange', type: '(value: string) => void', description: 'Called when an option is chosen or the selection is cleared.' },
            { name: 'inputValue / defaultInputValue', type: 'string', description: 'Text in the input. After a choice it shows the option label.' },
            { name: 'onInputValueChange', type: '(text: string) => void', description: 'Called as the text changes.' },
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'Control the list open state.' },
            { name: 'name', type: 'string', description: 'Submits the selected value with a form through a hidden input.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
          ]}
        />
        <PropsTable
          title="ComboboxInput"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height: 32 / 36 / 44px.' },
            { name: 'clearable', type: 'boolean', default: 'false', description: 'Show a clear button while a value is selected.' },
            { name: 'showTrigger', type: 'boolean', default: 'true', description: 'Show the chevron button that toggles the list.' },
            { name: '...props', type: 'InputProps', description: 'Forwarded to the <input>, including placeholder, id and aria-label.' },
          ]}
        />
        <PropsTable
          title="ComboboxItem / ComboboxCreate"
          rows={[
            { name: 'value', type: 'string', description: 'Unique, non-empty value (ComboboxItem).' },
            { name: 'textValue', type: 'string', description: 'Plain text to filter on when children are not text.' },
            { name: 'onCreate', type: '(text: string) => void', description: 'ComboboxCreate: called with the typed text.' },
          ]}
        />
        <P>
          Also: <Code>ComboboxContent</Code>, <Code>ComboboxEmpty</Code> (shows when nothing matches), <Code>ComboboxGroup</Code> with a <Code>label</Code> (hides itself when none of its options match), <Code>ComboboxLabel</Code> and <Code>ComboboxSeparator</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Type', 'Filter the list; the first match is highlighted.'],
            ['↓ / ↑', 'Open the list, then move the highlight.'],
            ['Enter', 'Choose the highlighted option.'],
            ['Esc (open)', 'Close and restore the selected label.'],
            ['Esc (closed)', 'Clear the input and the value.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'WAI-ARIA combobox with list autocomplete: the input has role="combobox", aria-expanded, aria-controls and aria-activedescendant; focus stays in the input.',
            'The list is a listbox; when nothing matches it is replaced by the empty message.',
            'The chevron and clear buttons are pointer helpers, outside the tab order.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['The list rises 4px with a light blur in 150ms; the chevron turns over on the snappy spring.', 'Reduced motion keeps the state change and drops the movement.']} />
      </Section>
    </DocPage>
  );
}
