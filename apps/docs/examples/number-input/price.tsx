'use client';

import { useState } from 'react';
import { Field, FieldHint, Label, NumberInput } from 'ui-kit';

export default function NumberInputPrice() {
  const [price, setPrice] = useState<number | null>(1249);

  return (
    <div className="w-full max-w-xs">
      <Field>
        <Label>Annual price</Label>
        <NumberInput
          value={price}
          onValueChange={setPrice}
          format="currency"
          currency="EUR"
          locale="en-IE"
          min={0}
          max={50000}
          step={50}
          largeStep={500}
          placeholder="€0.00"
        />
        <FieldHint>Type any amount, such as 1,249.5. It is formatted when you leave the field.</FieldHint>
      </Field>
      <p className="mt-3 text-sm text-muted-foreground tabular-nums">Stored value: {price === null ? 'empty' : price}</p>
    </div>
  );
}
