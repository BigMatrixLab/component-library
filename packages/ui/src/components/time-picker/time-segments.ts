import {
  formatTimeValue,
  fromTwelveHour,
  parseTimeValue,
  toTwelveHour,
  type DayPeriod,
} from './time-utils';

/** The editable parts of the field, left to right. */
export type TimeSegment = 'hour' | 'minute' | 'second' | 'period';

/**
 * What the field shows. `hour` is 1–12 on a 12-hour clock and 0–23 otherwise;
 * a part is null until it has been filled in.
 */
export interface SegmentState {
  hour: number | null;
  minute: number | null;
  second: number | null;
  period: DayPeriod | null;
}

export const emptySegments = (): SegmentState => ({ hour: null, minute: null, second: null, period: null });

/** Segments for a value string; empty for null or an invalid value. */
export function segmentsFromValue(value: string | null | undefined, hour12: boolean): SegmentState {
  const p = parseTimeValue(value);
  if (!p) return emptySegments();
  if (!hour12) return { hour: p.hour, minute: p.minute, second: p.second, period: null };
  const t = toTwelveHour(p.hour);
  return { hour: t.hour, minute: p.minute, second: p.second, period: t.period };
}

/** The value string, or null while any shown segment is still empty. */
export function segmentsToValue(state: SegmentState, hour12: boolean, seconds: boolean): string | null {
  const { hour, minute, second, period } = state;
  if (hour === null || minute === null) return null;
  if (seconds && second === null) return null;
  if (hour12 && period === null) return null;
  return formatTimeValue(
    { hour: hour12 ? fromTwelveHour(hour, period as DayPeriod) : hour, minute, second: seconds ? (second ?? 0) : 0 },
    seconds,
  );
}

/** The segments shown for a given configuration, in order. */
export function visibleSegments(hour12: boolean, seconds: boolean): TimeSegment[] {
  return ['hour', 'minute', ...(seconds ? (['second'] as const) : []), ...(hour12 ? (['period'] as const) : [])];
}

/** Lowest and highest number a numeric segment can hold. */
export function segmentRange(segment: 'hour' | 'minute' | 'second', hour12: boolean): [number, number] {
  if (segment === 'hour') return hour12 ? [1, 12] : [0, 23];
  return [0, 59];
}

/**
 * Arrow up/down: step a segment by `delta`, wrapping at the ends (hours do not
 * touch AM/PM). An empty segment starts from the low end going up, the high end going down.
 */
export function stepSegment(state: SegmentState, segment: TimeSegment, delta: 1 | -1, hour12: boolean): SegmentState {
  if (segment === 'period') {
    const next: DayPeriod = state.period === null ? (delta > 0 ? 'AM' : 'PM') : state.period === 'AM' ? 'PM' : 'AM';
    return { ...state, period: next };
  }
  const [lo, hi] = segmentRange(segment, hour12);
  const current = state[segment];
  const size = hi - lo + 1;
  const next = current === null ? (delta > 0 ? lo : hi) : ((current - lo + delta + size) % size) + lo;
  return { ...state, [segment]: next };
}

/** Home / End: jump a numeric segment to its lowest or highest value. */
export function setSegmentEdge(state: SegmentState, segment: TimeSegment, edge: 'min' | 'max', hour12: boolean): SegmentState {
  if (segment === 'period') return { ...state, period: edge === 'min' ? 'AM' : 'PM' };
  const [lo, hi] = segmentRange(segment, hour12);
  return { ...state, [segment]: edge === 'min' ? lo : hi };
}

/** Backspace / Delete: empty one segment. */
export function clearSegment(state: SegmentState, segment: TimeSegment): SegmentState {
  return { ...state, [segment]: null };
}

export interface TypeResult {
  state: SegmentState;
  /** Digits typed into this segment so far, waiting for a second one ('' when finished). */
  buffer: string;
  /** Move on to the next segment. */
  advance: boolean;
}

/**
 * A digit typed into a numeric segment. The first digit waits for a second
 * ("1" then "5" → 15) unless no second digit could follow ("7" → 07 and move on).
 * A second digit that would overshoot the range starts over ("2" then "5" in
 * 24-hour → 5). On a 12-hour clock "00" means 12.
 */
export function typeDigit(
  state: SegmentState,
  segment: 'hour' | 'minute' | 'second',
  digit: number,
  buffer: string,
  hour12: boolean,
): TypeResult {
  const [lo, hi] = segmentRange(segment, hour12);
  const firstMax = Math.floor(hi / 10);
  const set = (n: number | null) => ({ ...state, [segment]: n });

  if (buffer !== '') {
    let n = Number(buffer) * 10 + digit;
    if (segment === 'hour' && hour12 && n === 0) n = 12;
    if (n >= lo && n <= hi) return { state: set(n), buffer: '', advance: true };
    // Overshoot: treat this digit as the first of a new number
    return typeDigit(state, segment, digit, '', hour12);
  }

  if (digit > firstMax) return { state: set(digit), buffer: '', advance: true };
  // "0" on a 12-hour clock is not a value yet; keep what was there until the next digit
  return { state: digit >= lo ? set(digit) : state, buffer: String(digit), advance: false };
}

/** The text a numeric segment shows: two digits, or "" when empty. */
export function segmentText(state: SegmentState, segment: 'hour' | 'minute' | 'second', buffer = ''): string {
  if (buffer) return buffer.padStart(2, '0');
  const v = state[segment];
  return v === null ? '' : String(v).padStart(2, '0');
}
