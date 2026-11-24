'use client';

import { forwardRef, useId, useState, type HTMLAttributes } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { cn } from '../../lib/cn';

export interface RatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Current rating, 0 = none (controlled). */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of stars. Default 5. */
  max?: number;
  /** Let people pick half stars (0.5 steps). */
  allowHalf?: boolean;
  /** Display only: shows fractional values (e.g. 4.3) and is not interactive. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Clicking the chosen star again, or pressing Backspace/Delete, clears the rating. */
  allowClear?: boolean;
  /** Star size: 16 / 24 / 32px. Default `md`. */
  size?: 'sm' | 'md' | 'lg';
  /** Submitted with a form (radios carry the value; read-only uses a hidden input). */
  name?: string;
  required?: boolean;
  /** Accessible name of the group. Default "Rating". */
  'aria-label'?: string;
}

const label = (v: number) => `${v} ${v === 1 ? 'star' : 'stars'}`;

/**
 * Rating — stars over native radio inputs (form-ready, arrow keys for free),
 * hover preview, optional half steps, and a read-only mode for fractional values.
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    value,
    defaultValue = 0,
    onValueChange,
    max = 5,
    allowHalf = false,
    readOnly = false,
    disabled = false,
    allowClear = false,
    size = 'md',
    name,
    required,
    className,
    onPointerLeave,
    onKeyDown,
    'aria-label': ariaLabel = 'Rating',
    ...props
  },
  ref,
) {
  const autoName = useId();
  const [current, setCurrent] = useControllableState<number>({ value, defaultValue, onChange: onValueChange });
  const [hover, setHover] = useState<number | null>(null);
  const [popped, setPopped] = useState<number | null>(null);
  const shown = hover ?? current;
  const count = Math.max(1, Math.floor(max));
  const stars = Array.from({ length: count }, (_, i) => i + 1);

  const star = (i: number) => {
    const fill = Math.max(0, Math.min(1, shown - (i - 1)));
    return (
      <span
        key={i}
        className="ui-rating-star"
        data-pop={popped === i || undefined}
        onAnimationEnd={() => setPopped((p) => (p === i ? null : p))}
      >
        <Icon name="star" className="ui-rating-empty" />
        <span className="ui-rating-fill" style={{ width: `${fill * 100}%` }}>
          <Icon name="star" />
        </span>
      </span>
    );
  };

  const common = {
    ref,
    className: cn('ui-rating', className),
    'data-size': size === 'md' ? undefined : size,
  };

  if (readOnly) {
    return (
      <div {...common} role="img" aria-label={`${ariaLabel}: ${current} out of ${count}`} data-readonly="" {...props}>
        {stars.map(star)}
        {name && <input type="hidden" name={name} value={current} />}
      </div>
    );
  }

  const choose = (v: number) => {
    if (disabled) return;
    if (allowClear && current === v) setCurrent(0);
    else setCurrent(v);
    setPopped(Math.ceil(v));
  };

  return (
    <div
      {...common}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      onPointerLeave={(e) => {
        setHover(null);
        onPointerLeave?.(e);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (allowClear && (e.key === 'Backspace' || e.key === 'Delete')) {
          e.preventDefault();
          setCurrent(0);
        }
      }}
      {...props}
    >
      {stars.map((i) => (
        <span key={i} className="ui-rating-item" data-hover={hover !== null || undefined}>
          {star(i)}
          {(allowHalf ? [i - 0.5, i] : [i]).map((step) => (
            <input
              key={step}
              type="radio"
              className="ui-rating-input"
              data-half={step % 1 !== 0 || undefined}
              name={name ?? autoName}
              value={step}
              checked={current === step}
              required={required}
              disabled={disabled}
              aria-label={label(step)}
              onChange={() => choose(step)}
              onClick={() => allowClear && current === step && choose(step)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && !disabled && setHover(step)}
            />
          ))}
        </span>
      ))}
    </div>
  );
});
