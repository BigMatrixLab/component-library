'use client';

import { forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { Icon } from '../../icons/icon';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { useResizableContext, type DragSession, type HandleInfo } from './use-resizable-group';

const STEP = 5;

export interface ResizableHandleProps extends HTMLAttributes<HTMLDivElement> {
  /** Show a small grip so the divider is easy to find and hit. Default `false`. */
  withHandle?: boolean;
  /** Accessible name. Default "Resize panels". */
  'aria-label'?: string;
}

/**
 * The divider between two `ResizablePanel`s (it must sit directly between them). A WAI-ARIA window
 * splitter: drag it, or focus it and use the arrow keys (±5%), Home / End (to the limits) and Enter
 * (collapse or restore a collapsible neighbour).
 */
export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(function ResizableHandle(
  { withHandle = false, className, onKeyDown, 'aria-label': label = 'Resize panels', children, ...props },
  ref,
) {
  const api = useResizableContext('ResizableHandle');
  const elRef = useRef<HTMLDivElement>(null);
  const setRef = useComposedRefs(ref, elRef);
  const drag = useRef<{ pointerId: number; start: number; session: DragSession; prev: string; next: string } | null>(null);
  const [info, setInfo] = useState<(HandleInfo & { controls: string }) | null>(null);
  const horizontal = api.direction === 'horizontal';

  /** Ids of the panels on either side, read from the DOM so panels can be wrapped or reordered. */
  const neighbours = (): [string, string] | null => {
    const el = elRef.current;
    const prev = el?.previousElementSibling?.getAttribute('data-panel-id');
    const next = el?.nextElementSibling?.getAttribute('data-panel-id');
    return prev && next ? [prev, next] : null;
  };

  // Keep aria-valuenow / min / max in step with the layout
  useIsomorphicLayoutEffect(() => {
    const nb = neighbours();
    const d = nb ? api.describe(nb[0], nb[1]) : null;
    setInfo((old) => {
      if (!nb || !d) return old === null ? old : null;
      if (old && old.now === d.now && old.min === d.min && old.max === d.max && old.controls === nb[0]) return old;
      return { ...d, controls: nb[0] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    const nb = neighbours();
    if (!nb) return;
    const session = api.beginDrag(nb[0], nb[1]);
    if (!session) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    drag.current = { pointerId: e.pointerId, start: horizontal ? e.clientX : e.clientY, session, prev: nb[0], next: nb[1] };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId || d.session.pixels <= 0) return;
    const delta = ((horizontal ? e.clientX : e.clientY) - d.start) / d.session.pixels;
    api.dragTo(d.session, delta * 100);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== e.pointerId) return;
    drag.current = null;
    api.endDrag();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const nb = neighbours();
    if (!nb) return;
    const less = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const more = horizontal ? 'ArrowRight' : 'ArrowDown';
    if (e.key === less) api.nudge(nb[0], nb[1], -STEP);
    else if (e.key === more) api.nudge(nb[0], nb[1], STEP);
    else if (e.key === 'Home') api.moveToEdge(nb[0], nb[1], 'start');
    else if (e.key === 'End') api.moveToEdge(nb[0], nb[1], 'end');
    else if (e.key === 'Enter') api.toggleCollapse(nb[0], nb[1]);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={setRef}
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={horizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={info?.now ?? 50}
      aria-valuemin={info?.min ?? 0}
      aria-valuemax={info?.max ?? 100}
      aria-controls={info?.controls}
      className={cn('ui-resizable-handle', className)}
      data-direction={api.direction}
      data-dragging={api.dragging || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {withHandle && (
        <span className="ui-resizable-grip" aria-hidden="true">
          <Icon name="grip-vertical" size={12} />
        </span>
      )}
      {children}
    </div>
  );
});
