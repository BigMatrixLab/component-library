'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons/icon';

export interface BadgeRemoveProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * The × inside a removable Badge. A client component (it takes `onClick`);
 * the Badge around it stays a Server Component.
 * Give it an `aria-label` that names what is removed: "Remove design".
 */
export const BadgeRemove = forwardRef<HTMLButtonElement, BadgeRemoveProps>(function BadgeRemove(
  { className, type, 'aria-label': ariaLabel = 'Remove', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type ?? 'button'} className={cn('ui-badge-remove', className)} aria-label={ariaLabel} {...props}>
      <Icon name="x" size={12} strokeWidth={2} />
    </button>
  );
});
