'use client';

import { useState } from 'react';
import { Calendar } from 'ui-kit';

export default function CalendarLocale() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div className="rounded-xl border border-border bg-card">
      <Calendar locale="de-DE" weekStartsOn={1} value={date} onValueChange={setDate} previousLabel="Vorheriger Monat" nextLabel="Nächster Monat" />
    </div>
  );
}
