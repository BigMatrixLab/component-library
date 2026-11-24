'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';

export type RadioGroupOrientation = 'vertical' | 'horizontal';
export type RadioGroupVariant = 'default' | 'card';
export type RadioGroupSize = 'sm' | 'md' | 'lg';

interface RadioContextValue {
  name: string;
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  variant: RadioGroupVariant;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Selected value (controlled). Use `''` for "nothing selected". */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value when the selection changes. */
  onValueChange?: (value: string) => void;
  /** Shared `name` of the native radios, so the group submits with a form. Generated if omitted. */
  name?: string;
  /** Layout direction. Default `vertical`. */
  orientation?: RadioGroupOrientation;
  /** `card` renders each item as a bordered card with a selection ring that glides between them. */
  variant?: RadioGroupVariant;
  /** Circle size: 16 / 20 / 24px. Default `md`. */
  size?: RadioGroupSize;
  disabled?: boolean;
  required?: boolean;
  /** Error state for every item. */
  invalid?: boolean;
}

/**
 * RadioGroup — native radios sharing one `name`, so arrow keys, roving
 * tab stop, form submission and screen-reader semantics are the browser's.
 * Controlled or uncontrolled.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    value,
    defaultValue = '',
    onValueChange,
    name,
    orientation = 'vertical',
    variant = 'default',
    size = 'md',
    disabled,
    required,
    invalid,
    className,
    children,
    ...props
  },
  ref,
) {
  const generatedName = useId();
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const groupRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const composed = useComposedRefs(ref, groupRef);

  const context = useMemo<RadioContextValue>(
    () => ({ name: name ?? generatedName, value: current, setValue: setCurrent, disabled, required, invalid, variant }),
    [name, generatedName, current, setCurrent, disabled, required, invalid, variant],
  );

  // Card variant: measure the selected card and move one ring to it (spring morph via CSS transitions).
  const isCard = variant === 'card';
  const place = useCallback(() => {
    const group = groupRef.current;
    const ring = indicatorRef.current;
    if (!group || !ring) return;
    const item = group.querySelector<HTMLElement>('.ui-radio-card[data-state="checked"]');
    if (!item) {
      ring.style.opacity = '0';
      return;
    }
    ring.style.width = `${item.offsetWidth}px`;
    ring.style.height = `${item.offsetHeight}px`;
    ring.style.transform = `translate(${item.offsetLeft}px, ${item.offsetTop}px)`;
    ring.style.opacity = '1';
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (isCard) place();
  }, [isCard, current, orientation, place]);

  // The ring may only glide after its first placement, and not while the layout resizes.
  useEffect(() => {
    const group = groupRef.current;
    if (!isCard || !group) return;
    let frame = requestAnimationFrame(() => group.setAttribute('data-glide', ''));
    let first = true;
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (first) {
              first = false;
              return;
            }
            group.removeAttribute('data-glide');
            place();
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => group.setAttribute('data-glide', ''));
          })
        : null;
    observer?.observe(group);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      group.removeAttribute('data-glide');
    };
  }, [isCard, place]);

  return (
    <RadioContext.Provider value={context}>
      <div
        ref={composed}
        role="radiogroup"
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        data-orientation={orientation}
        data-variant={variant}
        className={cn('ui-radio-group', size !== 'md' && `ui-radio-group-${size}`, className)}
        {...props}
      >
        {children}
        {isCard && <span ref={indicatorRef} className="ui-radio-ring" aria-hidden="true" />}
      </div>
    </RadioContext.Provider>
  );
});

export interface RadioGroupItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'checked' | 'defaultChecked' | 'name'> {
  /** The value this item represents (required). */
  value: string;
  /** Visible label. Without one, pass `aria-label`. */
  label?: ReactNode;
  /** Secondary text under the label. */
  description?: ReactNode;
  /** Classes for the outer `<label>`; everything else goes to the `<input>`. */
  className?: string;
}

/** One option inside a RadioGroup. */
export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(function RadioGroupItem(
  { value, label, description, className, disabled, onChange, 'aria-describedby': describedBy, ...props },
  ref,
) {
  const group = useContext(RadioContext);
  if (!group) throw new Error('RadioGroupItem must be rendered inside <RadioGroup>.');
  const descId = useId();
  const checked = group.value === value;
  const isDisabled = disabled || group.disabled;
  const hasText = label != null || description != null;

  return (
    <label
      className={cn('ui-radio', group.variant === 'card' && 'ui-radio-card', className)}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={isDisabled ? '' : undefined}
    >
      <span className="ui-radio-control">
        <input
          ref={ref}
          type="radio"
          className="ui-radio-input"
          name={group.name}
          value={value}
          checked={checked}
          disabled={isDisabled}
          required={group.required}
          aria-invalid={group.invalid || undefined}
          aria-describedby={cn(description != null && descId, describedBy) || undefined}
          onChange={(e) => {
            if (e.currentTarget.checked) group.setValue(value);
            onChange?.(e);
          }}
          {...props}
        />
        <span className="ui-radio-circle" aria-hidden="true">
          <span className="ui-radio-dot" />
        </span>
      </span>
      {hasText && (
        <span className="ui-radio-text">
          {label != null && <span className="ui-radio-label">{label}</span>}
          {description != null && (
            <span id={descId} className="ui-radio-description">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});
