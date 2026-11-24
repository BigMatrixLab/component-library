import {
  clearSegment,
  emptySegments,
  segmentsFromValue,
  segmentsToValue,
  segmentText,
  stepSegment,
  typeDigit,
  visibleSegments,
} from './time-segments';
import {
  buildTimeOptions,
  compareTimes,
  formatTimeLabel,
  fromTwelveHour,
  getDayPeriodLabels,
  nearestTimeIndex,
  parseTimeValue,
  resolveHour12,
  toTwelveHour,
} from './time-utils';

describe('time-utils', () => {
  it('parses and rejects time strings', () => {
    expect(parseTimeValue('09:05')).toEqual({ hour: 9, minute: 5, second: 0 });
    expect(parseTimeValue('23:59:58')).toEqual({ hour: 23, minute: 59, second: 58 });
    expect(parseTimeValue('9:30')).toEqual({ hour: 9, minute: 30, second: 0 });
    expect(parseTimeValue('24:00')).toBeNull();
    expect(parseTimeValue('12:60')).toBeNull();
    expect(parseTimeValue('noon')).toBeNull();
    expect(parseTimeValue(null)).toBeNull();
  });

  it('converts between 12 and 24 hours', () => {
    expect(toTwelveHour(0)).toEqual({ hour: 12, period: 'AM' });
    expect(toTwelveHour(12)).toEqual({ hour: 12, period: 'PM' });
    expect(toTwelveHour(15)).toEqual({ hour: 3, period: 'PM' });
    expect(fromTwelveHour(12, 'AM')).toBe(0);
    expect(fromTwelveHour(12, 'PM')).toBe(12);
    expect(fromTwelveHour(3, 'PM')).toBe(15);
  });

  it('picks the clock from the locale unless told otherwise', () => {
    expect(resolveHour12('en-US')).toBe(true);
    expect(resolveHour12('de-DE')).toBe(false);
    expect(resolveHour12('en-US', false)).toBe(false);
    expect(getDayPeriodLabels('en-US')).toEqual({ AM: 'AM', PM: 'PM' });
  });

  it('formats a time for a list', () => {
    expect(formatTimeLabel('15:30', 'en-US', true)).toMatch(/^3:30\sPM$/);
    expect(formatTimeLabel('15:30', 'en-US', false)).toBe('15:30');
  });

  it('builds the list of times', () => {
    const all = buildTimeOptions({ step: 15 });
    expect(all).toHaveLength(96);
    expect(all[0]).toBe('00:00');
    expect(all[all.length - 1]).toBe('23:45');
    expect(buildTimeOptions({ step: 30, min: '09:00', max: '10:30' })).toEqual(['09:00', '09:30', '10:00', '10:30']);
    expect(buildTimeOptions({ step: 60, min: '09:10', max: '12:00' })).toEqual(['10:00', '11:00', '12:00']);
    expect(buildTimeOptions({ step: 60, min: '08:00', max: '09:00', seconds: true })).toEqual(['08:00:00', '09:00:00']);
  });

  it('finds the step at or before a value', () => {
    const options = buildTimeOptions({ step: 15 });
    expect(options[nearestTimeIndex(options, '09:20')]).toBe('09:15');
    expect(options[nearestTimeIndex(options, '09:30')]).toBe('09:30');
    expect(nearestTimeIndex([], '09:30')).toBe(-1);
    expect(compareTimes('09:00', '17:30')).toBeLessThan(0);
  });
});

describe('time-segments', () => {
  it('round-trips a value through the segments', () => {
    expect(segmentsFromValue('15:30', true)).toEqual({ hour: 3, minute: 30, second: 0, period: 'PM' });
    expect(segmentsToValue(segmentsFromValue('15:30', true), true, false)).toBe('15:30');
    expect(segmentsToValue(segmentsFromValue('00:05', true), true, false)).toBe('00:05');
    expect(segmentsToValue(segmentsFromValue('07:45:10', false), false, true)).toBe('07:45:10');
  });

  it('has no value until every shown segment is filled', () => {
    expect(segmentsToValue(emptySegments(), false, false)).toBeNull();
    expect(segmentsToValue({ hour: 9, minute: null, second: null, period: null }, false, false)).toBeNull();
    expect(segmentsToValue({ hour: 9, minute: 30, second: null, period: null }, true, false)).toBeNull();
    expect(segmentsToValue({ hour: 9, minute: 30, second: null, period: 'AM' }, true, false)).toBe('09:30');
    expect(segmentsToValue({ hour: 9, minute: 30, second: null, period: null }, false, true)).toBeNull();
  });

  it('lists the visible segments', () => {
    expect(visibleSegments(true, false)).toEqual(['hour', 'minute', 'period']);
    expect(visibleSegments(false, true)).toEqual(['hour', 'minute', 'second']);
  });

  it('steps with wrap-around', () => {
    const s = { ...emptySegments(), hour: 12, minute: 59, period: 'AM' as const };
    expect(stepSegment(s, 'hour', 1, true).hour).toBe(1);
    expect(stepSegment(s, 'hour', -1, true).hour).toBe(11);
    expect(stepSegment(s, 'minute', 1, true).minute).toBe(0);
    expect(stepSegment({ ...s, hour: 0 }, 'hour', -1, false).hour).toBe(23);
    expect(stepSegment(s, 'period', 1, true).period).toBe('PM');
    expect(stepSegment(emptySegments(), 'hour', 1, true).hour).toBe(1);
    expect(stepSegment(emptySegments(), 'hour', -1, false).hour).toBe(23);
    expect(clearSegment(s, 'minute').minute).toBeNull();
  });

  it('types digits, waiting for a second one only when it can follow', () => {
    // 24-hour: "1" waits, "5" completes → 15
    let r = typeDigit(emptySegments(), 'hour', 1, '', false);
    expect(r).toMatchObject({ buffer: '1', advance: false });
    r = typeDigit(r.state, 'hour', 5, r.buffer, false);
    expect(r.state.hour).toBe(15);
    expect(r.advance).toBe(true);
    // "3" cannot start a 24-hour hour of two digits → 03 and move on
    r = typeDigit(emptySegments(), 'hour', 3, '', false);
    expect(r).toMatchObject({ buffer: '', advance: true });
    expect(r.state.hour).toBe(3);
    // 12-hour: "2" moves on at once; "1" then "5" overshoots and restarts as 5
    expect(typeDigit(emptySegments(), 'hour', 2, '', true).advance).toBe(true);
    r = typeDigit(typeDigit(emptySegments(), 'hour', 1, '', true).state, 'hour', 5, '1', true);
    expect(r.state.hour).toBe(5);
    // 12-hour "00" is 12
    r = typeDigit(emptySegments(), 'hour', 0, '', true);
    expect(r.buffer).toBe('0');
    expect(typeDigit(r.state, 'hour', 0, r.buffer, true).state.hour).toBe(12);
    // minutes: "6" completes as 06, "4" waits
    expect(typeDigit(emptySegments(), 'minute', 6, '', true).state.minute).toBe(6);
    expect(typeDigit(emptySegments(), 'minute', 4, '', true).advance).toBe(false);
  });

  it('shows two digits, buffered or not', () => {
    expect(segmentText({ ...emptySegments(), hour: 7 }, 'hour')).toBe('07');
    expect(segmentText(emptySegments(), 'minute')).toBe('');
    expect(segmentText(emptySegments(), 'minute', '3')).toBe('03');
  });
});
