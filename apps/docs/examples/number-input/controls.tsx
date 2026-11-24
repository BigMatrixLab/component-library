import { Field, Label, NumberInput } from 'ui-kit';

export default function NumberInputControls() {
  return (
    <div className="grid w-full max-w-xs gap-5">
      <Field>
        <Label>Inside the field</Label>
        <NumberInput defaultValue={2} min={0} max={10} controls="inside" />
      </Field>
      <Field>
        <Label>Attached</Label>
        <NumberInput defaultValue={2} min={0} max={10} controls="attached" size="lg" />
      </Field>
      <Field>
        <Label>Without buttons</Label>
        <NumberInput defaultValue={2} min={0} max={10} controls="none" size="sm" />
      </Field>
      <Field disabled>
        <Label>Disabled</Label>
        <NumberInput defaultValue={4} min={0} max={10} />
      </Field>
    </div>
  );
}
