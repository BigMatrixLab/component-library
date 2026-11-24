'use client';

import { useId, useMemo } from 'react';
import { cn } from '../../lib/cn';
import { createValueFormatter } from './format';
import { areaPath, barPath, linePath, type Curve, type Point } from './path';
import { bandScale, linearScale, toNumber } from './scale';
import { resolveColor } from './series';
import type { ChartDatum, SeriesColor, ValueFormat } from './types';
import { useEntrance } from './use-chart-motion';
import { useChartSize } from './use-chart-size';

export interface SparklineProps {
  /** Numbers, or records read through `valueKey`. */
  data: (number | ChartDatum)[];
  valueKey?: string;
  variant?: 'line' | 'area' | 'bar';
  /** Fixed width in px. Fills the parent when omitted. */
  width?: number;
  height?: number;
  color?: SeriesColor;
  /** Colour by direction: success when the last value is above the first, destructive when below. */
  trend?: boolean;
  curve?: Curve;
  /** Dot on the last point (line and area). */
  dot?: boolean;
  strokeWidth?: number;
  valueFormat?: ValueFormat;
  animate?: boolean;
  'aria-label'?: string;
  className?: string;
}

/** A tiny trend line for tiles and table rows: no axes, no tooltip. */
export function Sparkline({
  data,
  valueKey = 'value',
  variant = 'line',
  width,
  height = 32,
  color,
  trend = false,
  curve = 'monotone',
  dot = true,
  strokeWidth = 1.5,
  valueFormat,
  animate = true,
  className,
  ...rest
}: SparklineProps) {
  const { ref, width: measured } = useChartSize<HTMLDivElement>();
  const uid = useId().replace(/:/g, '');
  const values = useMemo(
    () => data.map((d) => (typeof d === 'number' ? d : toNumber(d[valueKey]))).filter((v): v is number => v !== null),
    [data, valueKey],
  );
  const first = values[0];
  const last = values[values.length - 1];
  const stroke = trend && values.length > 1 && last !== first ? (last > first ? 'var(--ui-success)' : 'var(--ui-destructive)') : resolveColor(color, 0);
  const fmt = createValueFormatter(valueFormat);
  const name = rest['aria-label'] ?? (values.length ? `Trend, ${values.length} points, from ${fmt(first)} to ${fmt(last)}.` : 'No data');

  return (
    <div ref={ref} className={cn('ui-sparkline', className)} style={{ width: width ?? '100%', height }}>
      {measured > 0 && values.length > 0 && (
        <SparkSvg width={measured} height={height} values={values} variant={variant} curve={curve} dot={dot} stroke={stroke} strokeWidth={strokeWidth} uid={uid} animate={animate} label={name} />
      )}
    </div>
  );
}

function SparkSvg({
  width,
  height,
  values,
  variant,
  curve,
  dot,
  stroke,
  strokeWidth,
  uid,
  animate,
  label,
}: {
  width: number;
  height: number;
  values: number[];
  variant: 'line' | 'area' | 'bar';
  curve: Curve;
  dot: boolean;
  stroke: string;
  strokeWidth: number;
  uid: string;
  animate: boolean;
  label: string;
}) {
  const svgRef = useMemo(() => ({ current: null as SVGSVGElement | null }), []);
  useEntrance(svgRef, animate);
  const pad = 3;
  const n = values.length;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (variant === 'bar') {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const ys = linearScale([min, max], [height - pad, pad]);

  let body;
  if (variant === 'bar') {
    const band = bandScale(n, [0, width], { paddingInner: 0.35, paddingOuter: 0 });
    const zero = ys(0);
    body = values.map((v, i) => {
      const y = ys(v);
      const top = Math.min(y, zero);
      const h = Math.max(Math.abs(zero - y), 1);
      return (
        <path
          key={i}
          d={barPath(band(i), top, band.bandwidth, h, Math.min(1.5, band.bandwidth / 2), v >= 0 ? 'top' : 'bottom')}
          fill={stroke}
          opacity={i === n - 1 ? 1 : 0.45}
          data-grow=""
          data-axis="y"
          data-origin={v >= 0 ? '50% 100%' : '50% 0%'}
        />
      );
    });
  } else {
    const xs = (i: number) => (n === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (n - 1));
    const pts: Point[] = values.map((v, i) => ({ x: xs(i), y: ys(v) }));
    const lastPt = pts[n - 1];
    body = (
      <>
        {variant === 'area' && (
          <>
            <defs>
              <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={areaPath(pts, height, curve)} fill={`url(#${uid}-g)`} data-fade="" />
          </>
        )}
        <path d={linePath(pts, curve)} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" data-draw="" />
        {dot && <circle className="ui-sparkline-dot" cx={lastPt.x} cy={lastPt.y} r={2.5} fill={stroke} />}
      </>
    );
  }

  return (
    <svg
      ref={(el) => {
        svgRef.current = el;
      }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {body}
    </svg>
  );
}
