'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { Calendar, type CalendarSingleProps } from '../calendar/calendar';
import { dateKey, isAfter, isBefore, matchesDate, startOfDay, type DateMatcher } from '../calendar/date-utils';
import { useFieldControl } from '../field/field-context';
import { formatPickerDate, parsePickerDate } from './date-input';
import { PickerPanel } from './picker-panel';

export type PickerSize = 'sm' | 'md' | 'lg';

/** Calendar options a picker passes through. */
export type PickerCalendarProps = Partial<
  Pick<CalendarSingleProps, 'weekStartsOn' | 'previousLabel' | 'nextLabel' | 'showOutsideDays' | 'numberOfMonths'>
>;

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'placeholder'> {
  /** Selected date (controlled). `null` means empty. */
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  /** Controlled open state of the calendar popover. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** BCP 47 tag for the formatted value and the calendar. Default `en-US`. */
  locale?: string;
  /** Intl.DateTimeFormat options for the shown value. Default "Nov 24, 2026". */
  format?: Intl.DateTimeFormatOptions;
  /** Shown while empty. Default "Pick a date". */
  placeholder?: string;
  /** Show a clear button once there is a value. Default true. */
  clearable?: boolean;
  /** Let people type the date ("11/24/2026", "Nov 24") as well as pick it. */
  typeable?: boolean;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Dates that cannot be picked: a list, or a function returning true to disable. */
  disabledDates?: DateMatcher;
  /** Disable the whole control. */
  disabled?: boolean;
  required?: boolean;
  /** Submitted with a form as an ISO date (yyyy-mm-dd) through a hidden input. */
  name?: string;
  /** Id of the trigger (or the text input when `typeable`). Inside a <Field> it follows the label. */
  id?: string;
  /** Height: 32 / 36 / 44px. Default `md`. */
  size?: PickerSize;
  /** Treat this as "today" (tests, demos). */
  today?: Date;
  /** Accessible names. */
  clearLabel?: string;
  openLabel?: string;
  panelLabel?: string;
  calendarProps?: PickerCalendarProps;
}

/**
 * DatePicker — an input-like field that opens our Calendar. Picking a day
 * closes the popover. With `typeable` the text can be edited too: it is parsed
 * on Enter or blur and flagged invalid when it is not a real, allowed date.
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(props, forwardedRef) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    locale = 'en-US',
    format,
    placeholder = 'Pick a date',
    clearable = true,
    typeable = false,
    min,
    max,
    disabledDates,
    disabled,
    required,
    name,
    id,
    size = 'md',
    today: todayProp,
    clearLabel = 'Clear date',
    openLabel = 'Choose date',
    panelLabel = 'Choose date',
    calendarProps,
    className,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const uid = useId();
  const panelId = `${uid}-panel`;
  const valueId = `${uid}-value`;
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, fieldRef);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const focusRef = typeable ? inputRef : triggerRef;

  const control = useFieldControl(
    { id, required, disabled, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid },
    !typeable && valueId,
  );
  const isDisabled = !!control.disabled;

  const [value, setValue] = useControllableState<Date | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const [openState, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const open = openState && !isDisabled;

  const today = useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp]);
  const blocked = (d: Date) =>
    (!!min && isBefore(d, min)) || (!!max && isAfter(d, max)) || matchesDate(d, disabledDates);

  // Typed text: null while the field just shows the formatted value
  const [text, setText] = useState<string | null>(null);
  const [typedInvalid, setTypedInvalid] = useState(false);
  const valueKey = value ? dateKey(value) : '';
  useEffect(() => {
    // The value changed from outside (clear, a pick, the parent): drop stale typing
    if (typeof document !== 'undefined' && document.activeElement !== inputRef.current) {
      setText(null);
      setTypedInvalid(false);
    }
  }, [valueKey]);

  const commitText = () => {
    if (text === null) return;
    if (!text.trim()) {
      setValue(null);
      setText(null);
      setTypedInvalid(false);
      return;
    }
    const parsed = parsePickerDate(text, locale, today);
    if (parsed && !blocked(parsed)) {
      setValue(parsed);
      setText(null);
      setTypedInvalid(false);
    } else {
      setTypedInvalid(true);
    }
  };

  const pick = (d: Date | null) => {
    setValue(d);
    setText(null);
    setTypedInvalid(false);
    setOpen(false);
  };

  const clear = () => {
    setValue(null);
    setText(null);
    setTypedInvalid(false);
    focusRef.current?.focus();
  };

  const formatted = value ? formatPickerDate(value, locale, format) : '';
  const invalid = typedInvalid || (!!control['aria-invalid'] && control['aria-invalid'] !== 'false');
  const showClear = clearable && !isDisabled && (!!value || (typeable && !!text));

  const popupProps = {
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open,
    'aria-controls': open ? panelId : undefined,
  };

  const onTypedKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'Enter') {
      if (open) return;
      e.preventDefault();
      commitText();
    } else if (e.key === 'Escape' && !open && text !== null) {
      setText(null);
      setTypedInvalid(false);
    }
  };

  return (
    <div
      ref={ref}
      className={cn('ui-picker-field ui-datepicker', size !== 'md' && `ui-picker-field-${size}`, className)}
      data-state={open ? 'open' : 'closed'}
      data-disabled={isDisabled || undefined}
      data-invalid={invalid || undefined}
      {...rest}
    >
      {typeable ? (
        <>
          <input
            ref={inputRef}
            type="text"
            className="ui-picker-input"
            id={control.id}
            value={text ?? formatted}
            placeholder={placeholder}
            disabled={isDisabled}
            required={control.required}
            autoComplete="off"
            spellCheck={false}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={control['aria-describedby']}
            aria-invalid={invalid || undefined}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setText(e.target.value);
              setTypedInvalid(false);
            }}
            onBlur={commitText}
            onKeyDown={onTypedKeyDown}
          />
          {showClear && (
            <button type="button" className="ui-input-action" aria-label={clearLabel} onClick={clear}>
              <Icon name="x" />
            </button>
          )}
          <button
            ref={triggerRef}
            type="button"
            className="ui-input-action"
            aria-label={openLabel}
            disabled={isDisabled}
            data-state={open ? 'open' : 'closed'}
            onClick={() => setOpen(!open)}
            {...popupProps}
          >
            <Icon name="calendar" />
          </button>
        </>
      ) : (
        <>
          <button
            ref={triggerRef}
            type="button"
            className="ui-picker-trigger"
            id={control.id}
            disabled={isDisabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={control['aria-describedby']}
            data-state={open ? 'open' : 'closed'}
            onClick={() => setOpen(!open)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
              }
            }}
            {...popupProps}
          >
            <Icon name="calendar" className="ui-picker-icon" />
            <span id={valueId} className="ui-picker-value" data-placeholder={!value || undefined}>
              {value ? formatted : placeholder}
            </span>
          </button>
          {showClear && (
            <button type="button" className="ui-input-action" aria-label={clearLabel} onClick={clear}>
              <Icon name="x" />
            </button>
          )}
        </>
      )}

      {name && <input type="hidden" name={name} value={valueKey} disabled={isDisabled} />}

      <PickerPanel
        open={open}
        onOpenChange={setOpen}
        anchorRef={fieldRef}
        returnFocusRef={focusRef}
        id={panelId}
        aria-label={panelLabel}
        focusSelector='.ui-calendar-day[tabindex="0"]'
      >
        <Calendar
          mode="single"
          value={value}
          onValueChange={pick}
          locale={locale}
          min={min}
          max={max}
          disabled={disabledDates}
          today={todayProp}
          {...calendarProps}
        />
      </PickerPanel>
    </div>
  );
});
