'use client';

import { useRef, type ReactNode } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';

export interface TooltipRow {
  color: string;
  name: string;
  value: string;
}

export function TooltipContent({ label, rows }: { label?: string; rows: TooltipRow[] }) {
  return (
    <>
      {label ? <div className="ui-chart-tooltip-label">{label}</div> : null}
      {rows.map((r, i) => (
        <div key={`${r.name}-${i}`} className="ui-chart-tooltip-row">
          <span className="ui-chart-swatch" style={{ background: r.color }} aria-hidden="true" />
          <span className="ui-chart-tooltip-name">{r.name}</span>
          <span className="ui-chart-tooltip-value">{r.value}</span>
        </div>
      ))}
    </>
  );
}

export interface ChartTooltipProps {
  visible: boolean;
  /** Anchor in stage px: the tooltip sits beside it. */
  x: number;
  y: number;
  /** Stage size: the tooltip never leaves it. */
  width: number;
  height: number;
  /** Gap between the anchor and the tooltip. */
  offset?: number;
  children: ReactNode;
}

/**
 * Floating readout that glides between anchors, flips to the other side of the
 * anchor near the edge and is clamped inside the stage. Position is written
 * straight to the element so it follows the pointer without extra renders.
 */
export function ChartTooltip({ visible, x, y, width, height, offset = 14, children }: ChartTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const wasVisible = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = x + offset;
    if (left + w > width) left = x - offset - w;
    left = Math.min(Math.max(left, 0), Math.max(width - w, 0));
    const top = Math.min(Math.max(y - h / 2, 0), Math.max(height - h, 0));
    // First frame after appearing: jump, do not glide in from the previous spot
    if (!wasVisible.current) el.style.transition = 'none';
    el.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    if (!wasVisible.current) {
      void el.offsetWidth;
      el.style.transition = '';
    }
    wasVisible.current = visible;
  });

  return (
    <div ref={ref} className="ui-chart-tooltip" data-visible={visible ? 'true' : 'false'} aria-hidden="true">
      {children}
    </div>
  );
}
