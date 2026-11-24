'use client';

import { useState } from 'react';
import { Field, FieldHint, Label, NumberInput } from 'ui-kit';

const PRICE_PER_SEAT = 12;

export default function NumberInputSeats() {
  const [seats, setSeats] = useState<number | null>(5);
  const total = (seats ?? 0) * PRICE_PER_SEAT;

  return (
    <div className="w-full max-w-xs">
      <Field>
        <Label>Seats</Label>
        <NumberInput value={seats} onValueChange={setSeats} min={1} max={25} controls="attached" locale="en-US" />
        <FieldHint>
          {seats === null ? 'Enter 1 to 25 seats.' : `${seats} ${seats === 1 ? 'seat' : 'seats'} at $${PRICE_PER_SEAT} = $${total} per month.`}
        </FieldHint>
      </Field>
    </div>
  );
}
