'use client';

import type { ReactNode } from 'react';
import { ChartContainer } from './chart-container';
import { ChartTooltip, TooltipContent } from './chart-tooltip';
import { createValueFormatter } from './format';
import { ringPath } from './path';
import { clamp, toNumber } from './scale';
import { chartVars, resolveColor, seriesVar } from './series';
import type { ChartDatum, LegendPosition, SeriesColor, ValueFormat } from './types';
import { useSweep, useTweenedData } from './use-chart-motion';
import { useIndexInteraction } from './use-index-interaction';
import { useSeriesVisibility } from './use-series-visibility';

export interface RadialChartProps {
  data: ChartDatum[];
  /** Key of the ring name in each record. */
  index: string;
  /** Key of the ring value in each record. */
  valueKey: string;
  /** Value that fills a ring completely. */
  max?: number;
  colors?: SeriesColor[];
  /** 'ring' draws concentric full circles; 'semicircle' is a gauge. */
  variant?: 'ring' | 'semicircle';
  /** Defaults to 240 (ring) or 160 (semicircle). */
  height?: number;
  /** Stroke width of a ring in px. */
  thickness?: number;
  /** Draw the empty track behind each ring. */
  track?: boolean;
  centerLabel?: ReactNode;
  centerValue?: ReactNode;
  valueFormat?: ValueFormat;
  locale?: string;
  legend?: LegendPosition;
  tooltip?: boolean;
  animate?: boolean;
  'aria-label'?: string;
  className?: string;
}

/** Progress toward a goal: one ring, several concentric rings, or a semicircle gauge. */
export function RadialChart({
  data,
  index,
  valueKey,
  max = 100,
  colors,
  variant = 'ring',
  height,
  thickness,
  track = true,
  centerLabel,
  centerValue,
  valueFormat,
  locale,
  legend,
  tooltip = true,
  animate = true,
  className,
  ...rest
}: RadialChartProps) {
  const h = height ?? (variant === 'semicircle' ? 160 : 240);
  const [hidden, toggle] = useSeriesVisibility();
  const shown = useTweenedData(data, [valueKey], animate);
  const fmt = createValueFormatter(valueFormat, locale);
  const names = data.map((row) => String(row[index] ?? ''));
  const cols = data.map((_, i) => resolveColor(colors?.[i], i));
  const name =
    rest['aria-label'] ??
    `${variant === 'semicircle' ? 'Gauge' : 'Radial chart'}: ${data.map((row, i) => `${names[i]} ${fmt(toNumber(row[valueKey]) ?? 0)} of ${fmt(max)}`).join(', ')}.`;

  return (
    <ChartContainer
      height={h}
      vars={chartVars(cols)}
      legend={legend ?? (data.length > 1 ? 'bottom' : false)}
      legendItems={data.map((_, i) => ({ key: names[i], label: names[i], color: seriesVar(i), visible: !hidden.has(names[i]) }))}
      onLegendToggle={(key) => toggle(key, data.length)}
      className={className}
      table={{
        caption: name,
        columns: [index, valueKey, 'Goal'],
        rows: data.map((row, i) => [names[i], fmt(toNumber(row[valueKey]) ?? 0), fmt(max)]),
      }}
    >
      {(width) => (
        <RadialPlot
          width={width}
          height={h}
          rows={shown}
          names={names}
          hidden={hidden}
          valueKey={valueKey}
          max={max}
          semicircle={variant === 'semicircle'}
          thickness={thickness}
          track={track}
          centerLabel={centerLabel}
          centerValue={centerValue}
          fmt={fmt}
          showTooltip={tooltip}
          animate={animate}
          label={name}
        />
      )}
    </ChartContainer>
  );
}

interface RadialPlotProps {
  width: number;
  height: number;
  rows: ChartDatum[];
  names: string[];
  hidden: ReadonlySet<string>;
  valueKey: string;
  max: number;
  semicircle: boolean;
  thickness?: number;
  track: boolean;
  centerLabel?: ReactNode;
  centerValue?: ReactNode;
  fmt: (v: number) => string;
  showTooltip: boolean;
  animate: boolean;
  label: string;
}

