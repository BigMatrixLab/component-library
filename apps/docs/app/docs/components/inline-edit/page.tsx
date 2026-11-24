import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import InlineEditRenameProject from '@/examples/inline-edit/rename-project';
import InlineEditDetails from '@/examples/inline-edit/details';

export const metadata: Metadata = { title: 'Inline edit' };

export default function InlineEditPage() {
  return (
    <DocPage href="/docs/components/inline-edit">
      <Section id="rename-project" title="Rename a project">
        <P>Click the heading to edit it. The words do not move: the input has the same font, and its padding and border are cancelled out. Enter or blur saves, Esc cancels.</P>
        <Example component="inline-edit" file="inline-edit/rename-project" title="Rename a project" align="start">
          <InlineEditRenameProject />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Titles, names and short single-line values that are edited occasionally: a project name, a table cell, a detail row.',
            'Where opening a form or dialog for one field would be heavy.',
            <>For several related fields, or long text, use a normal form with <Code>Field</Code> and <Code>Input</Code>.</>,
          ]}
        />
      </Section>

      <Section id="details" title="In a list of details">
        <P>Works at body size too. Each row is its own editor; there is no save button to hunt for.</P>
        <Example component="inline-edit" file="inline-edit/details" title="In a list of details">
          <InlineEditDetails />
        </Example>
      </Section>

      <Section id="validation" title="Validation and saving">
        <P>
          <Code>validate</Code> runs first and blocks saving with a message. <Code>onSave</Code> may return a promise: the field shows a spinner and stays read-only until it settles, and a thrown <Code>Error</Code> keeps the field open with its message. Try “Untitled” in the first example.
        </P>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="InlineEdit"
          rows={[
            { name: 'value / defaultValue / onValueChange', type: 'string', description: 'Controlled or uncontrolled value. onValueChange fires when a save succeeds.' },
            { name: 'onSave', type: '(next: string) => unknown | Promise<unknown>', description: 'Persist the value. A rejection shows its message and keeps the field open.' },
            { name: 'validate', type: '(next: string) => string | null | undefined', description: 'Return a message to block saving.' },
            { name: 'label', type: 'string', default: "'Value'", description: 'Accessible name, e.g. "Project name".' },
            { name: 'placeholder', type: 'string', default: "'Add a value'", description: 'Shown when empty.' },
            { name: 'allowEmpty', type: 'boolean', default: 'false', description: 'Allow saving an empty value.' },
            { name: 'emptyMessage', type: 'string', default: "'Can’t be empty'", description: 'Error when empty is not allowed.' },
            { name: 'saveOnBlur', type: 'boolean', default: 'true', description: 'Blur saves (true) or cancels (false).' },
            { name: 'selectOnEdit', type: 'boolean', default: 'true', description: 'Select all text when editing starts.' },
            { name: 'maxLength, disabled', type: 'number, boolean', description: 'Native input limits.' },
            { name: 'onEditingChange', type: '(editing: boolean) => void', description: 'Editing started or ended.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter / Space', 'On the text: starts editing.'],
            ['Enter', 'In the field: saves.'],
            ['Esc', 'In the field: cancels and restores the value.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'At rest it is a real button (“Edit project name: Q4 launch plan”); editing swaps it for a labelled text input.',
            'Errors use role="alert", aria-invalid and aria-describedby on the input. Pending sets aria-busy and makes the input read-only.',
            'Focus returns to the text after Enter or Esc, but is not pulled back when you blur away.',
            'Saved is announced through a polite live region.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'No movement on the swap by design: the border, fill and focus ring fade in over 150ms while the text stays put.',
            'The pencil hint fades in on hover (fine pointers) and focus; the save check pops in (220ms), then fades after 1.1 seconds. Errors rise in 220ms.',
            'Reduced motion: the colours still change; the error and check appear with no rise or pop.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
