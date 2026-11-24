'use client';

import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { useControllableState } from '../../hooks/use-controllable-state';
import { usePresence } from '../../hooks/use-presence';
import { Icon } from '../../icons/icon';

export type AnnouncementBarVariant = 'neutral' | 'primary' | 'gradient-subtle';

export interface AnnouncementBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Surface: `neutral` (muted well), `primary` (brand fill) or `gradient-subtle` (soft two-tone wash). Default `neutral`. */
  variant?: AnnouncementBarVariant;
  /** Controlled visibility. */
  open?: boolean;
  /** Initial visibility when uncontrolled. Default true. */
  defaultOpen?: boolean;
  /** Called when visibility changes (the × button sets it to false). */
  onOpenChange?: (open: boolean) => void;
  /** Show the × button. Default true. */
  dismissible?: boolean;
  /** Accessible name of the × button. Default `Dismiss announcement`. */
  dismissLabel?: string;
  /**
   * Remember the dismissal in localStorage under this key. Change the key for a
   * new announcement. Read after hydration, so the server always renders the bar.
   */
  storageKey?: string;
  /** Leading icon, or a short pill such as "New" (see `AnnouncementBarBadge`). */
  icon?: ReactNode;
  /** A link or button after the message (see `AnnouncementBarLink`). */
  action?: ReactNode;
  /** Name of the region landmark. Default `Announcement`. */
  'aria-label'?: string;
}

const readDismissed = (key: string) => {
  try {
    return window.localStorage.getItem(key) === 'dismissed';
  } catch {
    return false; // storage blocked (private mode, sandboxed iframe)
  }
};

const writeDismissed = (key: string) => {
  try {
    window.localStorage.setItem(key, 'dismissed');
  } catch {
    /* storage blocked: the bar still closes for this page view */
  }
};

/**
 * AnnouncementBar — a dismissible strip at the top of a page or app for news,
 * a launch or a maintenance window. Dismissing collapses its height so the
 * page below glides up, then unmounts it. With `storageKey` the dismissal is
 * remembered across visits (SSR-safe: read after hydration).
 */
export const AnnouncementBar = forwardRef<HTMLDivElement, AnnouncementBarProps>(function AnnouncementBar(
  {
    variant = 'neutral',
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    dismissible = true,
    dismissLabel = 'Dismiss announcement',
    storageKey,
    icon,
    action,
    className,
    children,
    'aria-label': ariaLabel = 'Announcement',
    ...props
  },
  ref,
) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  // Hidden from storage on load: unmount at once, no exit animation
  const [restored, setRestored] = useState(false);
  // Opening after the first render animates; the initial render never does.
  // Derived during render, so the attribute lands in the same commit as the open state.
  const [prevOpen, setPrevOpen] = useState(open);
  const [animateOpen, setAnimateOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setAnimateOpen(open);
    if (open) setRestored(false);
  }

  useEffect(() => {
    if (!storageKey) return;
    if (readDismissed(storageKey)) {
      setRestored(true);
      setOpen(false);
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue === 'dismissed') setOpen(false);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey, setOpen]);

  const { mounted, state, ref: presenceRef } = usePresence<HTMLDivElement>(open);
  if (!mounted || (!open && restored)) return null;

  const dismiss = () => {
    if (storageKey) writeDismissed(storageKey);
    setOpen(false);
  };

  return (
    // The wrapper animates its height to zero so the page below glides up instead of jumping
    <div
      ref={presenceRef}
      className="ui-announcement-bar-collapse"
      data-state={state}
      data-animate={animateOpen ? '' : undefined}
    >
      <div className="ui-announcement-bar-collapse-inner">
        <div
          ref={ref}
          role="region"
          aria-label={ariaLabel}
          data-variant={variant}
          data-dismissible={dismissible ? '' : undefined}
          className={cn('ui-announcement-bar', className)}
          {...props}
        >
          <div className="ui-announcement-bar-content">
            {icon != null && icon !== false && <span className="ui-announcement-bar-icon">{icon}</span>}
            <p className="ui-announcement-bar-message">{children}</p>
            {action}
          </div>
          {dismissible && (
            <button type="button" className="ui-announcement-bar-close" aria-label={dismissLabel} onClick={dismiss}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export interface AnnouncementBarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render the child (e.g. a Next.js `<Link>` or a `<button>`) with the link styles. */
  asChild?: boolean;
  /** Show the trailing arrow. Default true. */
  arrow?: boolean;
}

/** The call to action inside the bar: underlined, with an arrow that nudges on hover. */
export const AnnouncementBarLink = forwardRef<HTMLAnchorElement, AnnouncementBarLinkProps>(function AnnouncementBarLink(
  { asChild = false, arrow = true, className, children, ...props },
  ref,
) {
  const inner = (label: ReactNode) => (
    <>
      <span className="ui-announcement-bar-link-label">{label}</span>
      {arrow && <Icon name="arrow-right" size={14} className="ui-announcement-bar-link-arrow" />}
    </>
  );
  if (asChild) {
    // Keep the label + arrow structure inside the consumer's element
    const child = isValidElement<{ children?: ReactNode }>(children)
      ? cloneElement(children, undefined, inner(children.props.children))
      : children;
    return (
      <Slot ref={ref} className={cn('ui-announcement-bar-link', className)} {...(props as HTMLAttributes<HTMLElement>)}>
        {child}
      </Slot>
    );
  }
  return (
    <a ref={ref} className={cn('ui-announcement-bar-link', className)} {...props}>
      {inner(children)}
    </a>
  );
});

/** A short pill before the message ("New", "Beta"). */
export const AnnouncementBarBadge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function AnnouncementBarBadge(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn('ui-announcement-bar-badge', className)} {...props} />;
});
