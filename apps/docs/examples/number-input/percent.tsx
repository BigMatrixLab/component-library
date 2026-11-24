'use client';

import { useState } from 'react';
import { Field, FieldHint, Label, NumberInput } from 'ui-kit';

export default function NumberInputPercent() {
  const [discount, setDiscount] = useState<number | null>(0.15);

  return (
    <div className="w-full max-w-xs">
      <Field>
        <Label>Volume discount</Label>
        <NumberInput
          value={discount}
          onValueChange={setDiscount}
          format="percent"
          locale="en-US"
          min={0}
          max={0.5}
          step={0.01}
          allowWheel
        />
        <FieldHint>One step is one percentage point. Scroll over the field while it is focused to change it.</FieldHint>
      </Field>
    </div>
  );
}
