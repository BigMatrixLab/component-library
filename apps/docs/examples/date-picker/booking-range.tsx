'use client';

import { useMemo, useState } from 'react';
import {
  addDays,
  DateRangePicker,
  Field,
  FieldHint,
  Label,
  startOfDay,
  type DateRange,
  type DateRangePreset,
} from 'ui-kit';

/** The coming Friday (today when it is Friday). */
const nextFriday = (today: Date) => addDays(today, (5 - today.getDay() + 7) % 7);

const nights = (count: number): DateRangePreset => ({
  label: `Next ${count} nights`,
  range: (today) => ({ from: startOfDay(today), to: addDays(startOfDay(today), count) }),
});

const presets: DateRangePreset[] = [
  { label: 'This weekend', range: (today) => ({ from: nextFriday(today), to: addDays(nextFriday(today), 2) }) },
  nights(3),
  nights(7),
  nights(14),
];

export default function DatePickerBookingRange() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [stay, setStay] = useState<DateRange>({ from: null, to: null });
  const count = stay.from && stay.to ? Math.round((stay.to.getTime() - stay.from.getTime()) / 86_400_000) : 0;

  return (
    <div className="w-full max-w-sm">
      <Field>
        <Label>Stay</Label>
        <DateRangePicker
          value={stay}
          onValueChange={setStay}
          presets={presets}
          min={today}
          placeholder="Check-in – check-out"
          startName="check_in"
          endName="check_out"
        />
        <FieldHint>{count ? `${count} ${count === 1 ? 'night' : 'nights'} at Harbour House` : 'Pick your arrival and departure dates.'}</FieldHint>
      </Field>
    </div>
  );
}
