'use client';

import { forwardRef, type ReactNode } from 'react';
import { useCopy } from '../../hooks/use-copy';
import { Icon } from '../../icons/icon';
import { cn } from '../../lib/cn';
import { Button, type ButtonProps } from '../button';

export interface CopyButtonProps extends Omit<ButtonProps, 'value' | 'onCopy' | 'asChild' | 'loading' | 'children' | 'icon'> {
  /** The text to copy, or a function returning it at click time. */
  value: string | (() => string);
  /** Visible text ("Copy"). Leave it out for an icon-only button; then give it an `aria-label` (default "Copy"). */
  label?: ReactNode;
  /** Text shown after a successful copy. Default "Copied". */
  copiedLabel?: ReactNode;
  /** Text shown when copying fails. Default "Copy failed". */
  errorLabel?: ReactNode;
  /** How long the confirmation stays, in ms. Default 1500. */
  resetAfter?: number;
  /** Called with the copied text. */
  onCopy?: (text: string) => void;
  /** Called when the browser refuses to copy. */
  onCopyError?: () => void;
}

/**
 * CopyButton — copies a value and confirms it: the copy icon swaps to a check with a pop,
 * a polite live region says "Copied", and it reverts after 1.5s. Failures show an error state.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  {
    value,
    label,
    copiedLabel = 'Copied',
    errorLabel = 'Copy failed',
    resetAfter,
    onCopy,
    onCopyError,
    variant,
    size = 'sm',
    className,
    onClick,
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  const { copy, status } = useCopy({ resetAfter, onCopy, onError: onCopyError });
  const labelled = label != null;
  const announcement = status === 'copied' ? 'Copied' : status === 'error' ? 'Copy failed' : '';

  return (
    <>
      <Button
        ref={ref}
        variant={variant ?? (labelled ? 'outline' : 'ghost')}
        size={size}
        icon={!labelled}
        className={cn('ui-copy', className)}
        data-state={status}
        aria-label={labelled ? ariaLabel : (ariaLabel ?? 'Copy')}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          void copy(typeof value === 'function' ? value() : value);
        }}
        {...props}
      >
        <span className="ui-copy-icons" aria-hidden="true">
          <Icon name="copy" className="ui-copy-icon-idle" />
          <Icon name="check" strokeWidth={2.25} className="ui-copy-icon-done" />
          <Icon name="circle-alert" className="ui-copy-icon-error" />
        </span>
        {labelled && (
          <span className="ui-copy-label">
            <span className="ui-copy-text-idle">{label}</span>
            <span className="ui-copy-text-done" aria-hidden="true">
              {copiedLabel}
            </span>
            <span className="ui-copy-text-error" aria-hidden="true">
              {errorLabel}
            </span>
          </span>
        )}
      </Button>
      <span className="ui-copy-status" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
});
