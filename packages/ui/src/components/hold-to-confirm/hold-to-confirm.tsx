'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { prefersReducedMotion } from '../../lib/dom';
import { animateSafe } from '../../lib/spring';
import { CheckGlyph } from '../../lib/glyphs';
import { useCrossfade } from '../../hooks/use-crossfade';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { useMorphWidth } from '../../hooks/use-morph-width';
import { Button, type ButtonProps } from '../button/button';

export type HoldToConfirmState = 'idle' | 'holding' | 'done';

export interface HoldToConfirmProps
  extends Omit<ButtonProps, 'loading' | 'asChild' | 'icon' | 'onClick' | 'onPointerDown'> {
  /** Called once the hold completes. */
  onConfirm: () => void;
  /** Milliseconds the user must hold. Default 1200. */
  duration?: number;
  /** Label after the hold completes. Default "Deleted". */
  doneLabel?: ReactNode;
  /** Icon before the label. */
  leadingIcon?: ReactNode;
  /** Text read by assistive tech as the button's description. Defaults to "Press and hold for 1.2 seconds to confirm." */
  description?: string;
  /** Milliseconds before the button returns to idle after completing. Default 1600; 0 keeps it done. */
  resetAfter?: number;
  /** The hold started. */
  onHoldStart?: () => void;
  /** The hold was released early. */
  onHoldCancel?: () => void;
}

const EMPTY = 'inset(0 100% 0 0)';
const FULL = 'inset(0 0 0 0)';
const HOLD_KEYS = new Set([' ', 'Enter']);

function defaultDescription(duration: number) {
  const seconds = Math.round(duration / 100) / 10;
  return `Press and hold for ${seconds} seconds to confirm. Release early to cancel.`;
}

/**
 * HoldToConfirm — press and hold (pointer, or Space / Enter) to confirm a
 * destructive action. A fill sweeps across while you hold, drains back if you
 * let go early, and a check pops when it completes. A plain click never
 * confirms.
 */
export const HoldToConfirm = forwardRef<HTMLButtonElement, HoldToConfirmProps>(function HoldToConfirm(
  {
    onConfirm,
    duration = 1200,
    doneLabel = 'Deleted',
    leadingIcon,
    description,
    resetAfter = 1600,
    onHoldStart,
    onHoldCancel,
    variant = 'outline',
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  const [state, setState] = useState<HoldToConfirmState>('idle');
  const innerRef = useRef<HTMLButtonElement | null>(null);
  const composedRef = useComposedRefs(ref, innerRef);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const animation = useRef<Animation | null>(null);
  const fallbackTimer = useRef(0);
  const resetTimer = useRef(0);
  const holding = useRef(false);
  const stateRef = useRef<HoldToConfirmState>('idle');
  stateRef.current = state;
  const lastKeyAt = useRef(0);
  const callbacks = useRef({ onConfirm, onHoldStart, onHoldCancel });
  callbacks.current = { onConfirm, onHoldStart, onHoldCancel };
  const descId = useId();

  useEffect(
    () => () => {
      window.clearTimeout(fallbackTimer.current);
      window.clearTimeout(resetTimer.current);
      animation.current?.cancel();
    },
    [],
  );

  // Once "done" is rendered, the CSS holds the full fill; release the animation
  useIsomorphicLayoutEffect(() => {
    if (state !== 'done') return;
    animation.current?.cancel();
    animation.current = null;
  }, [state]);

  /** Drain the fill from `progress` (0–1) back to empty. */
  const drain = useCallback((progress: number) => {
    const fill = fillRef.current;
    if (!fill || progress <= 0.01 || prefersReducedMotion()) return;
    animateSafe(
      fill,
      [{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }, { clipPath: EMPTY }],
      { duration: 160 + 260 * progress, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, []);

  const complete = useCallback(() => {
    if (!holding.current) return;
    holding.current = false;
    window.clearTimeout(fallbackTimer.current);
    setState('done');
    callbacks.current.onConfirm();
    if (resetAfter > 0) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => {
        drain(1);
        setState('idle');
      }, resetAfter);
    }
  }, [resetAfter, drain]);

  const start = useCallback(() => {
    if (disabled || holding.current || stateRef.current !== 'idle') return;
    const fill = fillRef.current;
    if (!fill) return;
    holding.current = true;
    setState('holding');
    callbacks.current.onHoldStart?.();
    const anim = animateSafe(fill, [{ clipPath: EMPTY }, { clipPath: FULL }], {
      duration,
      easing: 'linear',
      fill: 'forwards',
    });
    if (!anim) {
      fallbackTimer.current = window.setTimeout(complete, duration);
      return;
    }
    animation.current = anim;
    anim.onfinish = () => complete();
  }, [disabled, duration, complete]);

  const release = useCallback(() => {
    if (!holding.current) return;
    holding.current = false;
    window.clearTimeout(fallbackTimer.current);
    const anim = animation.current;
    animation.current = null;
    let progress = 0;
    if (anim) {
      anim.onfinish = null;
      progress = Math.min(1, Number(anim.currentTime ?? 0) / duration);
      anim.cancel();
    }
    setState('idle');
    callbacks.current.onHoldCancel?.();
    drain(progress);
  }, [duration, drain]);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    start();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
  };
  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!holding.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) release();
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!HOLD_KEYS.has(e.key)) return;
    e.preventDefault();
    lastKeyAt.current = Date.now();
    if (!e.repeat) start();
  };
  const handleKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!HOLD_KEYS.has(e.key)) return;
    e.preventDefault();
    lastKeyAt.current = Date.now();
    release();
  };
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // A click with no pointer and no key (screen-reader "activate") counts as a full hold
    if (e.detail === 0 && Date.now() - lastKeyAt.current > 500) start();
  };

  const phase = state === 'done' ? 'done' : 'idle';
  const content: ReactNode =
    phase === 'done' ? (
      <>
        <CheckGlyph />
        {doneLabel}
      </>
    ) : (
      <>
        {leadingIcon}
        {children}
      </>
    );
  const { leaving, animate } = useCrossfade(phase, content);
  useMorphWidth(innerRef, phase);

  const describedBy = [props['aria-describedby'], descId].filter(Boolean).join(' ');

  return (
    <>
      <Button
        {...props}
        ref={composedRef}
        variant={variant}
        disabled={disabled}
        className={cn('ui-hold', className)}
        data-state={state}
        aria-describedby={describedBy}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={(e) => {
          release();
          props.onBlur?.(e);
        }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={handleClick}
      >
        {leaving && (
          <span key={`out-${leaving.key}`} className="ui-hold-layer ui-hold-leaving" aria-hidden="true">
            {leaving.node}
          </span>
        )}
        <span key={phase} className="ui-hold-layer" data-enter={animate || undefined}>
          {content}
        </span>
        <span ref={fillRef} className="ui-hold-fill" aria-hidden="true">
          <span key={`fill-${phase}`} className="ui-hold-layer" data-enter={animate || undefined}>
            {content}
          </span>
        </span>
      </Button>
      <span id={descId} className="ui-hold-sr">
        {description ?? defaultDescription(duration)}
      </span>
      <span className="ui-hold-sr" role="status" aria-live="polite" aria-atomic="true">
        {state === 'done' ? doneLabel : null}
      </span>
    </>
  );
});
