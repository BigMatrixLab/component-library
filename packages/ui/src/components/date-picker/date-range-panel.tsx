'use client';

import { useState } from 'react';
import { useMediaQuery } from '../../hooks/use-media-query';
import { Button } from '../button';
import { Calendar } from '../calendar/calendar';
import { clampDate, isAfter, isBefore, isSameDay, startOfDay, startOfMonth, type DateMatcher } from '../calendar/date-utils';
import type { DateRange } from '../calendar/selection';
import { formatPickerDateRange } from './date-input';
import { isCompleteRange, type DateRangePreset } from './date-range-presets';
import type { PickerCalendarProps } from './date-picker';

export interface DateRangePanelProps {
  value: DateRange;
  /** Wait for Apply instead of committing when the second date is picked. */
  confirm: boolean;
  presets: DateRangePreset[];
  /** Start of today, for presets. */
  today: Date;
  /** The `today` prop as given, passed on to the Calendar. */
  todayProp?: Date;
  locale: string;
  format?: Intl.DateTimeFormatOptions;
  min?: Date;
  max?: Date;
  disabledDates?: DateMatcher;
  calendarProps?: PickerCalendarProps;
  onCommit: (range: DateRange) => void;
  onCancel: () => void;
  applyLabel: string;
  cancelLabel: string;
  presetsLabel: string;
  /** Footer hint while the end date is still missing. */
  pendingLabel: string;
}

/**
 * The inside of the range picker's popover: presets, a Calendar in range mode
 * (two months on wide screens, one on phones) and an optional Apply / Cancel
 * footer. It holds the draft range, so closing the panel discards it.
 */
export function DateRangePanel({
  value,
  confirm,
  presets,
  today,
  todayProp,
  locale,
  format,
  min,
  max,
  disabledDates,
  calendarProps,
  onCommit,
  onCancel,
  applyLabel,
  cancelLabel,
  presetsLabel,
  pendingLabel,
}: DateRangePanelProps) {
  const wide = useMediaQuery('(min-width: 640px)');
  const [draft, setDraft] = useState<DateRange>(value);
  const [month, setMonth] = useState(() => startOfMonth(value.from ?? today));

  const resolve = (preset: DateRangePreset) => {
    const raw = preset.range(today);
    return {
      from: clampDate(startOfDay(raw.from), min, max),
      to: clampDate(startOfDay(raw.to), min, max),
      available: !(max && isAfter(raw.from, max)) && !(min && isBefore(raw.to, min)),
    };
  };

  const choosePreset = (preset: DateRangePreset) => {
    const { from, to } = resolve(preset);
    const next = { from, to };
    setDraft(next);
    setMonth(startOfMonth(from));
    if (!confirm) onCommit(next);
  };

  const onCalendarChange = (next: DateRange) => {
    setDraft(next);
    if (!confirm && next.from && next.to) onCommit(next);
  };

  const complete = isCompleteRange(draft);

  return (
    <div className="ui-daterange">
      {presets.length > 0 && (
        <div className="ui-daterange-presets" role="group" aria-label={presetsLabel}>
          {presets.map((preset) => {
            const r = resolve(preset);
            const active = !!draft.from && !!draft.to && isSameDay(draft.from, r.from) && isSameDay(draft.to, r.to);
            return (
              <button
                key={preset.label}
                type="button"
                className="ui-daterange-preset"
                aria-pressed={active}
                disabled={!r.available}
                onClick={() => choosePreset(preset)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
      <div className="ui-daterange-main">
        <Calendar
          mode="range"
          value={draft}
          onValueChange={onCalendarChange}
          month={month}
          onMonthChange={setMonth}
          numberOfMonths={wide ? 2 : 1}
          locale={locale}
          min={min}
          max={max}
          disabled={disabledDates}
          today={todayProp}
          {...calendarProps}
        />
        {confirm && (
          <div className="ui-daterange-footer">
            <span className="ui-daterange-summary" aria-live="polite" data-empty={!complete || undefined}>
              {complete ? formatPickerDateRange(draft, locale, format) : draft.from ? pendingLabel : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button size="sm" disabled={!complete} onClick={() => onCommit(draft)}>
              {applyLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
