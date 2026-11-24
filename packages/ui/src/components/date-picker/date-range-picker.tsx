'use client';

import { forwardRef, useId, useMemo, useRef, type HTMLAttributes } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { dateKey, startOfDay, type DateMatcher } from '../calendar/date-utils';
import { emptyRange, type DateRange } from '../calendar/selection';
import { useFieldControl } from '../field/field-context';
import { formatPickerDateRange } from './date-input';
import type { PickerCalendarProps, PickerSize } from './date-picker';
import { DateRangePanel } from './date-range-panel';
import { defaultDateRangePresets, type DateRangePreset } from './date-range-presets';
import { PickerPanel } from './picker-panel';

export interface DateRangePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'placeholder'> {
  /** Selected range (controlled). */
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** BCP 47 tag for the formatted value and the calendar. Default `en-US`. */
  locale?: string;
  /** Intl.DateTimeFormat options for each date. Default "Nov 3 – Nov 24, 2026". */
  format?: Intl.DateTimeFormatOptions;
  /** Shown while empty. Default "Pick a date range". */
  placeholder?: string;
  clearable?: boolean;
  /** Shortcuts shown beside the calendar. `false` or `[]` hides them. Default: Today … This year. */
  presets?: DateRangePreset[] | false;
  /** Add Apply / Cancel: nothing is committed until Apply. Default false (commits on the second pick). */
  confirm?: boolean;
  min?: Date;
  max?: Date;
  disabledDates?: DateMatcher;
  disabled?: boolean;
  required?: boolean;
  /** Hidden-input names; each submits an ISO date (yyyy-mm-dd). */
  startName?: string;
  endName?: string;
  id?: string;
  size?: PickerSize;
  today?: Date;
  clearLabel?: string;
  panelLabel?: string;
  applyLabel?: string;
  cancelLabel?: string;
  presetsLabel?: string;
  pendingLabel?: string;
  calendarProps?: PickerCalendarProps;
}

/**
 * DateRangePicker — an input-like field that opens a range calendar with
 * presets. Two months side by side on wide screens, one on phones. By default
 * the range commits when the second date is picked; `confirm` adds Apply / Cancel.
 */
export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(function DateRangePicker(props, forwardedRef) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    locale = 'en-US',
    format,
    placeholder = 'Pick a date range',
    clearable = true,
    presets = defaultDateRangePresets,
    confirm = false,
    min,
    max,
    disabledDates,
    disabled,
    required,
    startName,
    endName,
    id,
    size = 'md',
    today: todayProp,
    clearLabel = 'Clear dates',
    panelLabel = 'Choose a date range',
    applyLabel = 'Apply',
    cancelLabel = 'Cancel',
    presetsLabel = 'Presets',
    pendingLabel = 'Select an end date',
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

  const control = useFieldControl(
    { id, required, disabled, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid },
    valueId,
  );
  const isDisabled = !!control.disabled;

  const [value, setValue] = useControllableState<DateRange>({
    value: valueProp,
    defaultValue: defaultValue ?? emptyRange(),
    onChange: onValueChange,
  });
  const [openState, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const open = openState && !isDisabled;

  const today = useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp]);
  const presetList = presets === false ? [] : presets;

  const text = formatPickerDateRange(value, locale, format);
  const invalid = !!control['aria-invalid'] && control['aria-invalid'] !== 'false';
  const showClear = clearable && !isDisabled && !!value.from;

  const commit = (range: DateRange) => {
    setValue(range);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={cn('ui-picker-field ui-daterangepicker', size !== 'md' && `ui-picker-field-${size}`, className)}
      data-state={open ? 'open' : 'closed'}
      data-disabled={isDisabled || undefined}
      data-invalid={invalid || undefined}
      {...rest}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ui-picker-trigger"
        id={control.id}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={control['aria-describedby']}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-state={open ? 'open' : 'closed'}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Icon name="calendar" className="ui-picker-icon" />
        <span id={valueId} className="ui-picker-value" data-placeholder={!text || undefined}>
          {text || placeholder}
        </span>
      </button>
      {showClear && (
        <button
          type="button"
          className="ui-input-action"
          aria-label={clearLabel}
          onClick={() => {
            setValue(emptyRange());
            triggerRef.current?.focus();
          }}
        >
          <Icon name="x" />
        </button>
      )}

      {startName && <input type="hidden" name={startName} value={value.from ? dateKey(value.from) : ''} disabled={isDisabled} />}
      {endName && <input type="hidden" name={endName} value={value.to ? dateKey(value.to) : ''} disabled={isDisabled} />}

      <PickerPanel
        open={open}
        onOpenChange={setOpen}
        anchorRef={fieldRef}
        returnFocusRef={triggerRef}
        id={panelId}
        aria-label={panelLabel}
        className="ui-daterange-panel"
        focusSelector='.ui-calendar-day[tabindex="0"]'
      >
        <DateRangePanel
          value={value}
          confirm={confirm}
          presets={presetList}
          today={today}
          todayProp={todayProp}
          locale={locale}
          format={format}
          min={min}
          max={max}
          disabledDates={disabledDates}
          calendarProps={calendarProps}
          onCommit={commit}
          onCancel={() => setOpen(false)}
          applyLabel={applyLabel}
          cancelLabel={cancelLabel}
          presetsLabel={presetsLabel}
          pendingLabel={pendingLabel}
        />
      </PickerPanel>
    </div>
  );
});
