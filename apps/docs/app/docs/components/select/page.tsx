import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SelectTimezone from '@/examples/select/timezone';
import SelectSizes from '@/examples/select/sizes';
import SelectStates from '@/examples/select/states';

export const metadata: Metadata = { title: 'Select' };

export default function SelectPage() {
  return (
    <DocPage href="/docs/components/select">
      <Section id="usage" title="Usage">
        <P>
          A styled single choice. The trigger looks and behaves like an <Code>Input</Code>; the options open in a floating list that sits in the browser top layer, so no <Code>overflow: hidden</Code> parent clips it. Inside a <Code>Field</Code> it picks up the label, hint, error, required and disabled state.
        </P>
        <Example component="select" file="select/timezone" title="Time zone">
          <SelectTimezone />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Choosing one value from a short or medium list: time zone, role, billing period.',
            'Options that need groups, icons or a check mark that a native select cannot draw.',
          ]}
        />
        <P>
          Not for: very long lists that need searching (use a combobox), picking several values (use multi-select), or when the platform picker is best on phones (use the native select).
        </P>
      </Section>

      <Section id="sizes" title="Sizes">
        <P>32, 36 and 44px tall, matching the input.</P>
        <Example component="select" file="select/sizes" title="Select sizes">
          <SelectSizes />
        </Example>
      </Section>

      <Section id="states" title="Controlled, invalid and disabled">
        <P>
          Use <Code>value</Code> and <Code>onValueChange</Code> to control it. A disabled item is skipped by the keyboard and typeahead. A field-level disabled state dims and locks the trigger.
        </P>
        <Example component="select" file="select/states" title="Select states">
          <SelectStates />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Select"
          rows={[
            { name: 'value', type: 'string', description: "Controlled value. '' means nothing selected." },
            { name: 'defaultValue', type: 'string', default: "''", description: 'Initial value when uncontrolled.' },
            { name: 'onValueChange', type: '(value: string) => void', description: 'Called when the person picks an option.' },
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'Control the list open state.' },
            { name: 'name', type: 'string', description: 'Submits the value with a surrounding form through a hidden input.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the trigger.' },
          ]}
        />
        <PropsTable
          title="SelectTrigger"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height: 32 / 36 / 44px.' },
            { name: 'placeholder', type: 'string', description: 'Shown while nothing is selected (when you pass no children).' },
            { name: '...props', type: 'ButtonHTMLAttributes', description: 'Forwarded to the <button>, including ref, id and aria-label.' },
          ]}
        />
        <PropsTable
          title="SelectItem"
          rows={[
            { name: 'value', type: 'string', description: 'Unique, non-empty value.' },
            { name: 'disabled', type: 'boolean', description: 'Cannot be chosen; skipped by the keyboard.' },
            { name: 'textValue', type: 'string', description: 'Plain text for typeahead when children are not text.' },
          ]}
        />
        <P>
          Also: <Code>SelectContent</Code> (the floating list), <Code>SelectValue</Code> (custom trigger content), <Code>SelectGroup</Code> with a <Code>label</Code>, <Code>SelectLabel</Code> and <Code>SelectSeparator</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter · Space · ↓', 'Open the list on the selected option (or the first).'],
            ['↑', 'Open on the selected option (or the last).'],
            ['↓ / ↑ (open)', 'Move the highlight.'],
            ['Home · End', 'First or last option.'],
            ['Type characters', 'Jump to the next option that starts with them.'],
            ['Enter · Space (open)', 'Choose the highlighted option and close.'],
            ['Esc', 'Close without changing the value; focus stays on the trigger.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The trigger is a button with role="combobox", aria-expanded, aria-controls and aria-activedescendant (the WAI-ARIA select-only combobox pattern). Focus never leaves it.',
            'The list is role="listbox"; options are role="option" with aria-selected. Groups use role="group" with their label.',
            'Inside a Field the label names the trigger, and the hint and error are described by it.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The list rises 4px with a light blur in 150ms and leaves faster. The check mark scales in on the snappy spring.',
            'Reduced motion: the list still opens and closes, without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
