'use client';

import { useMemo, useState } from 'react';
import { addDays, Calendar, startOfDay } from 'ui-kit';

export default function CalendarDisabled() {
  const [date, setDate] = useState<Date | null>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  // Fully booked days, plus no weekend appointments
  const booked = useMemo(() => [addDays(today, 3), addDays(today, 4), addDays(today, 9)], [today]);
  const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border border-border bg-card">
        <Calendar
          value={date}
          onValueChange={setDate}
          min={today}
          max={addDays(today, 60)}
          disabled={(d) => weekend(d) || booked.some((b) => b.getTime() === d.getTime())}
        />
      </div>
      <p className="text-sm text-muted-foreground">Appointments run weekdays, up to 60 days ahead</p>
    </div>
  );
}
