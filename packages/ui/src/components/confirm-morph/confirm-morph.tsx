'use client';

import { forwardRef, useCallback, useEffect, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { CheckGlyph, CrossGlyph, SpinnerGlyph } from '../../lib/glyphs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useCrossfade } from '../../hooks/use-crossfade';
import { useMorphWidth } from '../../hooks/use-morph-width';
import { Button } from '../button/button';

export type ConfirmMorphPhase = 'idle' | 'confirm' | 'pending' | 'done' | 'error';
export type ConfirmMorphSize = 'md' | 'lg';

export interface ConfirmMorphProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onError'> {
  /** Label of the destructive button, e.g. "Delete 3 files". */
  label: ReactNode;
  /** Icon before the label. */
  icon?: ReactNode;
  /** The inline question, e.g. "Delete 3 files?". */
  question: ReactNode;
  /** Default "Delete". */
  confirmLabel?: ReactNode;
  /** Default "Cancel". */
  cancelLabel?: ReactNode;
  /** Shown while `onConfirm` runs. Default "Deleting…". */
  pendingLabel?: ReactNode;
  /** Shown after success, e.g. "3 files deleted". Default "Deleted". */
  resultLabel?: ReactNode;
  /** Shown when `onConfirm` rejects. Default "Couldn’t delete". */
  errorLabel?: ReactNode;
  /** Default "Undo". Only shown when `onUndo` is set. */
  undoLabel?: ReactNode;
  /** Default "Retry". */
  retryLabel?: ReactNode;
  /** Runs when the user confirms. May return a promise. */
  onConfirm: () => unknown | Promise<unknown>;
  /** Adds an Undo button to the result. */
  onUndo?: () => unknown | Promise<unknown>;
  /** Milliseconds the result (with Undo) stays before returning to idle. Default 6000; 0 keeps it. */
  undoWindow?: number;
  /** Controlled phase. */
  phase?: ConfirmMorphPhase;
  /** Initial phase when uncontrolled. Default `idle`. */
  defaultPhase?: ConfirmMorphPhase;
  onPhaseChange?: (phase: ConfirmMorphPhase) => void;
  /** Height: 36 / 44px. Default `md`. */
  size?: ConfirmMorphSize;
  disabled?: boolean;
}

const inert = (el: HTMLElement | null) => el?.setAttribute('inert', '');

/**
 * ConfirmMorph — a destructive button that turns, in place, into its own
 * confirmation ("Delete 3 files? Cancel / Delete"), then a spinner, then a
 * result with Undo. Nothing opens elsewhere: the same box changes width and
 * content. Esc cancels; focus follows the next sensible control.
 */
