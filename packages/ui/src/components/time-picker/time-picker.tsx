'use client';

import {
  Fragment,
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { PickerPanel } from '../date-picker/picker-panel';
import { useFieldControl } from '../field/field-context';
import { TIME_LIST_FOCUS, TimeList, centerTimeOption } from './time-list';
import {
  clearSegment,
  emptySegments,
  segmentRange,
  segmentText,
  segmentsFromValue,
  segmentsToValue,
  setSegmentEdge,
  stepSegment,
  typeDigit,
  visibleSegments,
  type SegmentState,
  type TimeSegment,
} from './time-segments';
import { buildTimeOptions, compareTimes, getDayPeriodLabels, resolveHour12, type DayPeriod } from './time-utils';

export interface TimePickerLabels {
  hour?: string;
  minute?: string;
  second?: string;
  period?: string;
  clear?: string;
  /** The button that opens the list of times. */
  open?: string;
  /** The list of times. */
  list?: string;
}

export interface TimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'placeholder'> {
  /** "HH:mm" (24-hour), or "HH:mm:ss" with `seconds`. `null` means empty. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** BCP 47 tag; decides 12 or 24 hours and the AM/PM words. Default `en-US`. */
  locale?: string;
  /** Force a 12-hour (true) or 24-hour (false) clock. Default: the locale's. */
  hour12?: boolean;
  /** Show a seconds segment. */
  seconds?: boolean;
  /** Add a popover list of times every `step` minutes (15, 30, 60…). Without it there is no list. */
  step?: number;
  /** Earliest time in the list ("09:00"); a value before it is flagged invalid. */
  min?: string;
  /** Latest time in the list ("17:30"); a value after it is flagged invalid. */
  max?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show a clear button once something is filled in. Default true. */
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Submitted with a form as "HH:mm" through a hidden input. */
  name?: string;
  /** Id of the hour segment, which the <Label> targets. Inside a <Field> it follows the label. */
  id?: string;
  /** Height: 32 / 36 / 44px. Default `md`. */
  size?: 'sm' | 'md' | 'lg';
  labels?: TimePickerLabels;
}

type Buffer = { segment: TimeSegment; text: string } | null;

/**
 * TimePicker — segmented hour / minute (/ second) / AM-PM fields like a native
 * time input: arrows step, digits fill and move on, Backspace clears. Add `step`
 * for a popover list of times. The value is a "HH:mm" string, or null while
 * any segment is empty.
 */
export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker(props, forwardedRef) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    locale = 'en-US',
    hour12: hour12Prop,
    seconds = false,
    step,
    min,
    max,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    clearable = true,
    disabled,
    required,
    name,
    id,
    size = 'md',
    labels,
    className,
    onClick,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const L = {
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    period: 'AM or PM',
    clear: 'Clear time',
    open: 'Choose a time',
    list: 'Times',
    ...labels,
  };

  const listId = `${useId()}-list`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, rootRef);
  const listButtonRef = useRef<HTMLButtonElement | null>(null);
  const segmentRefs = useRef<Partial<Record<TimeSegment, HTMLInputElement | null>>>({});

  const control = useFieldControl({ id, required, disabled, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid });
  const isDisabled = !!control.disabled;

  const hour12 = resolveHour12(locale, hour12Prop);
  const periodLabels = useMemo(() => getDayPeriodLabels(locale), [locale]);
  const segments = visibleSegments(hour12, seconds);
  const hasList = !!step && step > 0;

  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const [openState, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const open = openState && hasList && !isDisabled;

  const [state, setState] = useState<SegmentState>(() => segmentsFromValue(value, hour12));
  const [buffer, setBuffer] = useState<Buffer>(null);

  // A value that arrives from outside replaces the segments, unless they already show it
  useEffect(() => {
    setState((prev) => (segmentsToValue(prev, hour12, seconds) === value ? prev : segmentsFromValue(value, hour12)));
  }, [value, hour12, seconds]);

  const update = (next: SegmentState) => {
    setState(next);
    setValue(segmentsToValue(next, hour12, seconds));
  };

  const focusSegment = (segment: TimeSegment | undefined) => {
    if (!segment) return;
    const el = segmentRefs.current[segment];
    el?.focus();
    el?.select();
  };
  const move = (from: TimeSegment, delta: 1 | -1) => focusSegment(segments[segments.indexOf(from) + delta]);

  const typeInto = (segment: 'hour' | 'minute' | 'second', digit: number) => {
    const pending = buffer && buffer.segment === segment ? buffer.text : '';
    const result = typeDigit(state, segment, digit, pending, hour12);
    setBuffer(result.buffer ? { segment, text: result.buffer } : null);
    update(result.state);
    if (result.advance) move(segment, 1);
  };

  const typePeriod = (char: string) => {
    const lower = char.toLowerCase();
    const first = (p: DayPeriod) => periodLabels[p].trim().charAt(0).toLowerCase();
    const picked: DayPeriod | null = lower === first('AM') || lower === 'a' ? 'AM' : lower === first('PM') || lower === 'p' ? 'PM' : null;
    if (picked) update({ ...state, period: picked });
  };

  const onSegmentKeyDown = (e: KeyboardEvent<HTMLInputElement>, segment: TimeSegment) => {
    if (e.ctrlKey || e.metaKey) return;
    const key = e.key;
    const numeric = segment !== 'period';

    if (key === 'ArrowDown' && e.altKey && hasList) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (e.altKey) return;

    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        setBuffer(null);
        update(stepSegment(state, segment, key === 'ArrowUp' ? 1 : -1, hour12));
        return;
      case 'Home':
      case 'End':
        e.preventDefault();
        setBuffer(null);
        update(setSegmentEdge(state, segment, key === 'Home' ? 'min' : 'max', hour12));
        return;
      case 'ArrowLeft':
        e.preventDefault();
        move(segment, -1);
        return;
      case 'ArrowRight':
        e.preventDefault();
        move(segment, 1);
        return;
      case 'Backspace':
      case 'Delete': {
        e.preventDefault();
        const empty = state[segment] === null;
        setBuffer(null);
        if (empty && key === 'Backspace') move(segment, -1);
        else update(clearSegment(state, segment));
        return;
      }
      case ':':
      case ' ':
      case ',':
      case '.':
      case '-':
      case '/':
        e.preventDefault();
        setBuffer(null);
        move(segment, 1);
        return;
    }

    if (key.length !== 1) return; // Tab, Enter, Escape, IME keys and the like keep their native behaviour
    e.preventDefault();
    if (numeric && /^\d$/.test(key)) typeInto(segment, Number(key));
    else if (!numeric) typePeriod(key);
  };

  // Soft keyboards often send no usable key: read the character from the input event instead
  const onSegmentChange = (e: ChangeEvent<HTMLInputElement>, segment: TimeSegment) => {
    const char = e.target.value.slice(-1);
    if (segment === 'period') typePeriod(char);
    else if (/^\d$/.test(char)) typeInto(segment, Number(char));
  };

  const invalidRange =
    value !== null && ((!!min && compareTimes(value, min) < 0) || (!!max && compareTimes(value, max) > 0));
  const invalid = invalidRange || (!!control['aria-invalid'] && control['aria-invalid'] !== 'false');
  const filled = state.hour !== null || state.minute !== null || state.second !== null || state.period !== null;

  const options = useMemo(
    () => (hasList ? buildTimeOptions({ step, min, max, seconds }) : []),
    [hasList, step, min, max, seconds],
  );

  const pickFromList = (next: string) => {
    setValue(next);
    setState(segmentsFromValue(next, hour12));
    setBuffer(null);
    setOpen(false);
  };

  const onRootClick = (e: MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || isDisabled) return;
    if ((e.target as HTMLElement).closest('button, input, [role="dialog"]')) return;
    focusSegment(segments.find((s) => state[s] === null) ?? segments[0]);
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn('ui-picker-field ui-timepicker', size !== 'md' && `ui-picker-field-${size}`, className)}
      data-state={open ? 'open' : 'closed'}
      data-disabled={isDisabled || undefined}
      data-invalid={invalid || undefined}
      onClick={onRootClick}
      {...rest}
    >
      {!hasList && <Icon name="clock" className="ui-picker-icon ui-timepicker-icon" />}
      <div className="ui-timepicker-segments">
        {segments.map((segment, i) => {
          const isPeriod = segment === 'period';
          const range = isPeriod ? null : segmentRange(segment, hour12);
          const current = isPeriod ? null : state[segment];
          const text = isPeriod ? (state.period ? periodLabels[state.period] : '') : segmentText(state, segment, buffer?.segment === segment ? buffer.text : '');
          const label = L[segment];
          return (
            <Fragment key={segment}>
              {i > 0 && (
                <span className="ui-timepicker-sep" aria-hidden="true">
                  {isPeriod ? '' : ':'}
                </span>
              )}
              <input
                ref={(el) => {
                  segmentRefs.current[segment] = el;
                }}
                type="text"
                role="spinbutton"
                id={i === 0 ? control.id : undefined}
                className="ui-timepicker-segment"
                data-segment={segment}
                inputMode={isPeriod ? 'text' : 'numeric'}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="next"
                value={text}
                placeholder="––"
                disabled={isDisabled}
                style={isPeriod ? ({ '--ui-seg-ch': Math.max(2, periodLabels.AM.length, periodLabels.PM.length) } as CSSProperties) : undefined}
                aria-label={label}
                aria-valuemin={range?.[0]}
                aria-valuemax={range?.[1]}
                aria-valuenow={current ?? undefined}
                aria-valuetext={text || 'Empty'}
                aria-required={control.required || undefined}
                aria-invalid={invalid || undefined}
                aria-describedby={control['aria-describedby']}
                onKeyDown={(e) => onSegmentKeyDown(e, segment)}
                onChange={(e) => onSegmentChange(e, segment)}
                onFocus={(e) => e.currentTarget.select()}
                onMouseUp={(e) => e.preventDefault()}
                onBlur={() => setBuffer((b) => (b && b.segment === segment ? null : b))}
              />
            </Fragment>
          );
        })}
      </div>

      {clearable && !isDisabled && filled && (
        <button
          type="button"
          className="ui-input-action"
          aria-label={L.clear}
          onClick={() => {
            setBuffer(null);
            update(emptySegments());
            focusSegment(segments[0]);
          }}
        >
          <Icon name="x" />
        </button>
      )}
      {hasList && (
        <button
          ref={listButtonRef}
          type="button"
          className="ui-input-action"
          aria-label={L.open}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={isDisabled}
          data-state={open ? 'open' : 'closed'}
          onClick={() => setOpen(!open)}
        >
          <Icon name="clock" />
        </button>
      )}

      {name && <input type="hidden" name={name} value={value ?? ''} disabled={isDisabled} />}

      {hasList && (
        <PickerPanel
          open={open}
          onOpenChange={setOpen}
          anchorRef={rootRef}
          returnFocusRef={listButtonRef}
          id={listId}
          aria-label={L.open}
          className="ui-timepicker-panel"
          focusSelector={TIME_LIST_FOCUS}
          onOpened={centerTimeOption}
        >
          <TimeList
            options={options}
            value={value}
            locale={locale}
            hour12={hour12}
            seconds={seconds}
            label={L.list}
            onSelect={pickFromList}
          />
        </PickerPanel>
      )}
    </div>
  );
});