function RadialPlot(p: RadialPlotProps) {
  const sweep = useSweep(p.animate);
  const rings = p.rows
    .map((row, i) => ({ i, value: toNumber(row[p.valueKey]) ?? 0 }))
    .filter((r) => !p.hidden.has(p.names[r.i]));
  const n = rings.length;

  const outerR = p.semicircle ? Math.min(p.width / 2 - 4, p.height - 14) : Math.min(p.width, p.height) / 2 - 4;
  const cx = p.width / 2;
  const cy = p.semicircle ? p.height - 6 : p.height / 2;
  const gap = 4;
  const stroke = Math.max(4, Math.min(p.thickness ?? (n > 1 ? 12 : 16), (outerR - 12) / Math.max(n, 1) - gap));
  const start = p.semicircle ? -Math.PI / 2 : 0;
  const range = p.semicircle ? Math.PI : Math.PI * 2;
  const radius = (k: number) => outerR - stroke / 2 - k * (stroke + gap);

  const { active, props } = useIndexInteraction(n, (x, y) => {
    const dist = Math.hypot(x - cx, y - cy);
    const k = Math.floor((outerR - dist) / (stroke + gap));
    return dist > outerR + 4 || k < 0 || k >= n ? -1 : k;
  });
  const { ref, ...handlers } = props;
  const k = active.index != null && active.index >= 0 && active.index < n ? active.index : null;
  const current = k != null ? rings[k] : null;
  const frac = (v: number) => clamp(v / (p.max || 1), 0, 1);

  let label: ReactNode = p.centerLabel;
  let value: ReactNode = p.centerValue;
  if (current) {
    label = p.names[current.i];
    value = p.fmt(current.value);
  } else if (n === 1) {
    label = p.centerLabel ?? p.names[rings[0].i];
    value = p.centerValue ?? p.fmt(rings[0].value);
  }
  const showCenter = (value != null || label != null) && (p.semicircle || outerR - n * (stroke + gap) > 28);
  const tipX = active.source === 'pointer' ? active.x : cx;
  const tipY = active.source === 'pointer' ? active.y : cy - radius(k ?? 0);

  return (
    <div
      ref={ref}
      className="ui-chart-stage"
      role="group"
      aria-label={`${p.label} Use the arrow keys to move between rings.`}
      style={{ width: p.width, height: p.height }}
      data-active={current ? 'true' : 'false'}
      {...handlers}
    >
      <svg width={p.width} height={p.height} viewBox={`0 0 ${p.width} ${p.height}`} role="img" aria-label={p.label}>
        {rings.map((r, k2) => {
          const rad = radius(k2);
          const on = k === k2;
          return (
            <g key={p.names[r.i]} data-dim={k != null && !on ? 'true' : 'false'} className="ui-chart-ring" aria-hidden="true">
              {p.track && <path d={ringPath(cx, cy, rad, start, start + range)} className="ui-chart-track" strokeWidth={stroke} strokeLinecap="round" fill="none" />}
              <path
                d={ringPath(cx, cy, rad, start, start + range * frac(r.value) * sweep)}
                className="ui-chart-ring-value"
                style={{ stroke: seriesVar(r.i) }}
                strokeWidth={on ? stroke + 2 : stroke}
                strokeLinecap="round"
                fill="none"
              />
            </g>
          );
        })}
      </svg>
      {showCenter && (
        <div
          className="ui-chart-center"
          data-variant={p.semicircle ? 'semicircle' : undefined}
          style={p.semicircle ? { top: cy - 4, transform: 'translate(-50%, -100%)' } : undefined}
          aria-hidden="true"
        >
          {label != null && <div className="ui-chart-center-label">{label}</div>}
          {value != null && <div className="ui-chart-center-value">{value}</div>}
        </div>
      )}
      {p.showTooltip && n > 1 && (
        <ChartTooltip visible={!!current} x={tipX} y={tipY} width={p.width} height={p.height}>
          {current && <TooltipContent rows={[{ color: seriesVar(current.i), name: p.names[current.i], value: `${p.fmt(current.value)} of ${p.fmt(p.max)}` }]} />}
        </ChartTooltip>
      )}
      <div className="ui-chart-sr" role="status" aria-live="polite">
        {active.source === 'keyboard' && current ? `${p.names[current.i]}: ${p.fmt(current.value)} of ${p.fmt(p.max)}` : ''}
      </div>
    </div>
  );
}
