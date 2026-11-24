'use client';

import { useState } from 'react';
import { DatePicker, Field, FieldHint, Label } from 'ui-kit';

export default function DatePickerTypeable() {
  const [start, setStart] = useState<Date | null>(null);

  return (
    <div className="w-full max-w-xs">
      <Field>
        <Label>Contract start</Label>
        <DatePicker
          typeable
          value={start}
          onValueChange={setStart}
          min={new Date(2026, 0, 1)}
          max={new Date(2027, 11, 31)}
          placeholder="e.g. 3/14/2027"
          format={{ dateStyle: 'long' }}
        />
        <FieldHint>Type a date (3/14/2027, Mar 14, 14 March 2027) or open the calendar. Press Enter to confirm.</FieldHint>
      </Field>
    </div>
  );
}
