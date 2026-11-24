'use client';

import { forwardRef, useId, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { cn } from '../../lib/cn';

export type SwitchSize = 'sm' | 'md';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'role'> {
  /** Controlled state. Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the new state when toggled. */
  onCheckedChange?: (checked: boolean) => void;
  /** Track size: `sm` 32×18, `md` 40×24. Default `md`. */
  size?: SwitchSize;
  /** Form field name. A hidden input with `value` is rendered while the switch is on. */
  name?: string;
  /** Submitted value while on. Default `"on"`. */
  value?: string;
  /** Marks the switch as required for the form. */
  required?: boolean;
  /** Visible label. Rendering one wraps the switch in a row; without it, pass `aria-label` or your own `<label htmlFor>`. */
  label?: ReactNode;
  /** Secondary text under the label. */
  description?: ReactNode;
  /** Put the label before the switch and push them apart (settings rows). Default `end`. */
  labelPosition?: 'start' | 'end';
  /** Classes for the wrapper row (only rendered with `label` or `description`). */
  fieldClassName?: string;
}

/**
 * Switch — a `role="switch"` button for settings that apply immediately.
 * Space and Enter toggle it. Controlled or uncontrolled; submits through a
 * hidden input when `name` is set.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    size = 'md',
    name,
    value = 'on',
    required,
    label,
    description,
    labelPosition = 'end',
    fieldClassName,
    className,
    disabled,
    id,
    onClick,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const [on, setOn] = useControllableState({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  const generated = useId();
  const switchId = id ?? generated;
  const descId = `${switchId}-description`;
  const hasText = label != null || description != null;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) setOn(!on);
  };

  const control = (
    <>
      <button
        ref={ref}
        id={switchId}
        type="button"
        role="switch"
        aria-checked={on}
        aria-required={required || undefined}
        aria-describedby={cn(description != null && descId, describedBy) || undefined}
        data-state={on ? 'checked' : 'unchecked'}
        disabled={disabled}
        className={cn('ui-switch', size !== 'md' && `ui-switch-${size}`, className)}
        onClick={handleClick}
        {...props}
      >
        <span className="ui-switch-thumb" aria-hidden="true" />
      </button>
      {name && on && !disabled && <input type="hidden" name={name} value={value} />}
    </>
  );

  if (!hasText) return control;

  return (
    <div className={cn('ui-switch-field', labelPosition === 'start' && 'ui-switch-field-start', fieldClassName)} data-disabled={disabled ? '' : undefined}>
      {control}
      <span className="ui-switch-text">
        {label != null && (
          <label htmlFor={switchId} className="ui-switch-label">
            {label}
          </label>
        )}
        {description != null && (
          <span id={descId} className="ui-switch-description">
            {description}
          </span>
        )}
      </span>
    </div>
  );
});
