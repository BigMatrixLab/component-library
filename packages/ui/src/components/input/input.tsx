'use client';

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type MouseEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { useFieldControl } from '../field/field-context';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Height: 32 / 36 / 44px. Default `md`. Inside an <InputGroup>, set the size on the group. */
  size?: InputSize;
}

/**
 * Input — a native text input. Inside a <Field> it picks up the id,
 * aria-describedby, aria-invalid, required and disabled state.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', className, id, required, disabled, ...props },
  ref,
) {
  const control = useFieldControl({
    id,
    required,
    disabled,
    'aria-describedby': props['aria-describedby'],
    'aria-invalid': props['aria-invalid'],
  });
  return (
    <input
      ref={ref}
      className={cn('ui-input', size !== 'md' && `ui-input-${size}`, className)}
      {...props}
      {...control}
    />
  );
});

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Height of the whole group: 32 / 36 / 44px. Default `md`. */
  size?: InputSize;
}

/**
 * InputGroup — one bordered field that holds an <Input> plus icons, addons
 * and action buttons. Clicking a non-interactive part focuses the input.
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { size = 'md', className, onClick, ...props },
  ref,
) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea')) return;
    e.currentTarget.querySelector<HTMLElement>('input, textarea')?.focus();
  };
  return (
    <div
      ref={ref}
      className={cn('ui-input-group', size !== 'md' && `ui-input-group-${size}`, className)}
      onClick={handleClick}
      {...props}
    />
  );
});

/** InputIcon — a decorative icon inside the field, before or after the input. */
export const InputIcon = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function InputIcon(
  { className, ...props },
  ref,
) {
  return <span ref={ref} aria-hidden="true" className={cn('ui-input-icon', className)} {...props} />;
});

/** InputAddon — attached text on the edge of the field, such as "https://" or ".com". */
export const InputAddon = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function InputAddon(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn('ui-input-addon', className)} {...props} />;
});

export interface InputActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/** InputAction — an icon button inside the field (clear, reveal, copy). Always give it an `aria-label`. */
export const InputAction = forwardRef<HTMLButtonElement, InputActionProps>(function InputAction(
  { className, type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn('ui-input-action', className)} {...props} />;
});

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Controlled visibility of the password. */
  visible?: boolean;
  /** Initial visibility when uncontrolled. */
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** Accessible name of the reveal button. Default "Show password". */
  toggleLabel?: string;
  /** Class for the surrounding group. */
  groupClassName?: string;
}

/** PasswordInput — an input with a reveal toggle (`aria-pressed`, eye / eye-off). */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { size = 'md', visible: visibleProp, defaultVisible = false, onVisibleChange, toggleLabel = 'Show password', groupClassName, ...props },
  ref,
) {
  const [visible, setVisible] = useControllableState({ value: visibleProp, defaultValue: defaultVisible, onChange: onVisibleChange });
  const { disabled } = useFieldControl({ disabled: props.disabled });
  return (
    <InputGroup size={size} className={groupClassName}>
      <Input ref={ref} {...props} type={visible ? 'text' : 'password'} />
      <InputAction
        aria-label={toggleLabel}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible(!visible)}
      >
        <Icon name={visible ? 'eye-off' : 'eye'} />
      </InputAction>
    </InputGroup>
  );
});
