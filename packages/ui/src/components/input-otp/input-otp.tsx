'use client';

import {
  Fragment,
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { activeSlotIndex, resolveGroups, sanitizeOTP, type OTPPattern } from './otp-utils';

export interface InputOTPProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'pattern' | 'maxLength' | 'type'> {
  /** Number of characters. Ignored when `groups` is set (the sum is used). Default 6. */
  length?: number;
  /** Slots per group, e.g. `[3, 3]` renders `___ - ___`. */
  groups?: number[];
  /** Shown between groups. Default: a short dash. */
  separator?: ReactNode;
  /** Allowed characters. Default `digits`. */
  pattern?: OTPPattern;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once when every slot is filled. */
  onComplete?: (value: string) => void;
  /** Error state: red slots and `aria-invalid`. */
  invalid?: boolean;
  /** Slot size: 32×40 / 40×48 / 48×56. Default `md`. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * InputOTP — one box per character over a single real `<input>`
 * (autocomplete="one-time-code"), so paste, SMS autofill, password managers and
 * forms all work. The slots are only the visual layer.
 */
export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP(
  {
    length = 6,
    groups,
    separator,
    pattern = 'digits',
    value,
    defaultValue = '',
    onValueChange,
    onComplete,
    invalid,
    size = 'md',
    disabled,
    className,
    autoComplete = 'one-time-code',
    'aria-label': ariaLabel = 'One-time code',
    onFocus,
    onBlur,
    onKeyDown,
    onClick,
    ...props
  },
  ref,
) {
  const sizes = resolveGroups(length, groups);
  const total = sizes.reduce((a, b) => a + b, 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);
  const slotsRef = useRef<HTMLDivElement>(null);

  const [code, setCode] = useControllableState<string>({
    value: value === undefined ? undefined : sanitizeOTP(value, pattern, total),
    defaultValue: sanitizeOTP(defaultValue, pattern, total),
    onChange: onValueChange,
  });
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);

  /** Put the caret in slot `i`: select its character so typing overwrites it. */
  const place = useCallback(
    (i: number) => {
      const el = inputRef.current;
      if (!el) return;
      const at = Math.max(0, Math.min(i, el.value.length, total - 1));
      const end = at < el.value.length ? at + 1 : at;
      if (el.selectionStart !== at || el.selectionEnd !== end) el.setSelectionRange(at, end);
      setActive(at);
    },
    [total],
  );

  const sync = useCallback(() => {
    const el = inputRef.current;
    if (!el || document.activeElement !== el) return;
    place(activeSlotIndex(el.selectionStart, el.value.length, total));
  }, [place, total]);

  // After the value changes (typing, paste, controlled update) re-place the caret
  useIsomorphicLayoutEffect(() => {
    sync();
  }, [code, sync]);

  const commit = (next: string) => {
    const clean = sanitizeOTP(next, pattern, total);
    const changed = clean !== code;
    setCode(clean);
    if (changed && clean.length === total) onComplete?.(clean);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    commit(e.target.value);
    requestAnimationFrame(sync);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    commit(e.clipboardData.getData('text'));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const len = code.length;
    const move = (i: number) => {
      e.preventDefault();
      place(i);
    };
    // Arrows move between slots (a selected character would otherwise collapse the caret)
    if (e.key === 'ArrowLeft') move(active - 1);
    else if (e.key === 'ArrowRight') move(Math.min(active + 1, len));
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(len);
  };

  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    onClick?.(e);
    // The input covers the slots: find the slot under the pointer
    const slots = slotsRef.current?.querySelectorAll<HTMLElement>('.ui-otp-slot');
    if (!slots) return;
    let hit = -1;
    slots.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right) hit = i;
    });
    if (hit === -1) hit = e.clientX < slots[0]!.getBoundingClientRect().left ? 0 : slots.length - 1;
    place(hit);
  };

  let index = 0;
  return (
    <div
      ref={slotsRef}
      className={cn('ui-otp', className)}
      data-size={size === 'md' ? undefined : size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {sizes.map((groupSize, g) => (
        <Fragment key={g}>
          {g > 0 && (
            <span className="ui-otp-separator" aria-hidden="true">
              {separator ?? <span className="ui-otp-dash" />}
            </span>
          )}
          <div className="ui-otp-group" aria-hidden="true">
            {Array.from({ length: groupSize }, () => {
              const i = index++;
              const char = code[i];
              const isActive = focused && !disabled && active === i;
              return (
                <div
                  key={i}
                  className="ui-otp-slot"
                  data-active={isActive || undefined}
                  data-filled={char ? true : undefined}
                >
                  {char}
                  {isActive && !char && <span className="ui-otp-caret" />}
                </div>
              );
            })}
          </div>
        </Fragment>
      ))}
      <input
        ref={composedRef}
        className="ui-otp-input"
        type="text"
        inputMode={pattern === 'digits' ? 'numeric' : 'text'}
        pattern={pattern === 'digits' ? '[0-9]*' : '[a-zA-Z0-9]*'}
        autoComplete={autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        value={code}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onSelect={sync}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
          // Safari places the caret after focus; wait a frame
          requestAnimationFrame(sync);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </div>
  );
});
