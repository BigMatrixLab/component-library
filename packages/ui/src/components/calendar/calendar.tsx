'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { cn } from '../../lib/cn';
import { composeRefs } from '../../lib/compose-refs';
import { CalendarGrid, type DayState } from './calendar-grid';
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDays,
  endOfMonth,
  endOfWeek,
  formatMonthYear,
  isAfter,
  isBefore,
  isBetween,
  isSameDay,
  isSameMonth,
  matchesDate,
  monthKey,
  parseDateKey,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type DateMatcher,
  type WeekStart,
} from './date-utils';
import {
  emptyRange,
  firstSelectedDate,
  nextRange,
  orderDates,
  toggleDate,
  type CalendarSelection,
  type DateRange,
} from './selection';

export type CalendarMode = 'single' | 'multiple' | 'range';

interface CalendarBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Month shown (controlled). Any day in the month works. */
  month?: Date;
  /** Month shown first (uncontrolled). Default: the selected date, else today. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Months side by side (they wrap on narrow screens). Default 1. */
  numberOfMonths?: number;
  /** First column: 0 = Sunday … 6 = Saturday. Default 1 (Monday). */
  weekStartsOn?: WeekStart;
  /** BCP 47 tag for month and weekday names. Default `en-US`. */
  locale?: string;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Dates that cannot be picked: a list, or a function returning true to disable. */
  disabled?: DateMatcher;
  /** Show the grey days of neighbouring months (single month only). Default true. */
  showOutsideDays?: boolean;
  /** Treat this as "today" (tests, demos). Default: the current date. */
  today?: Date;
  /** Accessible names for the month buttons. */
  previousLabel?: string;
  nextLabel?: string;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}
export interface CalendarMultipleProps extends CalendarBaseProps {
  mode: 'multiple';
  value?: Date[];
  defaultValue?: Date[];
  onValueChange?: (value: Date[]) => void;
}
export interface CalendarRangeProps extends CalendarBaseProps {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
}
export type CalendarProps = CalendarSingleProps | CalendarMultipleProps | CalendarRangeProps;

type LooseProps = CalendarBaseProps & {
  mode?: CalendarMode;
  value?: CalendarSelection;
  defaultValue?: CalendarSelection;
  onValueChange?: (value: CalendarSelection) => void;
};

