import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ToggleBasic from '@/examples/toggle-group/toggle';
import ToggleToolbar from '@/examples/toggle-group/toolbar';
import ToggleIcons from '@/examples/toggle-group/icons';
import SegmentedBilling from '@/examples/toggle-group/segmented';
import SegmentedSizes from '@/examples/toggle-group/segmented-sizes';

export const metadata: Metadata = { title: 'Toggle & segmented' };

export default function ToggleGroupPage() {
  return (
    <DocPage href="/docs/components/toggle-group">
      <Section id="segmented" title="Segmented control">
        <P>A radio-like choice between a few views. One highlight glides to the selected option. The arrow keys move and select.</P>
        <Example component="toggle-group" file="toggle-group/segmented" title="Segmented control">
          <SegmentedBilling />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            <><Code>SegmentedControl</Code>: switching a view or setting, exactly one always selected (billing period, List / Board, Day / Week).</>,
            <><Code>Toggle</Code>: one on/off state that applies immediately (Bold, Pin, Mute).</>,
            <><Code>ToggleGroup</Code>: a toolbar of related toggles, one pressed or several (formatting, alignment).</>,
            'Not for navigating between pages (use tabs or links) or for form settings that need Save (use a switch or radio group).',
          ]}
        />
      </Section>

      <Section id="sizes" title="Sizes and icons">
        <Example component="toggle-group" file="toggle-group/segmented-sizes" title="Segmented sizes">
          <SegmentedSizes />
        </Example>
      </Section>

      <Section id="toggle" title="Toggle">
        <P>A button with <Code>aria-pressed</Code>. <Code>ghost</Code> is transparent until pressed, <Code>outline</Code> adds a border. Controlled with <Code>pressed</Code>, or uncontrolled with <Code>defaultPressed</Code>.</P>
        <Example component="toggle-group" file="toggle-group/toggle" title="Toggle">
          <ToggleBasic />
        </Example>
      </Section>

      <Section id="group" title="Toggle group">
        <P><Code>type=&quot;multiple&quot;</Code> allows several pressed items, <Code>type=&quot;single&quot;</Code> at most one. The group is one tab stop; arrows move between items.</P>
        <Example component="toggle-group" file="toggle-group/toolbar" title="Formatting toolbar">
          <ToggleToolbar />
        </Example>
        <Example component="toggle-group" file="toggle-group/icons" title="Icon group">
          <ToggleIcons />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Toggle"
          rows={[
            { name: 'pressed / defaultPressed', type: 'boolean', description: 'Pressed state, controlled or initial.' },
            { name: 'onPressedChange', type: '(pressed: boolean) => void', description: 'Called when toggled.' },
            { name: 'variant', type: "'ghost' | 'outline'", default: "'ghost'", description: 'Visual style.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height 32 / 36 / 44px.' },
            { name: 'icon', type: 'boolean', description: 'Square icon-only. Needs aria-label.' },
          ]}
        />
        <PropsTable
          title="ToggleGroup"
          rows={[
            { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'How many items can be pressed.' },
            { name: 'value / defaultValue', type: 'string | string[]', description: "Pressed item value(s); '' means none in single mode." },
            { name: 'onValueChange', type: '(value) => void', description: 'Called when the pressed set changes.' },
            { name: 'variant / size / disabled', type: 'same as Toggle', description: 'Applied to every item. Outline joins items into one bar.' },
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Which arrow keys move focus.' },
          ]}
        />
        <PropsTable
          title="SegmentedControl"
          rows={[
            { name: 'value / defaultValue', type: 'string', description: 'Selected item value.' },
            { name: 'onValueChange', type: '(value: string) => void', description: 'Called when the selection changes.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height 32 / 36 / 44px.' },
            { name: 'fullWidth', type: 'boolean', description: 'Stretch; items share the width equally.' },
            { name: 'name', type: 'string', description: 'Submits the value with a form (hidden input).' },
            { name: 'disabled', type: 'boolean', description: 'Disable all items; each SegmentedControlItem also takes disabled.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Into the group: lands on the selected / pressed item, else the first.'],
            ['Arrow keys / Home / End', 'Toggle group: move focus. Segmented control: move focus and select.'],
            ['Space / Enter', 'Toggle: press or release the focused item.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Toggle and ToggleGroup items are buttons with aria-pressed inside role="group": name the group with aria-label.',
            'SegmentedControl is a radiogroup: role="radio" with aria-checked and a roving tabindex (WAI-ARIA radio group).',
            'Icon-only items need an aria-label.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The segmented pill glides on the morph spring (about 550ms) and resizes to the new label. It is measured, positioned with CSS variables and does not animate on first render.',
            'Toggles press to .97 on the snappy spring; colours cross-fade in 150ms.',
            'Reduced motion: the pill jumps, states still change.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
