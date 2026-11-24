export interface AxisTick {
  pos: number;
  label: string;
}

export interface ChartAxesProps {
  plot: { left: number; right: number; top: number; bottom: number };
  /** Horizontal lines (y positions) and their labels, shown on the left. */
  hTicks: AxisTick[];
  /** Vertical lines (x positions) and their labels, shown at the bottom. */
  vTicks: AxisTick[];
  gridH: boolean;
  gridV: boolean;
  leftLabels: boolean;
  bottomLabels: boolean;
  /** Solid axis line along the bottom or the left edge of the plot. */
  baseline?: 'bottom' | 'left' | null;
  /** Solid zero line (negative values). */
  zero?: { pos: number; orient: 'h' | 'v' } | null;
}

/** Grid, axis lines and tick labels. Classes carry the colours; nothing here reads a colour. */
export function ChartAxes({ plot, hTicks, vTicks, gridH, gridV, leftLabels, bottomLabels, baseline = 'bottom', zero }: ChartAxesProps) {
  const { left, right, top, bottom } = plot;
  return (
    <g aria-hidden="true">
      {gridH &&
        hTicks.map((t, i) => <line key={`h${i}`} className="ui-chart-grid" x1={left} x2={right} y1={t.pos} y2={t.pos} />)}
      {gridV &&
        vTicks.map((t, i) => <line key={`v${i}`} className="ui-chart-grid" x1={t.pos} x2={t.pos} y1={top} y2={bottom} />)}
      {baseline === 'bottom' && <line className="ui-chart-axis-line" x1={left} x2={right} y1={bottom} y2={bottom} />}
      {baseline === 'left' && <line className="ui-chart-axis-line" x1={left} x2={left} y1={top} y2={bottom} />}
      {zero && zero.orient === 'h' && <line className="ui-chart-axis-line" x1={left} x2={right} y1={zero.pos} y2={zero.pos} />}
      {zero && zero.orient === 'v' && <line className="ui-chart-axis-line" x1={zero.pos} x2={zero.pos} y1={top} y2={bottom} />}
      {leftLabels &&
        hTicks.map((t, i) => (
          <text key={`l${i}`} className="ui-chart-axis" x={left - 8} y={t.pos} dy="0.32em" textAnchor="end">
            {t.label}
          </text>
        ))}
      {bottomLabels &&
        vTicks.map((t, i) => (
          <text key={`b${i}`} className="ui-chart-axis" x={t.pos} y={bottom + 18} textAnchor="middle">
            {t.label}
          </text>
        ))}
    </g>
  );
}

/** Indices to label so neighbouring labels do not overlap (always includes the first). */
export function labelIndices(count: number, plotWidth: number, labelW: number): number[] {
  if (count === 0) return [];
  const fit = Math.max(1, Math.floor(plotWidth / (labelW + 12)));
  const stride = Math.max(1, Math.ceil(count / fit));
  const out: number[] = [];
  for (let i = 0; i < count; i += stride) out.push(i);
  return out;
}