/**
 * Calendar — month grid with single, multiple and range selection, min/max/
 * disabled dates, several months side by side and the APG date-grid keyboard map.
 * Dates are plain `Date` objects at local midnight.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = 'single',
    value,
    defaultValue,
    onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    weekStartsOn = 1,
    locale = 'en-US',
    min,
    max,
    disabled,
    showOutsideDays = true,
    today: todayProp,
    previousLabel = 'Previous month',
    nextLabel = 'Next month',
    className,
    onFocus,
    onBlur,
    onPointerLeave,
    ...rest
  } = props as LooseProps;

  const count = Math.max(1, Math.floor(numberOfMonths));
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [nowState] = useState(() => new Date());
  const today = useMemo(() => startOfDay(todayProp ?? nowState), [todayProp, nowState]);

  const [selection, setSelection] = useControllableState<CalendarSelection>({
    value,
    defaultValue: defaultValue ?? (mode === 'multiple' ? [] : mode === 'range' ? emptyRange() : null),
    onChange: onValueChange,
  });

  const [firstMonth, setFirstMonth] = useControllableState<Date>({
    value: monthProp ? startOfMonth(monthProp) : undefined,
    defaultValue: startOfMonth(defaultMonth ?? firstSelectedDate(selection) ?? today),
    onChange: onMonthChange,
  });
  const lastMonth = addMonths(firstMonth, count - 1);

  const isVisible = useCallback(
    (d: Date) => compareDays(d, firstMonth) >= 0 && compareDays(d, endOfMonth(lastMonth)) <= 0,
    [firstMonth, lastMonth],
  );

  const [focusDate, setFocusDate] = useState<Date>(() => {
    const picked = firstSelectedDate(selection);
    const start = startOfMonth(defaultMonth ?? picked ?? today);
    const end = endOfMonth(addMonths(start, count - 1));
    if (picked && isBetween(picked, start, end)) return picked;
    return isBetween(today, start, end) ? today : start;
  });
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const [inside, setInside] = useState(false);
  const focusRequest = useRef(false);

  const isDisabled = useCallback(
    (d: Date) => (min && isBefore(d, min)) || (max && isAfter(d, max)) || matchesDate(d, disabled) || false,
    [min, max, disabled],
  );

  const goToMonth = useCallback(
    (target: Date) => {
      const next = startOfMonth(target);
      if (isSameMonth(next, firstMonth)) return;
      setDirection(isAfter(next, firstMonth) ? 'next' : 'prev');
      setFirstMonth(next);
      // Keep the tab stop inside the new view (same day of month, clamped)
      setFocusDate((prev) => {
        const end = endOfMonth(addMonths(next, count - 1));
        if (isBetween(prev, next, end)) return prev;
        const dim = endOfMonth(next).getDate();
        return new Date(next.getFullYear(), next.getMonth(), Math.min(prev.getDate(), dim));
      });
    },
    [firstMonth, setFirstMonth, count],
  );

  const moveFocus = useCallback(
    (to: Date) => {
      const target = clampDate(to, min, max);
      focusRequest.current = true;
      setFocusDate(target);
      if (!isVisible(target)) {
        goToMonth(isBefore(target, firstMonth) ? target : addMonths(target, -(count - 1)));
      }
    },
    [min, max, isVisible, goToMonth, firstMonth, count],
  );

  // After a keyboard move, focus the button once it has rendered (the month may have changed)
  useEffect(() => {
    if (!focusRequest.current) return;
    focusRequest.current = false;
    rootRef.current?.querySelector<HTMLElement>('.ui-calendar-day[tabindex="0"]')?.focus();
  }, [focusDate, firstMonth]);

  const handleSelect = useCallback(
    (d: Date) => {
      if (isDisabled(d)) return;
      // A grey day of a neighbouring month: select it and turn to its month
      if (!isVisible(d) || (count === 1 && !isSameMonth(d, firstMonth))) goToMonth(d);
      setFocusDate(d);
      if (mode === 'multiple') setSelection(toggleDate((selection as Date[]) ?? [], d));
      else if (mode === 'range') setSelection(nextRange((selection as DateRange) ?? emptyRange(), d));
      else setSelection(d);
    },
    [isDisabled, isVisible, count, firstMonth, goToMonth, mode, selection, setSelection],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const from = parseDateKey((e.target as HTMLElement).dataset?.date);
    if (!from || e.altKey || e.ctrlKey || e.metaKey) return;
    let next: Date;
    switch (e.key) {
      case 'ArrowLeft': next = addDays(from, -1); break;
      case 'ArrowRight': next = addDays(from, 1); break;
      case 'ArrowUp': next = addDays(from, -7); break;
      case 'ArrowDown': next = addDays(from, 7); break;
      case 'Home': next = startOfWeek(from, weekStartsOn); break;
      case 'End': next = endOfWeek(from, weekStartsOn); break;
      case 'PageUp': next = e.shiftKey ? addYears(from, -1) : addMonths(from, -1); break;
      case 'PageDown': next = e.shiftKey ? addYears(from, 1) : addMonths(from, 1); break;
      default: return;
    }
    e.preventDefault();
    moveFocus(next);
  };

  // Range band: committed, or previewed while the end is still open
  const range = mode === 'range' ? ((selection as DateRange | null) ?? emptyRange()) : null;
  const previewTarget = hover ?? (inside ? focusDate : null);
  const previewing = !!range?.from && !range.to && !!previewTarget && !isSameDay(range.from, previewTarget);
  const band: [Date, Date] | null =
    range?.from && range.to
      ? [range.from, range.to]
      : previewing && range?.from && previewTarget
        ? orderDates(range.from, previewTarget)
        : null;

  const getState = (d: Date): DayState => {
    if (mode === 'multiple') return { selected: ((selection as Date[]) ?? []).some((x) => isSameDay(x, d)) };
    if (mode === 'single') return { selected: !!selection && isSameDay(selection as Date, d) };
    const selected = !!range && ((!!range.from && isSameDay(range.from, d)) || (!!range.to && isSameDay(range.to, d)));
    if (!band || isSameDay(band[0], band[1])) return { selected };
    const pos = isSameDay(d, band[0]) ? 'start' : isSameDay(d, band[1]) ? 'end' : isBetween(d, band[0], band[1]) ? 'middle' : undefined;
    return { selected, range: pos, preview: pos && !range?.to ? true : undefined };
  };

  const tabDate = isVisible(focusDate) ? focusDate : clampDate(firstMonth, min, max);
  const canPrev = !min || !isBefore(endOfMonth(addMonths(firstMonth, -1)), min);
  const canNext = !max || !isAfter(startOfMonth(addMonths(lastMonth, 1)), max);
  const onPreview = (d: Date | null) => {
    if (range?.from && !range.to) setHover(d);
  };

  return (
    <div
      ref={composeRefs(ref, rootRef)}
      className={cn('ui-calendar', className)}
      data-mode={mode}
      onFocus={(e) => {
        setInside(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInside(false);
        onBlur?.(e);
      }}
      onPointerLeave={(e) => {
        setHover(null);
        onPointerLeave?.(e);
      }}
      {...rest}
    >
      <div className="ui-calendar-months">
        {Array.from({ length: count }, (_, i) => {
          const m = addMonths(firstMonth, i);
          const titleId = `${baseId}-title-${i}`;
          return (
            <div key={i} className="ui-calendar-month">
              <div className="ui-calendar-caption">
                {i === 0 ? (
                  <button
                    type="button"
                    className="ui-calendar-nav"
                    aria-label={previousLabel}
                    aria-disabled={!canPrev || undefined}
                    onClick={() => canPrev && goToMonth(addMonths(firstMonth, -1))}
                  >
                    <Icon name="chevron-left" />
                  </button>
                ) : (
                  <span className="ui-calendar-nav-spacer" />
                )}
                <div key={monthKey(m)} id={titleId} className="ui-calendar-title" aria-live="polite" data-direction={direction ?? undefined}>
                  {formatMonthYear(m, locale)}
                </div>
                {i === count - 1 ? (
                  <button
                    type="button"
                    className="ui-calendar-nav"
                    aria-label={nextLabel}
                    aria-disabled={!canNext || undefined}
                    onClick={() => canNext && goToMonth(addMonths(firstMonth, 1))}
                  >
                    <Icon name="chevron-right" />
                  </button>
                ) : (
                  <span className="ui-calendar-nav-spacer" />
                )}
              </div>
              <CalendarGrid
                key={monthKey(m)}
                month={m}
                titleId={titleId}
                weekStartsOn={weekStartsOn}
                locale={locale}
                showOutsideDays={showOutsideDays && count === 1}
                tabDate={tabDate}
                today={today}
                isDisabled={isDisabled}
                getState={getState}
                onSelect={handleSelect}
                onPreview={onPreview}
                onKeyDown={onKeyDown}
                direction={direction}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
