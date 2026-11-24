'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { isCollapsed, isValidLayout, normalizeLayout, resizePair, round, type PanelConstraints } from './layout';

export type ResizableDirection = 'horizontal' | 'vertical';

export interface PanelInfo extends PanelConstraints {
  id: string;
  el: HTMLElement | null;
  defaultSize?: number;
}

export interface DragSession {
  index: number;
  /** Layout when the drag started; every move is computed from it. */
  layout: number[];
  /** Pixel size of all panels together (the space the percentages share). */
  pixels: number;
}

export interface HandleInfo {
  now: number;
  min: number;
  max: number;
}

export interface ResizableApi {
  direction: ResizableDirection;
  sizes: Record<string, number>;
  dragging: boolean;
  register: (id: string, get: () => PanelInfo) => () => void;
  beginDrag: (prevId: string, nextId: string) => DragSession | null;
  dragTo: (session: DragSession, deltaPercent: number) => void;
  endDrag: () => void;
  /** Move the divider by `delta` percentage points and save. */
  nudge: (prevId: string, nextId: string, delta: number) => void;
  /** Move the divider as far as the panels allow. */
  moveToEdge: (prevId: string, nextId: string, edge: 'start' | 'end') => void;
  /** Collapse the collapsible neighbour, or restore it if it is collapsed. */
  toggleCollapse: (prevId: string, nextId: string) => void;
  describe: (prevId: string, nextId: string) => HandleInfo | null;
}

export const ResizableContext = createContext<ResizableApi | null>(null);

export function useResizableContext(part: string): ResizableApi {
  const api = useContext(ResizableContext);
  if (!api) throw new Error(`<${part}> must be used inside <ResizablePanelGroup>`);
  return api;
}

const STORAGE_PREFIX = 'ui-resizable:';

