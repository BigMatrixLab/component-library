'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons/icon';
import { useFieldControl } from '../field/field-context';

export interface NativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Height: 32 / 36 / 44px. Default `md`. */
  size?: 'sm' | 'md' | 'lg';
  /** Class for the wrapper that holds the select and the chevron (width, margins). */
  wrapperClassName?: string;
}

/**
 * NativeSelect — the browser's own <select>, styled to match Input, with a
 * chevron. Keeps native behaviour: mobile pickers, type-ahead and form
 * participation. Inside a <Field> it picks up id, aria and required state.
 * An empty-value first option reads as a placeholder.
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { size = 'md', wrapperClassName, className, id, required, disabled, children, ...props },
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
    <div className={cn('ui-select-wrap', size !== 'md' && `ui-select-wrap-${size}`, wrapperClassName)}>
      <select ref={ref} className={cn('ui-select', className)} {...props} {...control}>
        {children}
      </select>
      <Icon name="chevron-down" className="ui-select-icon" />
    </div>
  );
});
