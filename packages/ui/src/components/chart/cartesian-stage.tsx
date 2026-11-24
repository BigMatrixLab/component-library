'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ChartTooltip, TooltipContent, type TooltipRow } from './chart-tooltip';
import { useEntrance } from './use-chart-motion';
import { useIndexInteraction } from './use-index-interaction';

export interface StageReadout {
  label: string;
  rows: TooltipRow[];
}

export interface CartesianStageProps {
  width: number;
  height: number;
  ariaLabel: string;
  count: number;
  /** Nearest index for a pointer position inside the stage. */
  indexAt: (x: number, y: number) => number;
  /** Static marks: grid, axes, series. Memoise this node so pointer moves do not rebuild it. */
  marks: ReactNode;
  /** Crosshair, dots and bar highlights; rendered inside the svg after the marks. */
  overlay?: (active: number | null, glide: boolean) => ReactNode;
  /** Tooltip content for an index; false hides the tooltip. */
  readout: false | ((index: number) => StageReadout);
  /** Pixel x the tooltip is anchored to for an index. */
  anchorX: (index: number) => number;
  /** Tooltip y for keyboard and touch (the pointer drives it otherwise). */
  anchorY?: (index: number) => number;
  animate: boolean;
  /** Called with the active index (null when cleared). */
  onActiveChange?: (index: number | null) => void;
  svgClassName?: string;
}

/**
 * The interactive surface shared by line, area and bar charts: pointer and
 * touch scrubbing, arrow-key navigation, tooltip and a polite live region.
 */
export function CartesianStage({
  width,
  height,
  ariaLabel,
  count,
  indexAt,
  marks,
  overlay,
  readout,
  anchorX,
  anchorY,
  animate,
  onActiveChange,
  svgClassName,
}: CartesianStageProps) {
  const { active, props } = useIndexInteraction(count, indexAt);
  const { ref, ...handlers } = props;
  useEntrance(ref, animate);

  const glide = useRef(false);
  const idx = active.index;
  useEffect(() => {
    glide.current = idx != null;
    onActiveChange?.(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const info = idx != null && readout ? readout(idx) : null;
  const last = useRef<StageReadout | null>(null);
  if (info) last.current = info;
  const lastX = useRef(0);
  if (idx != null) lastX.current = anchorX(idx);
  const y = active.source === 'pointer' ? active.y : idx != null && anchorY ? anchorY(idx) : 36;

  return (
    <div
      ref={ref}
      className="ui-chart-stage"
      role="group"
      aria-label={`${ariaLabel} Use the arrow keys to move between values.`}
      style={{ width, height }}
      data-active={idx != null ? 'true' : 'false'}
      {...handlers}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className={svgClassName}>
        {marks}
        {overlay ? overlay(idx, glide.current) : null}
      </svg>
      {readout ? (
        <ChartTooltip visible={!!info} x={idx != null ? anchorX(idx) : lastX.current} y={y} width={width} height={height}>
          {last.current ? <TooltipContent label={last.current.label} rows={last.current.rows} /> : null}
        </ChartTooltip>
      ) : null}
      <div className="ui-chart-sr" aria-live="polite" role="status">
        {active.source === 'keyboard' && info ? `${info.label}: ${info.rows.map((r) => `${r.name} ${r.value}`).join(', ')}` : ''}
      </div>
    </div>
  );
}