export function useResizableGroup({
  direction,
  id,
  onLayout,
}: {
  direction: ResizableDirection;
  id?: string;
  onLayout?: (sizes: number[]) => void;
}): ResizableApi & { snapping: boolean } {
  const panels = useRef(new Map<string, () => PanelInfo>());
  const mounted = useRef(false);
  const [version, setVersion] = useState(0);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const layoutRef = useRef<Record<string, number>>({});
  /** Size a collapsed panel returns to. */
  const restoreSize = useRef<Record<string, number>>({});
  const snapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const idRef = useRef(id);
  idRef.current = id;
  const onLayoutRef = useRef(onLayout);
  onLayoutRef.current = onLayout;

  useEffect(() => () => clearTimeout(snapTimer.current), []);

  /** Panels in document order. */
  const ordered = useCallback((): PanelInfo[] => {
    const list = Array.from(panels.current.values(), (get) => get());
    return list.sort((a, b) => {
      if (!a.el || !b.el) return 0;
      return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }, []);

  const current = useCallback((infos: PanelInfo[]) => infos.map((p) => layoutRef.current[p.id] ?? 0), []);

  const apply = useCallback((infos: PanelInfo[], layout: number[]) => {
    const map: Record<string, number> = {};
    infos.forEach((p, i) => {
      map[p.id] = layout[i]!;
    });
    layoutRef.current = map;
    setSizes(map);
  }, []);

  /** Persist (only when the group has an id) and report. Called when an interaction ends. */
  const commit = useCallback(() => {
    const layout = current(ordered()).map(round);
    if (idRef.current) {
      try {
        localStorage.setItem(STORAGE_PREFIX + idRef.current, JSON.stringify(layout));
      } catch {
        /* storage blocked or full: sizes just don't persist */
      }
    }
    onLayoutRef.current?.(layout);
  }, [current, ordered]);

  // Initial layout: saved one if valid, else the panels' default sizes. Re-runs when panels are added or removed.
  useIsomorphicLayoutEffect(() => {
    mounted.current = true;
    const infos = ordered();
    if (!infos.length) return;
    let layout: number[] | null = null;
    if (idRef.current) {
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + idRef.current);
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        if (isValidLayout(parsed, infos.length)) layout = parsed;
      } catch {
        /* ignore */
      }
    }
    apply(infos, layout ?? normalizeLayout(infos.map((p) => p.defaultSize)));
  }, [version, ordered, apply]);

  const register = useCallback((panelId: string, get: () => PanelInfo) => {
    panels.current.set(panelId, get);
    if (mounted.current) setVersion((v) => v + 1);
    return () => {
      panels.current.delete(panelId);
      if (mounted.current) setVersion((v) => v + 1);
    };
  }, []);

  const pair = useCallback(
    (prevId: string, nextId: string) => {
      const infos = ordered();
      const index = infos.findIndex((p) => p.id === prevId);
      if (index < 0 || infos[index + 1]?.id !== nextId) return null;
      return { infos, index, layout: current(infos) };
    },
    [ordered, current],
  );

  const beginDrag = useCallback(
    (prevId: string, nextId: string): DragSession | null => {
      const p = pair(prevId, nextId);
      if (!p) return null;
      const pixels = p.infos.reduce((sum, info) => {
        const rect = info.el?.getBoundingClientRect();
        return sum + (rect ? (direction === 'horizontal' ? rect.width : rect.height) : 0);
      }, 0);
      setDragging(true);
      return { index: p.index, layout: p.layout, pixels };
    },
    [pair, direction],
  );

  const dragTo = useCallback(
    (session: DragSession, deltaPercent: number) => {
      const infos = ordered();
      apply(infos, resizePair(session.layout, infos, session.index, deltaPercent));
    },
    [ordered, apply],
  );

  const endDrag = useCallback(() => {
    setDragging(false);
    commit();
  }, [commit]);

  const nudge = useCallback(
    (prevId: string, nextId: string, delta: number) => {
      const p = pair(prevId, nextId);
      if (!p) return;
      apply(p.infos, resizePair(p.layout, p.infos, p.index, delta));
      commit();
    },
    [pair, apply, commit],
  );

  const describe = useCallback(
    (prevId: string, nextId: string): HandleInfo | null => {
      const p = pair(prevId, nextId);
      if (!p) return null;
      const a = p.infos[p.index]!;
      const b = p.infos[p.index + 1]!;
      const total = p.layout[p.index]! + p.layout[p.index + 1]!;
      const min = Math.max(a.collapsible ? a.collapsedSize : a.min, total - b.max);
      const max = Math.min(a.max, total - (b.collapsible ? b.collapsedSize : b.min));
      return { now: round(p.layout[p.index]!), min: round(min), max: round(Math.max(min, max)) };
    },
    [pair],
  );

  const moveToEdge = useCallback(
    (prevId: string, nextId: string, edge: 'start' | 'end') => {
      const info = describe(prevId, nextId);
      if (info) nudge(prevId, nextId, (edge === 'start' ? info.min : info.max) - info.now);
    },
    [describe, nudge],
  );

  const toggleCollapse = useCallback(
    (prevId: string, nextId: string) => {
      const p = pair(prevId, nextId);
      if (!p) return;
      const a = p.infos[p.index]!;
      const b = p.infos[p.index + 1]!;
      const sizeA = p.layout[p.index]!;
      const sizeB = p.layout[p.index + 1]!;
      const total = sizeA + sizeB;
      let wantA: number | null = null;
      if (a.collapsible) {
        if (isCollapsed(a, sizeA)) wantA = restoreSize.current[a.id] ?? a.min;
        else {
          restoreSize.current[a.id] = sizeA;
          wantA = a.collapsedSize;
        }
      } else if (b.collapsible) {
        if (isCollapsed(b, sizeB)) wantA = total - (restoreSize.current[b.id] ?? b.min);
        else {
          restoreSize.current[b.id] = sizeB;
          wantA = total - b.collapsedSize;
        }
      }
      if (wantA === null) return;
      setSnapping(true);
      clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => setSnapping(false), 700);
      apply(p.infos, resizePair(p.layout, p.infos, p.index, wantA - sizeA));
      commit();
    },
    [pair, apply, commit],
  );

  const api = useMemo(
    () => ({ direction, sizes, dragging, snapping, register, beginDrag, dragTo, endDrag, nudge, moveToEdge, toggleCollapse, describe }),
    [direction, sizes, dragging, snapping, register, beginDrag, dragTo, endDrag, nudge, moveToEdge, toggleCollapse, describe],
  );
  return api;
}
