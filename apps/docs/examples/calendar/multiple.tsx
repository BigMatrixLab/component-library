'use client';

import { useState } from 'react';
import { Calendar } from 'ui-kit';

export default function CalendarMultiple() {
  const [days, setDays] = useState<Date[]>([]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border border-border bg-card">
        <Calendar mode="multiple" value={days} onValueChange={setDays} weekStartsOn={0} />
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {days.length === 0 ? 'Select the days you’re on call' : `${days.length} on-call ${days.length === 1 ? 'day' : 'days'} selected`}
      </p>
    </div>
  );
}
