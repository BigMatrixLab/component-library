'use client';

import { useState } from 'react';
import { Field, FieldHint, Label, TimePicker } from 'ui-kit';

export default function TimePickerMeetingTime() {
  const [time, setTime] = useState<string | null>('09:30');

  return (
    <div className="w-full max-w-xs">
      <Field>
        <Label>Meeting time</Label>
        <TimePicker value={time} onValueChange={setTime} step={15} min="08:00" max="18:00" name="meeting_time" />
        <FieldHint>
          {time ? `Stand-up starts at ${time} (24-hour value).` : 'Type a time or open the list. Slots run every 15 minutes.'}
        </FieldHint>
      </Field>
    </div>
  );
}
