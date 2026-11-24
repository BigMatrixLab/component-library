'use client';

import { useState } from 'react';
import { Calendar, type DateRange } from 'ui-kit';

const format = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' });
const DAY = 86_400_000;

export default function CalendarRange() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const nights = range.from && range.to ? Math.round((range.to.getTime() - range.from.getTime()) / DAY) : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border border-border bg-card">
        <Calendar mode="range" value={range} onValueChange={setRange} />
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {range.from && range.to
          ? `${format.format(range.from)} – ${format.format(range.to)} · ${nights} ${nights === 1 ? 'night' : 'nights'}`
          : range.from
            ? 'Now pick your check-out day'
            : 'Pick your check-in day'}
      </p>
    </div>
  );
}
