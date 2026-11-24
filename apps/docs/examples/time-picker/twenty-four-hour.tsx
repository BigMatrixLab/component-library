'use client';

import { useState } from 'react';
import { Field, FieldHint, Label, TimePicker } from 'ui-kit';

export default function TimePickerTwentyFourHour() {
  const [departure, setDeparture] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Field>
        <Label>Departure</Label>
        {/* German locale: 24-hour clock, no AM/PM */}
        <TimePicker locale="de-DE" step={60} value={departure} onValueChange={setDeparture} />
        <FieldHint>Zürich HB → München Hbf. The value is always “HH:mm”.</FieldHint>
      </Field>
      <Field>
        <Label>Lap time</Label>
        <TimePicker hour12={false} seconds defaultValue="00:01:42" aria-label="Lap time" />
        <FieldHint>With seconds: arrow keys step, digits move on by themselves.</FieldHint>
      </Field>
    </div>
  );
}
