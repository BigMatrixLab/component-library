'use client';

import { memo, useMemo, type KeyboardEvent } from 'react';
import { dateKey, getMonthWeeks, getWeekdayLabels, isSameDay, isSameMonth, type WeekStart } from './date-utils';

/** What a day cell needs to know about the selection. */
export interface DayState {
  /** A date the user actually picked. */
  selected: boolean;
  /** Position inside the (possibly previewed) range band. */
  range?: 'start' | 'middle' | 'end';
  /** The band is a hover/keyboard preview, not a committed range. */
  preview?: boolean;
}

export interface CalendarGridProps {
  month: Date;
  titleId: string;
  weekStartsOn: WeekStart;
  locale?: string;
  /** Show the days of the neighbouring months (single-month calendars only). */
  showOutsideDays: boolean;
  /** The one day that is in the tab order. */
  tabDate: Date;
  today: Date | null;
  isDisabled: (d: Date) => boolean;
  getState: (d: Date) => DayState;
  onSelect: (d: Date) => void;
  onPreview: (d: Date | null) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  /** Slide direction after a month change; null on first render. */
  direction: 'next' | 'prev' | null;
}

/** One month as an ARIA grid (a real table with role="grid"). */
export const CalendarGrid = memo(function CalendarGrid({
  month,
  titleId,
  weekStartsOn,
  locale,
  showOutsideDays,
  tabDate,
  today,
  isDisabled,
  getState,
  onSelect,
  onPreview,
  onKeyDown,
  direction,
}: CalendarGridProps) {
  const weekdays = useMemo(() => getWeekdayLabels(locale, weekStartsOn), [locale, weekStartsOn]);
  const weeks = useMemo(() => getMonthWeeks(month, weekStartsOn), [month, weekStartsOn]);
  const fullFormat = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'full' }), [locale]);

  return (
    <table role="grid" className="ui-calendar-grid" aria-labelledby={titleId} data-direction={direction ?? undefined} onKeyDown={onKeyDown}>
      <thead>
        <tr>
          {weekdays.map((w) => (
            <th key={w.long} scope="col" abbr={w.long} className="ui-calendar-weekday">
              {w.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={dateKey(week[0]!)}>
            {week.map((date) => {
              const outside = !isSameMonth(date, month);
              if (outside && !showOutsideDays) {
                return <td key={dateKey(date)} role="gridcell" aria-hidden="true" className="ui-calendar-cell" />;
              }
              const state = getState(date);
              const disabled = isDisabled(date);
              const isToday = today !== null && isSameDay(date, today);
              const tabbable = !outside && isSameDay(date, tabDate);
              return (
                <td
                  key={dateKey(date)}
                  role="gridcell"
                  className="ui-calendar-cell"
                  aria-selected={state.selected || undefined}
                  data-range={state.range}
                  data-preview={state.preview || undefined}
                >
                  <button
                    type="button"
                    className="ui-calendar-day"
                    data-date={dateKey(date)}
                    data-selected={state.selected || undefined}
                    data-range-edge={state.range && state.range !== 'middle' ? state.range : undefined}
                    data-today={isToday || undefined}
                    data-outside={outside || undefined}
                    data-disabled={disabled || undefined}
                    aria-disabled={disabled || undefined}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={fullFormat.format(date)}
                    tabIndex={tabbable ? 0 : -1}
                    onClick={() => onSelect(date)}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && onPreview(date)}
                  >
                    {date.getDate()}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
});

