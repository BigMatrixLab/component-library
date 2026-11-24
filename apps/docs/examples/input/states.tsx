import { Field, FieldError, FieldHint, Input, Label } from 'ui-kit';

export default function InputStates() {
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <Field>
        <Label>Project name</Label>
        <Input defaultValue="Spring campaign" />
        <FieldHint>Default. Hover, then focus to see the ring.</FieldHint>
      </Field>
      <Field invalid>
        <Label>Subdomain</Label>
        <Input defaultValue="northwind!" />
        <FieldError>Use letters, numbers and hyphens only.</FieldError>
      </Field>
      <Field disabled>
        <Label>Workspace id</Label>
        <Input defaultValue="ws_8f3k29d" />
      </Field>
      <Field>
        <Label>Invoice number</Label>
        <Input defaultValue="INV-2041" readOnly />
        <FieldHint>Read only. Focusable and selectable.</FieldHint>
      </Field>
    </div>
  );
}
