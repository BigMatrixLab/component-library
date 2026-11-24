'use client';

import { useState } from 'react';
import { Field, Label, TimePicker, formatTimeLabel } from 'ui-kit';

const DAYS = ['Monday – Friday', 'Saturday'] as const;

export default function TimePickerOpeningHours() {
  const [hours, setHours] = useState<Record<string, { open: string | null; close: string | null }>>({
    'Monday – Friday': { open: '08:00', close: '18:00' },
    Saturday: { open: '10:00', close: '14:00' },
  });

  const set = (day: string, key: 'open' | 'close', value: string | null) =>
    setHours((h) => ({ ...h, [day]: { ...h[day]!, [key]: value } }));

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      {DAYS.map((day) => {
        const { open, close } = hours[day]!;
        const backwards = !!open && !!close && close <= open;
        return (
          <div key={day} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{day}</p>
            <div className="flex items-end gap-3">
              <Field className="flex-1">
                <Label>Opens</Label>
                <TimePicker value={open} onValueChange={(v) => set(day, 'open', v)} step={30} max="12:00" />
              </Field>
              <Field className="flex-1" invalid={backwards}>
                <Label>Closes</Label>
                <TimePicker value={close} onValueChange={(v) => set(day, 'close', v)} step={30} min="12:00" />
              </Field>
            </div>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {open && close
                ? `Open ${formatTimeLabel(open, 'en-US', true)} – ${formatTimeLabel(close, 'en-US', true)}`
                : 'Closed'}
            </p>
          </div>
        );
      })}
    </div>
  );
}
