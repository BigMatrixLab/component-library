'use client';

import { forwardRef, useEffect, useId, useRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { isCollapsed } from './layout';
import { ResizableContext, useResizableContext, useResizableGroup, type PanelInfo, type ResizableDirection } from './use-resizable-group';

export interface ResizablePanelGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `horizontal`: panels side by side. `vertical`: stacked. Default `horizontal`. */
  direction?: ResizableDirection;
  /**
   * Saves the layout in `localStorage` under this id (when set) and restores it on the next visit.
   * Unset: nothing is stored. Storage errors are ignored. Give the group a size (a height at least).
   */
  id?: string;
  /** Called with every panel's size in % (in document order) when a drag or key press ends. */
  onLayout?: (sizes: number[]) => void;
}

/**
 * ResizablePanelGroup — panels separated by draggable, keyboard-operable dividers.
 * Compose: ResizablePanel, ResizableHandle, ResizablePanel… (handles sit between two panels).
 * Sizes are percentages of the group; the group fills its parent, so give it a height.
 */
export const ResizablePanelGroup = forwardRef<HTMLDivElement, ResizablePanelGroupProps>(function ResizablePanelGroup(
  { direction = 'horizontal', id, onLayout, className, ...props },
  ref,
) {
  const api = useResizableGroup({ direction, id, onLayout });
  return (
    <ResizableContext.Provider value={api}>
      <div
        ref={ref}
        id={id}
        role="group"
        className={cn('ui-resizable-group', className)}
        data-direction={direction}
        data-dragging={api.dragging || undefined}
        data-snapping={api.snapping || undefined}
        {...props}
      />
    </ResizableContext.Provider>
  );
});

export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Starting size in % of the group. Panels without one share what is left. */
  defaultSize?: number;
  /** Smallest size in %. Default 0. */
  minSize?: number;
  /** Largest size in %. Default 100. */
  maxSize?: number;
  /** Dragging below half of `minSize` snaps the panel shut; Enter on its handle toggles it. Default `false`. */
  collapsible?: boolean;
  /** Size in % when collapsed. Default 0. */
  collapsedSize?: number;
  /** Called with the panel's size in % when it changes. */
  onResize?: (size: number) => void;
}

/** One pane. Has `overflow: hidden`; put a `ScrollArea` inside for scrolling content. */
export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(function ResizablePanel(
  { id: idProp, defaultSize, minSize = 0, maxSize = 100, collapsible = false, collapsedSize = 0, onResize, className, style, ...props },
  ref,
) {
  const api = useResizableContext('ResizablePanel');
  const autoId = useId();
  const id = idProp ?? autoId;
  const elRef = useRef<HTMLDivElement>(null);
  const setRef = useComposedRefs(ref, elRef);
  // Constraints are read lazily, so changing a prop never re-registers the panel (which would reset the layout)
  const infoRef = useRef<PanelInfo>({ id, el: null, min: minSize, max: maxSize, collapsible, collapsedSize, defaultSize });
  infoRef.current = { id, el: elRef.current, min: minSize, max: maxSize, collapsible, collapsedSize, defaultSize };
  const { register } = api;
  useIsomorphicLayoutEffect(
    () => register(id, () => ({ ...infoRef.current, el: elRef.current })),
    [register, id],
  );

  const size = api.sizes[id] ?? defaultSize;
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;
  useEffect(() => {
    if (size !== undefined) onResizeRef.current?.(size);
  }, [size]);

  const collapsed = size !== undefined && isCollapsed({ min: minSize, max: maxSize, collapsible, collapsedSize }, size);
  return (
    <div
      ref={setRef}
      id={id}
      className={cn('ui-resizable-panel', className)}
      data-panel-id={id}
      data-collapsed={collapsed || undefined}
      style={{ ...style, flex: `${size ?? 1} 1 0px` } as CSSProperties}
      {...props}
    />
  );
});
