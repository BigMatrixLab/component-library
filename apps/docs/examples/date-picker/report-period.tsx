'use client';

import { useState } from 'react';
import { DateRangePicker, Field, Label, formatPickerDateRange, type DateRange } from 'ui-kit';

export default function DatePickerReportPeriod() {
  const [period, setPeriod] = useState<DateRange>({ from: null, to: null });

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field>
        <Label>Report period</Label>
        {/* confirm: nothing changes until Apply */}
        <DateRangePicker value={period} onValueChange={setPeriod} confirm placeholder="All time" />
      </Field>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {period.from && period.to ? `Revenue report for ${formatPickerDateRange(period)}` : 'Showing revenue for all time'}
      </p>
    </div>
  );
}
