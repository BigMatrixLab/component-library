'use client';

import { useState } from 'react';
import { Calendar } from 'ui-kit';

const format = new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

export default function CalendarSingle() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border border-border bg-card">
        <Calendar value={date} onValueChange={setDate} />
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {date ? `Demo booked for ${format.format(date)}` : 'Pick a day for your demo'}
      </p>
    </div>
  );
}
