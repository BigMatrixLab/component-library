'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { usePressRepeat } from '../../hooks/use-press-repeat';
import { Icon } from '../../icons/icon';
import { useFieldControl } from '../field/field-context';
import { InputGroup, type InputSize } from '../input/input';
import { clampNumber, countDecimals, createFormatter, parseNumber, roundTo, type NumberStyle } from './format';

export type NumberInputControls = 'inside' | 'attached' | 'none';

export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step' | 'role'
  > {
  /** Controlled value. `null` means empty. */
  value?: number | null;
  /** Initial value when uncontrolled. Default `null` (empty). */
  defaultValue?: number | null;
  /** Called when a value is committed (step buttons, keys, blur, Enter). Not on every keystroke. */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Amount of one step. Default 1. For `percent`, 0.01 is one percentage point. */
  step?: number;
  /** Amount of PageUp / PageDown. Default `step * 10`. */
  largeStep?: number;
  /** How the number is shown. `percent` values are fractions: 0.15 shows "15%". Default `number`. */
  format?: NumberStyle;
  /** Locale for display and parsing, e.g. "en-US", "de-DE". Pass it explicitly to keep server and client output identical. */
  locale?: string;
  /** ISO 4217 code for `format="currency"`. Default "USD". */
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** Where the − and + buttons sit: inside the field, attached as segments, or hidden. Default `inside`. */
  controls?: NumberInputControls;
  /** Change the value with the mouse wheel while the input is focused. Default false. */
  allowWheel?: boolean;
  /** Keep stepping, and speed up, while a button is held down. Default true. */
  holdToRepeat?: boolean;
  /** Height: 32 / 36 / 44px. Default `md`. */
  size?: InputSize;
  /** Accessible name of the + button. Default "Increase". */
  incrementLabel?: string;
  /** Accessible name of the − button. Default "Decrease". */
  decrementLabel?: string;
  /** Class for the surrounding group. `className` goes on the input. */
  groupClassName?: string;
}

