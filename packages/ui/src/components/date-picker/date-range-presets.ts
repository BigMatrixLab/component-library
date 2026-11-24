import { addDays, addMonths, endOfMonth, startOfDay, startOfMonth } from '../calendar/date-utils';
import type { DateRange } from '../calendar/selection';

/** A shortcut in the range picker's presets column. */
export interface DateRangePreset {
  label: string;
  /** The range to select, computed from "today" so it is never stale. */
  range: (today: Date) => { from: Date; to: Date };
}

/** Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, This year. */
export const defaultDateRangePresets: DateRangePreset[] = [
  { label: 'Today', range: (t) => ({ from: startOfDay(t), to: startOfDay(t) }) },
  { label: 'Yesterday', range: (t) => ({ from: addDays(startOfDay(t), -1), to: addDays(startOfDay(t), -1) }) },
  { label: 'Last 7 days', range: (t) => ({ from: addDays(startOfDay(t), -6), to: startOfDay(t) }) },
  { label: 'Last 30 days', range: (t) => ({ from: addDays(startOfDay(t), -29), to: startOfDay(t) }) },
  { label: 'This month', range: (t) => ({ from: startOfMonth(t), to: endOfMonth(t) }) },
  {
    label: 'Last month',
    range: (t) => {
      const prev = addMonths(startOfMonth(t), -1);
      return { from: prev, to: endOfMonth(prev) };
    },
  },
  { label: 'This year', range: (t) => ({ from: new Date(t.getFullYear(), 0, 1), to: new Date(t.getFullYear(), 11, 31) }) },
];

/** True when a range has both ends. */
export const isCompleteRange = (r: DateRange | null | undefined): r is { from: Date; to: Date } => !!r?.from && !!r.to;
