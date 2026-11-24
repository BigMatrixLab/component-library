import { Field, Fieldset, Form, Input, Label, Legend, NativeSelect } from 'ui-kit';

export default function FieldFieldset() {
  return (
    <Form className="w-full max-w-md">
      <Fieldset>
        <Legend>Billing address</Legend>
        <Field required>
          <Label>Street address</Label>
          <Input placeholder="12 Harbour Road" autoComplete="street-address" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field required>
            <Label>City</Label>
            <Input placeholder="Manchester" autoComplete="address-level2" />
          </Field>
          <Field required>
            <Label>Postcode</Label>
            <Input placeholder="M1 4BT" autoComplete="postal-code" />
          </Field>
        </div>
        <Field>
          <Label>Country</Label>
          <NativeSelect defaultValue="GB" autoComplete="country">
            <option value="GB">United Kingdom</option>
            <option value="IE">Ireland</option>
            <option value="US">United States</option>
          </NativeSelect>
        </Field>
      </Fieldset>
    </Form>
  );
}
