'use client';

import { useCallback, useRef, type PointerEvent, type RefObject } from 'react';

export type DragSide = 'top' | 'right' | 'bottom' | 'left';

const AXIS: Record<DragSide, { axis: 'x' | 'y'; sign: 1 | -1 }> = {
  bottom: { axis: 'y', sign: 1 },
  top: { axis: 'y', sign: -1 },
  right: { axis: 'x', sign: 1 },
  left: { axis: 'x', sign: -1 },
};

export interface UseDragDismissOptions {
  /** The edge the panel is docked to; dragging toward it dismisses. */
  side: DragSide;
  enabled?: boolean;
  /** The panel that follows the pointer. */
  panelRef: RefObject<HTMLElement | null>;
  /** Layer that gets `data-dragging` and `--ui-sheet-progress` (0–1) while dragging. */
  layerRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
  /** Fraction of the panel size that dismisses on release. Default .35. */
  threshold?: number;
  /** Release velocity (px/ms) that dismisses regardless of distance. Default .6. */
  velocity?: number;
}

/**
 * Drag a panel toward its edge to dismiss it (pointer events, so mouse, touch
 * and pen all work). Release past the threshold or with a quick flick and
 * `onDismiss` fires, leaving the panel where it is so the close animation
 * continues from there; otherwise the panel springs back. Spread the returned
 * handlers on the drag surface (it needs `touch-action: none`).
 */
export function useDragDismiss({
  side,
  enabled = true,
  panelRef,
  layerRef,
  onDismiss,
  threshold = 0.35,
  velocity = 0.6,
}: UseDragDismissOptions) {
  const cb = useRef(onDismiss);
  cb.current = onDismiss;
  const drag = useRef<{ id: number; start: number; size: number; samples: { t: number; v: number }[] } | null>(null);
  const { axis, sign } = AXIS[side];

  const set = (offset: number, size: number) => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.transform = offset ? (axis === 'y' ? `translateY(${sign * offset}px)` : `translateX(${sign * offset}px)`) : '';
    layerRef.current?.style.setProperty('--ui-sheet-progress', String(Math.min(1, offset / size)));
  };

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || e.button > 0 || !panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const start = axis === 'y' ? e.clientY : e.clientX;
      drag.current = { id: e.pointerId, start, size: axis === 'y' ? rect.height : rect.width, samples: [{ t: e.timeStamp, v: start }] };
      e.currentTarget.setPointerCapture(e.pointerId);
      layerRef.current?.setAttribute('data-dragging', '');
    },
    [enabled, axis, panelRef, layerRef],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const pos = axis === 'y' ? e.clientY : e.clientX;
      d.samples.push({ t: e.timeStamp, v: pos });
      if (d.samples.length > 8) d.samples.shift();
      const delta = (pos - d.start) * sign;
      // Dragging away from the edge does nothing: the panel never leaves its resting place that way
      set(delta > 0 ? delta : 0, d.size);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [axis, sign],
  );

  const end = useCallback(
    (e: PointerEvent<HTMLElement>, cancelled: boolean) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      const layer = layerRef.current;
      layer?.removeAttribute('data-dragging');
      const pos = axis === 'y' ? e.clientY : e.clientX;
      const offset = Math.max(0, (pos - d.start) * sign);
      // Velocity over the last ~100ms of movement
      const last = d.samples[d.samples.length - 1]!;
      const first = d.samples.find((s) => last.t - s.t <= 100) ?? last;
      const v = last.t > first.t ? ((last.v - first.v) * sign) / (last.t - first.t) : 0;
      if (!cancelled && offset > 8 && (offset > d.size * threshold || v > velocity)) {
        cb.current();
        // Controlled sheet that stays open: spring back instead of hanging half-way
        setTimeout(() => {
          if (layerRef.current?.getAttribute('data-state') === 'open') set(0, d.size);
        }, 80);
      } else {
        set(0, d.size);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [axis, sign, threshold, velocity, layerRef],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: (e: PointerEvent<HTMLElement>) => end(e, false),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => end(e, true),
  };
}
