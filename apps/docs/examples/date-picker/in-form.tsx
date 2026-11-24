'use client';

import { useState } from 'react';
import { Button, DatePicker, DateRangePicker, Field, Form, Label } from 'ui-kit';

export default function DatePickerInForm() {
  const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);

  return (
    <Form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v)])));
      }}
    >
      <Field>
        <Label>Invoice date</Label>
        <DatePicker name="invoice_date" defaultValue={new Date(2026, 10, 24)} />
      </Field>
      <Field>
        <Label>Service period</Label>
        <DateRangePicker
          startName="period_start"
          endName="period_end"
          defaultValue={{ from: new Date(2026, 10, 3), to: new Date(2026, 10, 24) }}
        />
      </Field>
      <Button type="submit">Create invoice</Button>
      {submitted && (
        <pre className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{JSON.stringify(submitted, null, 2)}</pre>
      )}
    </Form>
  );
}
