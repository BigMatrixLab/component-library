'use client';

import { forwardRef, useEffect, useId, useRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'default' | 'card';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'prefix'> {
  /** Controlled state. Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the new state when the user toggles the box. */
  onCheckedChange?: (checked: boolean) => void;
  /** Mixed state (a "select all" with some children selected). Shows a dash; the next click checks it. */
  indeterminate?: boolean;
  /** Box size: 16 / 20 / 24px. Default `md`. */
  size?: CheckboxSize;
  /** `card` makes the whole bordered card the target and tints it when checked. */
  variant?: CheckboxVariant;
  /** Visible label. Without one, pass `aria-label`. */
  label?: ReactNode;
  /** Secondary text under the label (wired with `aria-describedby`). */
  description?: ReactNode;
  /** Error state: destructive border and `aria-invalid`. */
  invalid?: boolean;
  /** Classes for the outer `<label>`; everything else goes to the `<input>`. */
  className?: string;
}

const CHECK_PATH = 'M4 8.5l2.5 2.5L12 5.5';
const DASH_PATH = 'M4.5 8h7';

/**
 * Checkbox — a native checkbox (forms, autofill, a11y for free) with a custom
 * box whose mark draws in. Controlled or uncontrolled.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    indeterminate = false,
    size = 'md',
    variant = 'default',
    label,
    description,
    invalid,
    className,
    disabled,
    id,
    onChange,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  const inputRef = useRef<HTMLInputElement>(null);
  const composed = useComposedRefs(ref, inputRef);
  const descId = useId();
  const hasText = label != null || description != null;

  // `indeterminate` is a DOM property, not an attribute
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    setValue(input.checked);
    onChange?.(e);
    // A click clears the native indeterminate flag; the prop decides
    input.indeterminate = indeterminate;
  };

  const state = indeterminate ? 'indeterminate' : value ? 'checked' : 'unchecked';

  return (
    <label
      className={cn('ui-checkbox', variant === 'card' && 'ui-checkbox-card', size !== 'md' && `ui-checkbox-${size}`, className)}
      data-state={state}
      data-disabled={disabled ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
    >
      <span className="ui-checkbox-control">
        <input
          ref={composed}
          id={id}
          type="checkbox"
          className="ui-checkbox-input"
          checked={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={cn(description != null && descId, describedBy) || undefined}
          onChange={handleChange}
          {...props}
        />
        <span className="ui-checkbox-box" aria-hidden="true">
          <svg viewBox="0 0 16 16" className="ui-checkbox-mark" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path className="ui-checkbox-check" d={CHECK_PATH} pathLength={1} />
            <path className="ui-checkbox-dash" d={DASH_PATH} pathLength={1} />
          </svg>
        </span>
      </span>
      {hasText && (
        <span className="ui-checkbox-text">
          {label != null && <span className="ui-checkbox-label">{label}</span>}
          {description != null && (
            <span id={descId} className="ui-checkbox-description">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});
