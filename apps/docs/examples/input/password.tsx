import { Field, FieldHint, Label, PasswordInput } from 'ui-kit';

export default function InputPassword() {
  return (
    <Field className="w-full max-w-sm">
      <Label>Password</Label>
      <PasswordInput defaultValue="correct horse battery" autoComplete="current-password" />
      <FieldHint>The eye button reveals what you typed.</FieldHint>
    </Field>
  );
}
