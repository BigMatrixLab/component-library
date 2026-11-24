import { Field, FieldHint, Form, Input, Label, NativeSelect } from 'ui-kit';

export default function FieldHorizontal() {
  return (
    <Form className="w-full max-w-xl">
      <Field orientation="horizontal">
        <Label>Display name</Label>
        <Input defaultValue="Ada Lovelace" />
        <FieldHint>Shown on invoices and in comments.</FieldHint>
      </Field>
      <Field orientation="horizontal">
        <Label>Email</Label>
        <Input type="email" defaultValue="ada@northwind.com" />
      </Field>
      <Field orientation="horizontal">
        <Label>Time zone</Label>
        <NativeSelect defaultValue="Europe/London">
          <option>America/New_York</option>
          <option>Europe/London</option>
          <option>Asia/Karachi</option>
        </NativeSelect>
        <FieldHint>Used for scheduled reports.</FieldHint>
      </Field>
    </Form>
  );
}
