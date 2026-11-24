'use client';

import { forwardRef, useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { CheckGlyph, CrossGlyph, SpinnerGlyph } from '../../lib/glyphs';
import { useCrossfade } from '../../hooks/use-crossfade';
import { useMorphWidth } from '../../hooks/use-morph-width';
import { Button, type ButtonProps } from '../button/button';

export type ActionButtonState = 'idle' | 'pending' | 'success' | 'error';

export interface ActionButtonProps extends Omit<ButtonProps, 'loading' | 'asChild' | 'icon'> {
  /**
   * Runs on click. Return a promise: the button shows `pending` until it
   * settles, then `success` (resolved) or `error` (rejected).
   */
  onAction?: () => unknown | Promise<unknown>;
  /** Controlled state. Omit it to let `onAction` drive the button. */
  state?: ActionButtonState;
  /** Called on every state change, controlled or not. */
  onStateChange?: (state: ActionButtonState) => void;
  /** Label while pending. Default "Working…". */
  pendingLabel?: ReactNode;
  /** Label after success. Default "Done". */
  successLabel?: ReactNode;
  /** Label after a failure. Default "Failed". */
  errorLabel?: ReactNode;
  /** Milliseconds before success / error return to idle. Default 1600; 0 keeps the result. */
  resetAfter?: number;
  /** Icon before the idle label. */
  idleIcon?: ReactNode;
}

/**
 * ActionButton — a button whose label morphs through idle → pending →
 * success / error → idle. The width springs to the new label, the labels
 * crossfade with a 2px blur and the icon swaps. The button stays focusable
 * the whole time, and a polite live region announces each state.
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  {
    onAction,
    state: stateProp,
    onStateChange,
    pendingLabel = 'Working…',
    successLabel = 'Done',
    errorLabel = 'Failed',
    resetAfter = 1600,
    idleIcon,
    className,
    onClick,
    children,
    ...props
  },
  ref,
) {
  const [internal, setInternal] = useState<ActionButtonState>('idle');
  const state = stateProp ?? internal;
  const innerRef = useRef<HTMLButtonElement | null>(null);
  const composedRef = useComposedRefs(ref, innerRef);
  const mounted = useRef(true);
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const commit = useCallback((next: ActionButtonState) => {
    if (!mounted.current) return;
    setInternal(next);
    onStateChangeRef.current?.(next);
  }, []);

  // success / error return to idle after `resetAfter` (controlled or not)
  useEffect(() => {
    if (resetAfter <= 0 || (state !== 'success' && state !== 'error')) return;
    const t = window.setTimeout(() => commit('idle'), resetAfter);
    return () => window.clearTimeout(t);
  }, [state, resetAfter, commit]);

  const run = useCallback(async () => {
    commit('pending');
    try {
      await onAction?.();
      commit('success');
    } catch {
      commit('error');
    }
  }, [commit, onAction]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (state !== 'idle') {
      e.preventDefault();
      return;
    }
    onClick?.(e);
    if (e.defaultPrevented || !onAction) return;
    void run();
  };

  const content: ReactNode =
    state === 'pending' ? (
      <>
        <SpinnerGlyph />
        {pendingLabel}
      </>
    ) : state === 'success' ? (
      <>
        <CheckGlyph />
        {successLabel}
      </>
    ) : state === 'error' ? (
      <>
        <CrossGlyph />
        {errorLabel}
      </>
    ) : (
      <>
        {idleIcon}
        {children}
      </>
    );

  const { leaving, animate } = useCrossfade(state, content);
  useMorphWidth(innerRef, state);

  const announcement = state === 'pending' ? pendingLabel : state === 'success' ? successLabel : state === 'error' ? errorLabel : null;

  return (
    <>
      <Button
        {...props}
        ref={composedRef}
        className={cn('ui-action-btn', className)}
        data-state={state}
        aria-busy={state === 'pending' || undefined}
        onClick={handleClick}
      >
        {leaving && (
          <span key={`out-${leaving.key}`} className="ui-action-btn-layer ui-action-btn-leaving" aria-hidden="true">
            {leaving.node}
          </span>
        )}
        <span key={state} className="ui-action-btn-layer" data-enter={animate || undefined}>
          {content}
        </span>
      </Button>
      <span className="ui-action-btn-live" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </>
  );
});
