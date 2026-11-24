import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../icons/icon';

export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'destructive';

const VARIANT_ICON: Record<AlertVariant, IconName | null> = {
  default: null,
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  destructive: 'circle-alert',
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Meaning and colour. Default `default` (neutral, no icon). */
  variant?: AlertVariant;
  /** Full-width strip with square corners and no side borders, for the top of a page or section. */
  banner?: boolean;
  /** Replace the icon, or pass `false` for none. Each variant has its own built-in icon. */
  icon?: ReactNode | false;
  /** Rendered after the body, e.g. a dismiss button. Used by `DismissibleAlert`. */
  close?: ReactNode;
}

/**
 * Alert — a persistent message inside the page. Server Component–safe.
 *
 * No role by default: it is page content, read in order. Add `role="alert"`
 * only for something urgent that appears *because of* what the user just did
 * (a failed save, a payment declined); screen readers interrupt for it.
 * Use `role="status"` for a polite update that appears after load.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = 'default', banner = false, icon, close, className, children, ...props },
  ref,
) {
  const name = VARIANT_ICON[variant];
  const glyph = icon === false ? null : icon ?? (name ? <Icon name={name} size={18} /> : null);
  return (
    <div
      ref={ref}
      data-variant={variant}
      className={cn('ui-alert', variant !== 'default' && `ui-alert-${variant}`, banner && 'ui-alert-banner', className)}
      {...props}
    >
      {glyph != null && (
        <span className="ui-alert-icon" aria-hidden="true">
          {glyph}
        </span>
      )}
      <div className="ui-alert-body">{children}</div>
      {close}
    </div>
  );
});

export const AlertTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AlertTitle(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-alert-title', className)} {...props} />;
});

export const AlertDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AlertDescription(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-alert-description', className)} {...props} />;
});

/** Row for buttons or links under the text. */
export const AlertActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AlertActions(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-alert-actions', className)} {...props} />;
});
