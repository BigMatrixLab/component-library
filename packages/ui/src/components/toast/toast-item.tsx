'use client';

import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { animationsFinished } from '../../lib/dom';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { Icon, type IconName } from '../../icons/icon';
import { dismissToast, removeToast } from './store';
import type { ToastButton, ToastRecord, ToastType } from './types';
import { useSwipe, type SwipeDirection } from './use-swipe';

const TYPE_ICON: Partial<Record<ToastType, IconName>> = {
  success: 'circle-check',
  error: 'circle-x',
  warning: 'triangle-alert',
  info: 'info',
};

export interface ToastItemProps {
  toast: ToastRecord;
  /** 0 is the newest, in front. */
  index: number;
  /** Total live toasts, for z-order. */
  count: number;
  /** Measured height (px); undefined before the first measurement. */
  height: number | undefined;
  /** Height of the front toast (px) — stacked toasts shrink to it. */
  frontHeight: number;
  /** Distance (px) from the anchored edge when the list is expanded. */
  offset: number;
  expanded: boolean;
  /** Within `visibleToasts`. */
  visible: boolean;
  visibleToasts: number;
  /** Timers stop while true (hover, focus, hidden tab, finger down). */
  paused: boolean;
  duration: number;
  closeButton: boolean;
  directions: SwipeDirection[];
  onHeight: (id: ToastRecord['id'], height: number) => void;
}

/** One toast: the stacking slot, the card, its timer, swipe and exit. */
export function ToastItem({
  toast: t,
  index,
  count,
  height,
  frontHeight,
  offset,
  expanded,
  visible,
  visibleToasts,
  paused,
  duration: defaultDuration,
  closeButton,
  directions,
  onHeight,
}: ToastItemProps) {
  const slotRef = useRef<HTMLLIElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dismissible = t.dismissible !== false;
  const duration = t.duration ?? (t.type === 'loading' ? Infinity : defaultDuration);

  // Toasts past `visibleToasts` are invisible, so they must not take focus either.
  useEffect(() => {
    slotRef.current?.toggleAttribute('inert', !visible);
  }, [visible]);

  /* Measure the content (not the slot, which is forced to the front height when stacked). */
  useIsomorphicLayoutEffect(() => {
    const inner = innerRef.current;
    const card = cardRef.current;
    if (!inner || !card) return;
    const measure = () => {
      const border = card.offsetHeight - card.clientHeight;
      onHeight(t.id, inner.offsetHeight + border);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [t.id, onHeight]);

  /* Timer: pauses and resumes with the time left; any update restarts it. */
  const remaining = useRef(duration);
  useEffect(() => {
    remaining.current = duration;
  }, [t.version, t.type, duration]);
  useEffect(() => {
    if (t.dismissed || paused || !Number.isFinite(duration)) return;
    const started = Date.now();
    const timer = setTimeout(() => {
      t.onAutoClose?.(t);
      dismissToast(t.id);
    }, Math.max(0, remaining.current));
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, t.dismissed, t.version, t.type, duration]);

  /* After the exit animation, drop it from the store. */
  useEffect(() => {
    if (!t.dismissed) return;
    let cancelled = false;
    const done = () => {
      if (!cancelled) removeToast(t.id);
    };
    const fallback = setTimeout(done, 700);
    animationsFinished(slotRef.current).then(done);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [t.dismissed, t.id]);

  const { swiping, swipedOut, handlers } = useSwipe(toastRef, {
    enabled: dismissible && !t.dismissed,
    directions,
    onDismiss: () => dismissToast(t.id),
  });

  /* Behind the front toast and not expanded: shrink to the front's height, hide the content. */
  const behind = !expanded && index > 0;
  const stackIndex = Math.min(index, Math.max(visibleToasts, 1) - 1); // hidden toasts park behind the last visible one
  const style = {
    '--ui-toast-index': stackIndex,
    '--ui-toast-z': count - index,
    '--ui-toast-offset': `${offset}px`,
    '--ui-toast-front': `${frontHeight}px`,
    ...(height !== undefined && { '--ui-toast-height': `${height}px` }),
  } as CSSProperties;

  // Content swaps (loading -> success) fade in, but not on first paint.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);

  const assertive = t.type === 'error' || t.important === true;
  const icon = renderIcon(t);

  return (
    <li
      ref={slotRef}
      className="ui-toast-slot"
      data-toast-id={String(t.id)}
      data-index={index}
      data-front={index === 0}
      data-visible={visible}
      data-expanded={expanded}
      data-behind={behind}
      data-removed={t.dismissed}
      style={style}
    >
      <div
        ref={toastRef}
        className={cn('ui-toast', t.className)}
        data-type={t.type}
        data-swiping={swiping}
        data-swipe-out={swipedOut}
        role={assertive ? 'alert' : undefined}
        aria-live={assertive ? 'assertive' : undefined}
        aria-atomic="true"
        {...handlers}
      >
        <div ref={cardRef} className="ui-toast-card">
          <div ref={innerRef} className="ui-toast-inner">
            {icon}
            <div key={`content-${t.type}`} className={cn('ui-toast-content', mounted.current && 'ui-toast-swap')}>
              <div className="ui-toast-title">{t.title}</div>
              {t.description != null && t.description !== false && <div className="ui-toast-description">{t.description}</div>}
            </div>
            {(t.cancel || t.action) && (
              <div className="ui-toast-actions">
                {t.cancel && <ToastButtonView button={t.cancel} id={t.id} cancel />}
                {t.action && <ToastButtonView button={t.action} id={t.id} />}
              </div>
            )}
          </div>
        </div>
        {dismissible && (t.closeButton ?? closeButton) && (
          <button type="button" className="ui-toast-close" aria-label="Close notification" onClick={() => dismissToast(t.id)}>
            <Icon name="x" size={12} strokeWidth={2} />
          </button>
        )}
      </div>
    </li>
  );
}

function renderIcon(t: ToastRecord): ReactNode {
  if (t.icon === false) return null;
  let content: ReactNode = t.icon;
  if (content == null) {
    if (t.type === 'loading') content = <span className="ui-toast-spinner" role="presentation" />;
    else if (TYPE_ICON[t.type]) content = <Icon name={TYPE_ICON[t.type]!} size={18} />;
  }
  if (content == null) return null;
  // Keyed by type so a promise toast's icon morphs when its state changes.
  return (
    <span key={t.icon ? 'custom' : t.type} className="ui-toast-icon" aria-hidden="true">
      {content}
    </span>
  );
}

function ToastButtonView({ button, id, cancel }: { button: ToastButton; id: ToastRecord['id']; cancel?: boolean }) {
  return (
    <button
      type="button"
      className={cn('ui-toast-btn', cancel && 'ui-toast-btn-cancel')}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        button.onClick?.(e);
        if (!e.defaultPrevented) dismissToast(id);
      }}
    >
      {button.label}
    </button>
  );
}
