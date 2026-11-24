import type { AxisTick } from './chart-axes';
import { labelIndices } from './chart-axes';
import { barPath } from './path';
import { bandScale, clamp, linearScale, niceScale, stackSeries, toNumber, type BandScale } from './scale';
import { labelWidth, type ResolvedSeries } from './series';
import type { ChartDatum, YAxisOptions } from './types';

export interface BarInput {
  width: number;
  height: number;
  data: ChartDatum[];
  visible: ResolvedSeries[];
  stacked: boolean;
  horizontal: boolean;
  radius: number;
  showX: boolean;
  showY: boolean;
  yOptions: YAxisOptions;
  formatValue: (v: number) => string;
  /** Category label for each row. */
  labels: string[];
}

export interface BarShape {
  series: ResolvedSeries;
  /** Category index. */
  i: number;
  d: string;
  /** CSS transform-origin for the grow-in (the baseline side). */
  origin: string;
}

export interface BarGeometry {
  plot: { left: number; right: number; top: number; bottom: number };
  band: BandScale;
  bars: BarShape[];
  hTicks: AxisTick[];
  vTicks: AxisTick[];
  zero: { pos: number; orient: 'h' | 'v' } | null;
  baseline: 'bottom' | 'left' | null;
  /** Slot of category `i` along the category axis: start and size. */
  slot: (i: number) => { start: number; size: number };
  /** Far end (value axis) of the longest bar in category `i`, as a pixel. */
  extent: (i: number) => number;
  /** Centre of category `i` along the category axis. */
  centre: (i: number) => number;
  indexAt: (x: number, y: number) => number;
}

const MAX_BAR = 48;
const GAP = 2;

export function computeBars(input: BarInput): BarGeometry {
  const { width, height, data, visible, stacked, horizontal, radius, showX, showY, yOptions, formatValue, labels } = input;
  const n = data.length;
  const K = visible.length;
  const stack = stacked ? stackSeries(data, visible.map((s) => s.key)) : null;

  const stackAt = (k: number, i: number) => stack![k]![i]!;
  let min = 0;
  let max = 0;
  visible.forEach((s, k) =>
    data.forEach((row, i) => {
      const lo = stack ? stackAt(k, i).lo : Math.min(toNumber(row[s.key]) ?? 0, 0);
      const hi = stack ? stackAt(k, i).hi : Math.max(toNumber(row[s.key]) ?? 0, 0);
      min = Math.min(min, lo);
      max = Math.max(max, hi);
    }),
  );

  const top = 10;
  const bottom = height - (showX ? 26 : 6);
  const catLabelW = labelWidth(labels);
  let left: number;
  let right: number;

  const [dLo, dHi] = yOptions.domain ?? ['auto', 'auto'];
  const plotW0 = width - 24;
  const count = yOptions.ticks ?? clamp(Math.round((horizontal ? plotW0 : height) / (horizontal ? 90 : 56)), 3, 6);
  const scale = niceScale(typeof dLo === 'number' ? dLo : min, typeof dHi === 'number' ? dHi : max, count);
  const domain: [number, number] = [typeof dLo === 'number' ? dLo : scale.min, typeof dHi === 'number' ? dHi : scale.max];
  const ticks = scale.ticks.filter((t) => t >= domain[0] - 1e-9 && t <= domain[1] + 1e-9);

  if (horizontal) {
    left = showY ? Math.min(catLabelW + 14, width * 0.4) : 6;
    right = width - 14;
  } else {
    left = showY ? (yOptions.width ?? labelWidth(ticks.map(formatValue)) + 12) : 6;
    right = width - 8;
  }

  const vs = horizontal ? linearScale(domain, [left, right]) : linearScale(domain, [bottom, top]);
  const band = horizontal ? bandScale(n, [top, bottom], { paddingInner: 0.3, paddingOuter: 0.15 }) : bandScale(n, [left, right], { paddingInner: 0.28, paddingOuter: 0.14 });
  const zeroPx = vs(clamp(0, domain[0], domain[1]));

  const bars: BarShape[] = [];
  data.forEach((row, i) => {
    // Which series ends each stack (positive and negative), so only that segment is rounded
    let lastPos = -1;
    let lastNeg = -1;
    visible.forEach((s, k) => {
      const v = toNumber(row[s.key]) ?? 0;
      if (v > 0) lastPos = k;
      else if (v < 0) lastNeg = k;
    });
    visible.forEach((s, k) => {
      const v = toNumber(row[s.key]) ?? 0;
      if (v === 0) return;
      const lo = stack ? stackAt(k, i).lo : Math.min(v, 0);
      const hi = stack ? stackAt(k, i).hi : Math.max(v, 0);
      const clampedLo = clamp(lo, domain[0], domain[1]);
      const clampedHi = clamp(hi, domain[0], domain[1]);
      const groupW = stacked ? Math.min(band.bandwidth, MAX_BAR + 8) : Math.min(band.bandwidth, MAX_BAR * K + GAP * (K - 1));
      const bw = stacked ? groupW : (groupW - GAP * (K - 1)) / K;
      const off = band(i) + (band.bandwidth - groupW) / 2 + (stacked ? 0 : k * (bw + GAP));
      const positive = v > 0;
      const rounded = stack ? (positive ? k === lastPos : k === lastNeg) : true;
      let d: string;
      let origin: string;
      if (horizontal) {
        const x0 = vs(clampedLo);
        const x1 = vs(clampedHi);
        d = barPath(x0, off, Math.max(x1 - x0, 0), bw, radius, rounded ? (positive ? 'right' : 'left') : 'none');
        origin = positive ? '0% 50%' : '100% 50%';
      } else {
        const y0 = vs(clampedHi);
        const y1 = vs(clampedLo);
        d = barPath(off, y0, bw, Math.max(y1 - y0, 0), radius, rounded ? (positive ? 'top' : 'bottom') : 'none');
        origin = positive ? '50% 100%' : '50% 0%';
      }
      bars.push({ series: s, i, d, origin });
    });
  });

  const cats: AxisTick[] = labelIndices(n, horizontal ? bottom - top : right - left, horizontal ? 4 : catLabelW).map((i) => ({
    pos: band(i) + band.bandwidth / 2,
    label: labels[i] ?? '',
  }));
  const valueTicks: AxisTick[] = ticks.map((t) => ({ pos: vs(t), label: formatValue(t) }));
  const crossesZero = domain[0] < 0 && domain[1] > 0;
  const catAxis = (showX && !horizontal) || (showY && horizontal);

  return {
    plot: { left, right, top, bottom },
    band,
    bars,
    hTicks: horizontal ? (catAxis ? cats : []) : valueTicks,
    vTicks: horizontal ? valueTicks : catAxis ? cats : [],
    zero: crossesZero ? { pos: zeroPx, orient: horizontal ? 'v' : 'h' } : null,
    baseline: crossesZero ? null : horizontal ? 'left' : 'bottom',
    slot: (i) => ({ start: band(i) - (band.step - band.bandwidth) / 2, size: band.step }),
    extent: (i) => {
      let best = horizontal ? left : bottom;
      visible.forEach((s, k) => {
        const hi = stack ? stackAt(k, i).hi : Math.max(toNumber(data[i]![s.key]) ?? 0, 0);
        const px = vs(clamp(hi, domain[0], domain[1]));
        best = horizontal ? Math.max(best, px) : Math.min(best, px);
      });
      return best;
    },
    centre: (i) => band(i) + band.bandwidth / 2,
    indexAt: (x, y) => band.indexAt(horizontal ? y : x),
  };
}
