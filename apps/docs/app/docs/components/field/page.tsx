import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import FieldBasic from '@/examples/field/basic';
import FieldValidation from '@/examples/field/validation';
import FieldHorizontal from '@/examples/field/horizontal';
import FieldFieldset from '@/examples/field/fieldset';

export const metadata: Metadata = { title: 'Field & label' };

export default function FieldPage() {
  return (
    <DocPage href="/docs/components/field">
      <Section id="usage" title="Usage">
        <P>
          Wrap one control in a <Code>Field</Code> with a <Code>Label</Code> and, optionally, a <Code>FieldHint</Code> or <Code>FieldError</Code>. The field generates the id, points the label at the control and wires <Code>aria-describedby</Code>, <Code>aria-invalid</Code> and <Code>required</Code> for you. Inputs, textareas and selects work standalone too.
        </P>
        <Example component="field" file="field/basic" title="Field with label and hint">
          <FieldBasic />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Every form control that needs a visible label, helper text or a validation message.',
            <>A group of related controls under one heading — use <Code>Fieldset</Code> and <Code>Legend</Code>.</>,
            <>A page-level form where fields should share one vertical rhythm — use <Code>Form</Code>.</>,
          ]}
        />
        <P>Not for: a control that has no label by design (give it an aria-label instead), or a single checkbox or switch with its own inline label.</P>
      </Section>

      <Section id="validation" title="Validation messages">
        <P>
          Render a <Code>FieldError</Code> with text when the value is wrong. It rises in, marks the control <Code>aria-invalid</Code>, joins <Code>aria-describedby</Code> and is announced politely. It renders nothing when its children are empty, so you can pass the message straight from state. Tab out of the email field, or press Create account.
        </P>
        <Example component="field" file="field/validation" title="Validation on blur and submit">
          <FieldValidation />
        </Example>
      </Section>

      <Section id="horizontal" title="Horizontal layout">
        <P>
          Use <Code>orientation="horizontal"</Code> for settings pages: the label sits in a left column, the control and its messages in the right. Below 640px it stacks again.
        </P>
        <Example component="field" file="field/horizontal" title="Horizontal fields">
          <FieldHorizontal />
        </Example>
      </Section>

      <Section id="fieldset" title="Fieldset and form">
        <P>
          <Code>Fieldset</Code> and <Code>Legend</Code> are the native elements, so a disabled fieldset disables everything inside it. <Code>Form</Code> is a native form on a grid with a 20px gap.
        </P>
        <Example component="field" file="field/fieldset" title="Fieldset and Form">
          <FieldFieldset />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Field"
          rows={[
            { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Stack the label above the control, or put it in a left column.' },
            { name: 'required', type: 'boolean', default: 'false', description: 'Sets required on the control and shows the * marker on the label.' },
            { name: 'invalid', type: 'boolean', default: 'false', description: 'Sets aria-invalid on the control. A rendered FieldError does this by itself.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control and dims the label.' },
            { name: 'controlId', type: 'string', description: 'Id for the control. Generated when omitted. A control that has its own id is followed by the label.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the wrapper div, including ref and className.' },
          ]}
        />
        <PropsTable
          title="Label, FieldHint, FieldError, Fieldset, Legend, Form"
          rows={[
            { name: 'Label', type: 'LabelHTMLAttributes & { required? }', description: 'A native label. Inside a Field it targets the control.' },
            { name: 'FieldHint', type: 'HTMLAttributes<HTMLParagraphElement>', description: 'Helper text; added to the control’s aria-describedby.' },
            { name: 'FieldError', type: 'HTMLAttributes<HTMLParagraphElement>', description: 'Validation message with an icon. Renders nothing without children.' },
            { name: 'Fieldset / Legend', type: 'native', description: 'Group related fields. disabled propagates to every control inside.' },
            { name: 'Form', type: 'FormHTMLAttributes', description: 'A native form laid out on a grid with a 20px gap.' },
            { name: 'useFieldControl(props)', type: 'hook', description: 'Wire your own control to the surrounding Field: returns id, aria-describedby, aria-invalid, required and disabled.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <P>Field adds no key handling of its own. Clicking a label focuses its control; the controls keep their native keyboard behaviour.</P>
        <KeyTable rows={[['Tab', 'Moves between controls in source order.'], ['Click on label', 'Focuses the control (or toggles a checkbox).']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The label is a real <label htmlFor>, so the control’s accessible name and the larger click target both work.',
            'Hint and error ids are added to aria-describedby only while those elements are rendered.',
            'The error uses an icon and text, never colour alone, and role="alert" so it is announced when it appears.',
            'The required marker is aria-hidden; the control carries the native required attribute.',
            'Contrast: error and marker text use the destructive text token, measured at 4.5:1 or better in light and dark.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'FieldError rises in over 220ms with a light blur that clears (soft rise).',
            'Reduced motion: the message still appears; the movement is dropped.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
