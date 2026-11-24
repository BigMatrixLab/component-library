import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SwitchSettings from '@/examples/switch/settings';
import SwitchSizes from '@/examples/switch/sizes';
import SwitchStates from '@/examples/switch/states';

export const metadata: Metadata = { title: 'Switch' };

export default function SwitchPage() {
  return (
    <DocPage href="/docs/components/switch">
      <Section id="settings" title="Settings">
        <P>
          A <Code>role=&quot;switch&quot;</Code> button for a setting that takes effect the moment it is flipped. Add <Code>label</Code> and <Code>description</Code> for a settings row; <Code>labelPosition=&quot;start&quot;</Code> pushes the switch to the far side.
        </P>
        <Example component="switch" file="switch/settings" title="Notification settings" align="start">
          <SwitchSettings />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'On/off settings that apply immediately, with no Save button.',
            'Enabling or disabling a feature, integration or preference.',
          ]}
        />
        <P>Not for: a choice that is submitted later with a form (use a checkbox), or more than two states (use a radio group or a segmented control).</P>
      </Section>

      <Section id="sizes" title="Sizes">
        <Example component="switch" file="switch/sizes" title="Sizes" align="start">
          <SwitchSizes />
        </Example>
      </Section>

      <Section id="states" title="Controlled and disabled">
        <P>
          Pass <Code>name</Code> and the switch submits <Code>value</Code> (default <Code>&quot;on&quot;</Code>) through a hidden input while it is on, like a checkbox.
        </P>
        <Example component="switch" file="switch/states" title="Controlled and disabled" align="start">
          <SwitchStates />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Switch"
          rows={[
            { name: 'checked', type: 'boolean', description: 'Controlled state.' },
            { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called when toggled.' },
            { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Track 32 × 18 or 40 × 24px.' },
            { name: 'name / value', type: 'string', default: "value: 'on'", description: 'Form field; a hidden input is rendered while on.' },
            { name: 'label', type: 'ReactNode', description: 'Visible label (renders a row). Without one, pass aria-label.' },
            { name: 'description', type: 'ReactNode', description: 'Secondary text; wired with aria-describedby.' },
            { name: 'labelPosition', type: "'start' | 'end'", default: "'end'", description: 'Label before or after the switch.' },
            { name: 'fieldClassName', type: 'string', description: 'Classes for the row; className goes to the button.' },
            { name: '...props', type: 'ButtonHTMLAttributes', description: 'Forwarded to the <button>, including ref, id, disabled.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Space', 'Toggles the switch.'], ['Enter', 'Toggles the switch.'], ['Tab', 'Moves focus to the next control.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'WAI-ARIA switch pattern: a button with role="switch" and aria-checked="true|false".',
            'The label is a real <label for> so clicking the text toggles it; with no label, give the switch an aria-label.',
            'The thumb is decorative (aria-hidden). Keyboard focus shows a 3px ring; on touch screens the tap area grows to 44px.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The thumb slides on the smooth spring, which never overshoots, so the switch never appears to flicker past its state.',
            'While pressed, the thumb widens slightly and keeps its edge against the track.',
            'Reduced motion: the thumb jumps; the track colour still changes.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
