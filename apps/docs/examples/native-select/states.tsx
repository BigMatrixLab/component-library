import { Field, FieldError, Label, NativeSelect } from 'ui-kit';

export default function NativeSelectStates() {
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <Field required invalid>
        <Label>Plan</Label>
        <NativeSelect defaultValue="">
          <option value="">Choose a plan</option>
          <option>Starter</option>
          <option>Team</option>
        </NativeSelect>
        <FieldError>Pick a plan to continue.</FieldError>
      </Field>
      <Field disabled>
        <Label>Region</Label>
        <NativeSelect defaultValue="eu">
          <option value="eu">Europe (Frankfurt)</option>
          <option value="us">US East</option>
        </NativeSelect>
      </Field>
      <Field className="sm:col-span-2">
        <Label>Time zone</Label>
        <NativeSelect defaultValue="Europe/London">
          <optgroup label="Americas">
            <option>America/New_York</option>
            <option>America/Chicago</option>
          </optgroup>
          <optgroup label="Europe">
            <option>Europe/London</option>
            <option>Europe/Berlin</option>
          </optgroup>
        </NativeSelect>
      </Field>
    </div>
  );
}
