import type { AxisTick } from './chart-axes';
import { labelIndices } from './chart-axes';
import { areaPath, linePath, type Curve, type Point } from './path';
import { clamp, linearScale, niceScale, stackSeries, toNumber } from './scale';
import { labelWidth, type ResolvedSeries } from './series';
import type { ChartDatum, YAxisOptions } from './types';

export interface XYInput {
  width: number;
  height: number;
  data: ChartDatum[];
  visible: ResolvedSeries[];
  variant: 'line' | 'area';
  stacked: boolean;
  curve: Curve;
  showX: boolean;
  showY: boolean;
  yOptions: YAxisOptions;
  formatY: (v: number) => string;
  /** Axis label for each data row. */
  xLabels: string[];
}

export interface XYLine {
  series: ResolvedSeries;
  d: string;
  area: string | null;
  /** Point per data row (null where the value is missing). */
  points: (Point | null)[];
}

export interface XYGeometry {
  plot: { left: number; right: number; top: number; bottom: number };
  xs: (i: number) => number;
  indexAt: (px: number) => number;
  hTicks: AxisTick[];
  vTicks: AxisTick[];
  zeroY: number | null;
  lines: XYLine[];
}

/** Everything a line or area chart needs to draw, as pure data. */
export function computeXY(input: XYInput): XYGeometry {
  const { width, height, data, visible, variant, stacked, curve, showX, showY, yOptions, formatY, xLabels } = input;
  const n = data.length;
  const keys = visible.map((s) => s.key);
  const stack = stacked && variant === 'area' ? stackSeries(data, keys) : null;

  let min = Infinity;
  let max = -Infinity;
  visible.forEach((s, k) =>
    data.forEach((row, i) => {
      const hi = stack ? stack[k][i].hi : toNumber(row[s.key]);
      const lo = stack ? stack[k][i].lo : hi;
      if (hi == null || lo == null) return;
      max = Math.max(max, hi);
      min = Math.min(min, lo);
    }),
  );
  if (variant === 'area') {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  if (!Number.isFinite(min)) {
    min = 0;
    max = 1;
  }
  const [dLo, dHi] = yOptions.domain ?? ['auto', 'auto'];
  const count = yOptions.ticks ?? clamp(Math.round(height / 56), 3, 6);
  const scale = niceScale(typeof dLo === 'number' ? dLo : min, typeof dHi === 'number' ? dHi : max, count);
  const domain: [number, number] = [typeof dLo === 'number' ? dLo : scale.min, typeof dHi === 'number' ? dHi : scale.max];
  const ticks = scale.ticks.filter((t) => t >= domain[0] - 1e-9 && t <= domain[1] + 1e-9);

  const top = 10;
  const bottom = height - (showX ? 26 : 6);
  const edge = showX ? Math.ceil(labelWidth(xLabels) / 2) : 0;
  const yWidth = yOptions.width ?? labelWidth(ticks.map(formatY)) + 12;
  const left = showY ? yWidth : Math.max(6, edge);
  const right = width - Math.max(10, edge);

  const ys = linearScale(domain, [bottom, top]);
  const span = right - left;
  const xs = (i: number) => (n <= 1 ? left + span / 2 : left + (i * span) / (n - 1));
  const baseY = ys(clamp(0, domain[0], domain[1]));

  const lines: XYLine[] = visible.map((s, k) => {
    const points: (Point | null)[] = data.map((row, i) => {
      const v = stack ? stack[k][i].hi : toNumber(row[s.key]);
      return v == null ? null : { x: xs(i), y: ys(v) };
    });
    const defined = points.filter((p): p is Point => p !== null);
    let area: string | null = null;
    if (variant === 'area' && defined.length > 0) {
      const lower = stack ? data.map((_, i) => ({ x: xs(i), y: ys(stack[k][i].lo) })) : baseY;
      area = areaPath(defined, lower, curve);
    }
    return { series: s, d: linePath(points, curve), area, points };
  });

  const hTicks = ticks.map((t) => ({ pos: ys(t), label: formatY(t) }));
  const idx = showX ? labelIndices(n, span, labelWidth(xLabels)) : [];
  const vTicks = idx.map((i) => ({ pos: xs(i), label: xLabels[i] }));

  return {
    plot: { left, right, top, bottom },
    xs,
    indexAt: (px) => (n <= 1 ? 0 : clamp(Math.round(((px - left) / span) * (n - 1)), 0, n - 1)),
    hTicks,
    vTicks,
    zeroY: domain[0] < 0 && domain[1] > 0 ? ys(0) : null,
    lines,
  };
}
