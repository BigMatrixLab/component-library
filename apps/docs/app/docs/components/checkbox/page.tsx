import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import CheckboxStates from '@/examples/checkbox/states';
import CheckboxGroup from '@/examples/checkbox/group';
import CheckboxSizes from '@/examples/checkbox/sizes';
import CheckboxCards from '@/examples/checkbox/cards';

export const metadata: Metadata = { title: 'Checkbox' };

export default function CheckboxPage() {
  return (
    <DocPage href="/docs/components/checkbox">
      <Section id="states" title="States">
        <P>
          A native checkbox with a custom box. The mark draws in when checked. Pair it with a <Code>label</Code> (and an optional <Code>description</Code>); the whole label is the click target.
        </P>
        <Example component="checkbox" file="checkbox/states" title="States" align="start">
          <CheckboxStates />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Independent yes/no choices, especially several at once: notification topics, filters, agreeing to terms.',
            'A list where any number of items can be selected, with a “select all” that shows a mixed state.',
            'Options that only take effect after a Save or Submit button.',
          ]}
        />
        <P>Not for: a setting that applies immediately (use a switch), or choosing exactly one option (use a radio group).</P>
      </Section>

      <Section id="indeterminate" title="Indeterminate">
        <P>
          Set <Code>indeterminate</Code> on a parent when only some children are checked. It shows a dash and exposes <Code>aria-checked=&quot;mixed&quot;</Code>; the next click checks it.
        </P>
        <Example component="checkbox" file="checkbox/group" title="Select all with a mixed state" align="start">
          <CheckboxGroup />
        </Example>
      </Section>

      <Section id="sizes" title="Sizes">
        <Example component="checkbox" file="checkbox/sizes" title="Sizes" align="start">
          <CheckboxSizes />
        </Example>
      </Section>

      <Section id="cards" title="Choice cards">
        <P>
          <Code>variant=&quot;card&quot;</Code> turns the whole card into the target and tints it with a ring when checked. Use it for options that need a price or a sentence of explanation.
        </P>
        <Example component="checkbox" file="checkbox/cards" title="Choice cards" align="start">
          <CheckboxCards />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Checkbox"
          rows={[
            { name: 'checked', type: 'boolean', description: 'Controlled state.' },
            { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called when the user toggles the box.' },
            { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Mixed state with a dash. Driven by you, not by clicks.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Box size: 16 / 20 / 24px.' },
            { name: 'variant', type: "'default' | 'card'", default: "'default'", description: 'Card makes the whole bordered card selectable.' },
            { name: 'label', type: 'ReactNode', description: 'Visible label. Without one, pass aria-label.' },
            { name: 'description', type: 'ReactNode', description: 'Secondary text; wired with aria-describedby.' },
            { name: 'invalid', type: 'boolean', description: 'Destructive border and aria-invalid.' },
            { name: 'className', type: 'string', description: 'Applied to the outer <label>.' },
            { name: '...props', type: 'InputHTMLAttributes', description: 'Forwarded to the <input>, including ref, name, value, disabled, required, form.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Space', 'Toggles the focused checkbox.'], ['Tab', 'Moves focus to the next checkbox; each one is a tab stop.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Renders a real input type="checkbox", so role, state, form submission and autofill are native.',
            'The label wraps the input, so clicking the text toggles it and screen readers announce the name.',
            'Indeterminate maps to aria-checked="mixed"; invalid sets aria-invalid; the description is linked with aria-describedby.',
            'Keyboard focus shows a 3px ring around the box (or the card); pointer clicks do not.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The check mark draws in with stroke-dashoffset (220ms, ease-out) as the box fills.',
            'Pressing the box scales it to .92 on the snappy spring.',
            'Reduced motion: the state changes, nothing animates.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
