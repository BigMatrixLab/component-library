'use client';

import { forwardRef, useCallback, useId, useRef, useState, type ChangeEvent, type CSSProperties, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { useFieldControl } from '../field/field-context';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Text size and horizontal padding: `sm` 13px / `md` 14px / `lg` 15px. Default `md`. */
  size?: 'sm' | 'md' | 'lg';
  /** Grow with the content (CSS `field-sizing: content`, with a JS fallback). Default true. */
  autoGrow?: boolean;
  /** Minimum height in lines. Default 3. */
  rows?: number;
  /** Stop growing at this many lines and scroll instead. */
  maxRows?: number;
  /** Show a live character counter under the field (`42 / 280` when `maxLength` is set). */
  showCount?: boolean;
  /** Class for the wrapper that holds the counter (only rendered with `showCount`). */
  wrapperClassName?: string;
}

function supportsFieldSizing() {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('field-sizing', 'content');
}

/**
 * Textarea — multi-line text that grows with its content. Inside a <Field> it
 * picks up id, aria-describedby, aria-invalid, required and disabled.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = 'md',
    autoGrow = true,
    rows = 3,
    maxRows,
    showCount = false,
    wrapperClassName,
    className,
    style,
    id,
    required,
    disabled,
    value,
    defaultValue,
    maxLength,
    onChange,
    ...props
  },
  ref,
) {
  const countId = useId();
  const [length, setLength] = useState(() => String(value ?? defaultValue ?? '').length);
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const composed = useComposedRefs(ref, innerRef);

  const control = useFieldControl(
    {
      id,
      required,
      disabled,
      'aria-describedby': props['aria-describedby'],
      'aria-invalid': props['aria-invalid'],
    },
    showCount && countId,
  );

  // JS fallback for browsers without field-sizing: measure and set the height
  const fit = useCallback(() => {
    const el = innerRef.current;
    if (!el || !autoGrow || supportsFieldSizing()) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`;
  }, [autoGrow]);
  useIsomorphicLayoutEffect(fit, [fit, value, size, rows, maxRows]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    fit();
    onChange?.(e);
  };

  const count = value !== undefined ? String(value).length : length;
  const ratio = maxLength ? count / maxLength : 0;

  const textarea = (
    <textarea
      ref={composed}
      rows={rows}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      data-autogrow={autoGrow || undefined}
      className={cn('ui-textarea', size !== 'md' && `ui-textarea-${size}`, className)}
      style={
        {
          '--ui-textarea-rows': rows,
          ...(maxRows
            ? { '--ui-textarea-max': `calc(${maxRows} * var(--ui-textarea-lh) + 2 * var(--ui-textarea-py) + 2px)` }
            : null),
          ...style,
        } as CSSProperties
      }
      {...props}
      {...control}
    />
  );

  if (!showCount) return textarea;

  return (
    <div className={cn('ui-textarea-wrap', wrapperClassName)}>
      {textarea}
      <span
        id={countId}
        className="ui-textarea-count"
        data-state={ratio >= 1 ? 'limit' : ratio >= 0.9 ? 'near' : undefined}
      >
        {maxLength ? `${count} / ${maxLength}` : count}
      </span>
    </div>
  );
});
