'use client';

import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { usePresence } from '../../hooks/use-presence';
import { Icon } from '../../icons/icon';
import { Alert, type AlertProps } from './alert';

export interface DismissibleAlertProps extends AlertProps {
  /** Controlled visibility. */
  open?: boolean;
  /** Initial visibility when uncontrolled. Default true. */
  defaultOpen?: boolean;
  /** Called when visibility changes (the × button sets it to false). */
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the × button. Default `Dismiss`. */
  dismissLabel?: string;
}

/**
 * DismissibleAlert — an Alert with a × button. It collapses away with a short
 * exit animation, then unmounts. A client component; plain `Alert` stays server-safe.
 */
export const DismissibleAlert = forwardRef<HTMLDivElement, DismissibleAlertProps>(function DismissibleAlert(
  { open: openProp, defaultOpen = true, onOpenChange, dismissLabel = 'Dismiss', className, ...props },
  forwardedRef,
) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const { mounted, state, ref: presenceRef } = usePresence<HTMLDivElement>(open);
  if (!mounted) return null;
  return (
    // The wrapper animates its height to zero so the content below glides up instead of jumping.
    <div ref={presenceRef} className="ui-alert-collapse" data-state={state}>
      <div className="ui-alert-collapse-inner">
        <Alert
          ref={forwardedRef}
          className={cn(className)}
          close={
            <button type="button" className="ui-alert-close" aria-label={dismissLabel} onClick={() => setOpen(false)}>
              <Icon name="x" size={14} />
            </button>
          }
          {...props}
        />
      </div>
    </div>
  );
});
