import { Field, FieldHint, Label, Textarea } from 'ui-kit';

export default function TextareaCounter() {
  return (
    <Field className="w-full max-w-md">
      <Label>Bio</Label>
      <Textarea
        maxLength={160}
        showCount
        defaultValue="Product designer at Northwind. I make dense data feel calm."
        placeholder="Tell people a little about yourself"
      />
      <FieldHint>Shown on your public profile.</FieldHint>
    </Field>
  );
}
