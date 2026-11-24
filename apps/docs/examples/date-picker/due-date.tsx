'use client';

import { useMemo, useState } from 'react';
import { DatePicker, Field, FieldHint, Label, startOfDay } from 'ui-kit';

export default function DatePickerDueDate() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [due, setDue] = useState<Date | null>(null);
  // Payment runs only on weekdays
  const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  return (
    <div className="w-full max-w-xs">
      <Field required>
        <Label>Due date</Label>
        <DatePicker
          value={due}
          onValueChange={setDue}
          min={today}
          disabledDates={weekend}
          placeholder="Pick a due date"
          name="due"
        />
        <FieldHint>
          {due
            ? `Northwind will be reminded the day before ${due.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
            : 'Payments run on weekdays only.'}
        </FieldHint>
      </Field>
    </div>
  );
}
