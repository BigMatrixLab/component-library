import { Field, FieldHint, Form, Input, Label } from 'ui-kit';

export default function FieldBasic() {
  return (
    <Form className="w-full max-w-sm">
      <Field required>
        <Label>Work email</Label>
        <Input type="email" placeholder="ada@northwind.com" autoComplete="email" />
        <FieldHint>We send invoices and receipts to this address.</FieldHint>
      </Field>
      <Field>
        <Label>Company</Label>
        <Input placeholder="Northwind Traders" autoComplete="organization" />
      </Field>
    </Form>
  );
}
