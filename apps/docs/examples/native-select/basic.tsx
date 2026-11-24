import { Field, FieldHint, Label, NativeSelect } from 'ui-kit';

export default function NativeSelectBasic() {
  return (
    <Field required className="w-full max-w-sm">
      <Label>Country</Label>
      <NativeSelect defaultValue="" autoComplete="country">
        <option value="" disabled>
          Select a country
        </option>
        <option value="GB">United Kingdom</option>
        <option value="IE">Ireland</option>
        <option value="DE">Germany</option>
        <option value="US">United States</option>
      </NativeSelect>
      <FieldHint>Opens the picker built into your phone or computer.</FieldHint>
    </Field>
  );
}