export const ConfirmMorph = forwardRef<HTMLDivElement, ConfirmMorphProps>(function ConfirmMorph(
  {
    label,
    icon,
    question,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    pendingLabel = 'Deleting…',
    resultLabel = 'Deleted',
    errorLabel = 'Couldn’t delete',
    undoLabel = 'Undo',
    retryLabel = 'Retry',
    onConfirm,
    onUndo,
    undoWindow = 6000,
    phase: phaseProp,
    defaultPhase = 'idle',
    onPhaseChange,
    size = 'md',
    disabled,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const [phase, setPhase] = useControllableState<ConfirmMorphPhase>({
    value: phaseProp,
    defaultValue: defaultPhase,
    onChange: onPhaseChange,
  });
  const shellRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, shellRef);
  const wantFocus = useRef(false);
  const mounted = useRef(true);
  const innerSize = size === 'lg' ? 'md' : 'xs';

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const ask = () => {
    wantFocus.current = true;
    setPhase('confirm');
  };
  const cancel = () => {
    wantFocus.current = true;
    setPhase('idle');
  };
  const confirm = async () => {
    wantFocus.current = true;
    setPhase('pending');
    try {
      await onConfirm();
      if (mounted.current) setPhase('done');
    } catch {
      if (mounted.current) setPhase('error');
    }
  };
  const undo = async () => {
    wantFocus.current = true;
    try {
      await onUndo?.();
    } catch {
      /* the result is dismissed either way */
    }
    if (mounted.current) setPhase('idle');
  };

  // The result goes away on its own
  useEffect(() => {
    if (phase !== 'done') return;
    const ms = onUndo ? undoWindow : 1600;
    if (ms <= 0) return;
    const t = window.setTimeout(() => setPhase('idle'), ms);
    return () => window.clearTimeout(t);
  }, [phase, onUndo, undoWindow, setPhase]);

  // Focus follows the interaction: Cancel when asking, the trigger when done, Undo / Retry on a result
  useEffect(() => {
    if (!wantFocus.current) return;
    const shell = shellRef.current;
    if (!shell) return;
    const active = document.activeElement;
    if (active && active !== document.body && !shell.contains(active)) {
      wantFocus.current = false;
      return;
    }
    const target =
      shell.querySelector<HTMLElement>(`.ui-confirm-current [data-confirm-focus="${phase}"]`) ??
      (phase === 'pending' || phase === 'done' ? shell : null);
    target?.focus({ preventScroll: true });
    if (phase === 'idle') wantFocus.current = false;
  }, [phase]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || e.key !== 'Escape') return;
      if (phase === 'confirm' || phase === 'error') {
        e.preventDefault();
        e.stopPropagation();
        wantFocus.current = true;
        setPhase('idle');
      }
    },
    [onKeyDown, phase, setPhase],
  );

  let content: ReactNode;
  if (phase === 'confirm') {
    content = (
      <span className="ui-confirm-row" role="group" aria-label={typeof question === 'string' ? question : undefined}>
        <span className="ui-confirm-text">{question}</span>
        <Button size={innerSize} variant="ghost" data-confirm-focus="confirm" onClick={cancel}>
          {cancelLabel}
        </Button>
        <Button size={innerSize} variant="destructive" onClick={confirm}>
          {confirmLabel}
        </Button>
      </span>
    );
  } else if (phase === 'pending') {
    content = (
      <span className="ui-confirm-row ui-confirm-status">
        <SpinnerGlyph />
        <span className="ui-confirm-text">{pendingLabel}</span>
      </span>
    );
  } else if (phase === 'done') {
    content = (
      <span className={cn('ui-confirm-row', !onUndo && 'ui-confirm-status')}>
        <CheckGlyph className="ui-confirm-ok" />
        <span className="ui-confirm-text">{resultLabel}</span>
        {onUndo && (
          <Button size={innerSize} variant="ghost" data-confirm-focus="done" onClick={undo}>
            {undoLabel}
          </Button>
        )}
      </span>
    );
  } else if (phase === 'error') {
    content = (
      <span className="ui-confirm-row">
        <CrossGlyph className="ui-confirm-bad" />
        <span className="ui-confirm-text">{errorLabel}</span>
        <Button size={innerSize} variant="ghost" onClick={cancel}>
          {cancelLabel}
        </Button>
        <Button size={innerSize} variant="destructive" data-confirm-focus="error" onClick={confirm}>
          {retryLabel}
        </Button>
      </span>
    );
  } else {
    content = (
      <button type="button" className="ui-confirm-trigger" data-confirm-focus="idle" disabled={disabled} onClick={ask}>
        {icon}
        {label}
      </button>
    );
  }

  const { leaving, animate } = useCrossfade(phase, content);
  useMorphWidth(shellRef, phase);

  const announcement =
    phase === 'confirm' ? question : phase === 'pending' ? pendingLabel : phase === 'done' ? resultLabel : phase === 'error' ? errorLabel : null;

  return (
    <div
      {...props}
      ref={composedRef}
      tabIndex={-1}
      className={cn('ui-confirm', size !== 'md' && `ui-confirm-${size}`, className)}
      data-phase={phase}
      onKeyDown={handleKeyDown}
    >
      {leaving && (
        <span key={`out-${leaving.key}`} ref={inert} className="ui-confirm-layer ui-confirm-leaving" aria-hidden="true">
          {leaving.node}
        </span>
      )}
      <span key={phase} className="ui-confirm-layer ui-confirm-current" data-enter={animate || undefined}>
        {content}
      </span>
      <span className="ui-confirm-live" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
});
