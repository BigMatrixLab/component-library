import { Field, FieldHint, Label, Textarea } from 'ui-kit';

export default function TextareaAutoGrow() {
  return (
    <Field className="w-full max-w-md">
      <Label>Meeting notes</Label>
      <Textarea
        maxRows={8}
        defaultValue={'Agenda for Tuesday\n- Review Q3 pipeline\n- Decide on the pricing page test'}
        placeholder="Type or paste your notes"
      />
      <FieldHint>Starts at three lines and grows to eight, then scrolls.</FieldHint>
    </Field>
  );
}