/**
 * NumberInput — a spinbutton with − / + buttons, min / max / step, formatted display
 * (number, currency, percent) and parse-on-blur. Inside a <Field> it picks up the id,
 * aria-describedby, aria-invalid, required and disabled state. With `name` it also
 * submits the raw number through a hidden input.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    largeStep,
    format = 'number',
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    controls = 'inside',
    allowWheel = false,
    holdToRepeat = true,
    size = 'md',
    incrementLabel = 'Increase',
    decrementLabel = 'Decrease',
    groupClassName,
    className,
    id,
    name,
    required,
    disabled,
    readOnly,
    onBlur,
    onKeyDown,
    ...props
  },
  ref,
) {
  const control = useFieldControl({
    id,
    required,
    disabled,
    'aria-describedby': props['aria-describedby'],
    'aria-invalid': props['aria-invalid'],
  });
  const [value, setValue] = useControllableState<number | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);

  const stepPrecision = Math.max(countDecimals(step), min !== undefined ? countDecimals(min) : 0);
  const formatter = useMemo(
    () => createFormatter({ style: format, locale, currency, minimumFractionDigits, maximumFractionDigits }, stepPrecision),
    [format, locale, currency, minimumFractionDigits, maximumFractionDigits, stepPrecision],
  );
  // Values keep as many decimals as are displayed, so typing 12.345 is not rounded to the step
  const digits = Math.max(stepPrecision, (formatter.resolvedOptions().maximumFractionDigits ?? 0) + (format === 'percent' ? 2 : 0));

  const isDisabled = !!control.disabled;
  const display = draft ?? (value === null ? '' : formatter.format(value));

  // Latest state for hold-to-repeat ticks and the wheel listener, which outlive a render
  const latest = useRef({ value, draft });
  latest.current = { value, draft };

  const normalize = useCallback(
    (n: number) => clampNumber(roundTo(n, digits), min, max),
    [digits, min, max],
  );

  const parse = useCallback((text: string) => parseNumber(text, { style: format, locale }), [format, locale]);

  /** Move one `step * multiplier` up or down. Returns false when the value did not change. */
  const stepBy = useCallback(
    (direction: 1 | -1, multiplier = 1): boolean => {
      if (isDisabled || readOnly) return false;
      const { value: current, draft: currentDraft } = latest.current;
      let base = current;
      if (currentDraft !== null) {
        const parsed = parse(currentDraft);
        if (parsed !== null) base = parsed;
        else if (currentDraft.trim() === '') base = null;
      }
      const delta = direction * step * multiplier;
      const next = normalize(base === null ? delta : base + delta);
      const changed = base === null || next !== base;
      latest.current = { value: next, draft: null };
      setDraft(null);
      setValue(next);
      return changed;
    },
    [isDisabled, readOnly, parse, step, normalize, setValue],
  );

  const setTo = (n: number) => {
    const next = normalize(n);
    latest.current = { value: next, draft: null };
    setDraft(null);
    setValue(next);
  };

  const commit = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') {
      latest.current = { value: null, draft: null };
      setValue(null);
    } else {
      const parsed = parse(trimmed);
      // Unreadable text is dropped and the previous value comes back
      if (parsed !== null) {
        const next = normalize(parsed);
        latest.current = { value: next, draft: null };
        setValue(next);
      }
    }
    setDraft(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    latest.current = { value: latest.current.value, draft: e.target.value };
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    if (draft !== null) commit(draft);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || isDisabled || readOnly || e.nativeEvent.isComposing) return;
    const page = largeStep !== undefined && step > 0 ? largeStep / step : 10;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        stepBy(1, e.shiftKey ? 10 : 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        stepBy(-1, e.shiftKey ? 10 : 1);
        break;
      case 'PageUp':
        e.preventDefault();
        stepBy(1, page);
        break;
      case 'PageDown':
        e.preventDefault();
        stepBy(-1, page);
        break;
      case 'Home':
        if (min !== undefined) {
          e.preventDefault();
          setTo(min);
        }
        break;
      case 'End':
        if (max !== undefined) {
          e.preventDefault();
          setTo(max);
        }
        break;
      case 'Enter':
        // Commit the typed text; the default action still submits a surrounding form
        if (draft !== null) commit(draft);
        break;
    }
  };

  // Wheel needs a non-passive listener so the page does not scroll while the value changes
  useEffect(() => {
    const el = inputRef.current;
    if (!allowWheel || !el) return;
    const onWheel = (e: WheelEvent) => {
      if (document.activeElement !== el || !e.deltaY) return;
      e.preventDefault();
      stepBy(e.deltaY < 0 ? 1 : -1, e.shiftKey ? 10 : 1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [allowWheel, stepBy]);

  const pressOptions = { repeat: holdToRepeat };
  const up = usePressRepeat((accel) => stepBy(1, accel), pressOptions);
  const down = usePressRepeat((accel) => stepBy(-1, accel), pressOptions);

  const locked = isDisabled || !!readOnly;
  const atMax = value !== null && max !== undefined && value >= max;
  const atMin = value !== null && min !== undefined && value <= min;

  const stepButton = (direction: 1 | -1) => {
    const inc = direction === 1;
    const press = inc ? up : down;
    return (
      <button
        type="button"
        tabIndex={-1}
        className={cn('ui-number-input-step', controls === 'inside' ? 'ui-input-action' : 'ui-number-input-step-attached')}
        data-direction={inc ? 'up' : 'down'}
        aria-label={inc ? incrementLabel : decrementLabel}
        aria-controls={control.id}
        disabled={locked || (inc ? atMax : atMin)}
        {...press}
      >
        <Icon name={inc ? 'plus' : 'minus'} />
      </button>
    );
  };

  const fractional = stepPrecision > 0 || format !== 'number';

  return (
    <>
      <InputGroup
        size={size}
        className={cn('ui-number-input', controls === 'attached' && 'ui-number-input-attached', groupClassName)}
        data-controls={controls}
      >
        {controls !== 'none' && stepButton(-1)}
        <input
          ref={composedRef}
          type="text"
          role="spinbutton"
          inputMode={fractional || (min !== undefined && min < 0) ? 'decimal' : 'numeric'}
          autoComplete="off"
          spellCheck={false}
          className={cn('ui-input', 'ui-number-input-field', className)}
          value={display}
          readOnly={readOnly}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value ?? undefined}
          aria-valuetext={value === null ? undefined : formatter.format(value)}
          {...props}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...control}
        />
        {controls !== 'none' && stepButton(1)}
      </InputGroup>
      {name && <input type="hidden" name={name} value={value ?? ''} disabled={isDisabled} />}
    </>
  );
});
