'use client';

import { useState } from 'react';
import { Calendar, startOfDay, type DateRange } from 'ui-kit';

export default function CalendarTwoMonths() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });

  return (
    <div className="max-w-full rounded-xl border border-border bg-card">
      <Calendar mode="range" numberOfMonths={2} value={range} onValueChange={setRange} min={startOfDay(new Date())} />
    </div>
  );
}
