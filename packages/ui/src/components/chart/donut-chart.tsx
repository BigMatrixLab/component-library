'use client';

import { useMemo, type ReactNode } from 'react';
import { ChartContainer } from './chart-container';
import { ChartTooltip, TooltipContent } from './chart-tooltip';
import { createValueFormatter } from './format';
import { arcPath, polar } from './path';
import { toNumber } from './scale';
import { chartVars, resolveColor, seriesVar } from './series';
import type { ChartDatum, LegendPosition, SeriesColor, ValueFormat } from './types';
import { useSweep, useTweenedData } from './use-chart-motion';
import { useIndexInteraction } from './use-index-interaction';
import { useSeriesVisibility } from './use-series-visibility';

export interface DonutChartProps {
  data: ChartDatum[];
  /** Key of the slice name in each record. */
  index: string;
  /** Key of the slice value in each record. */
  valueKey: string;
  /** One colour per slice (series-1 ... series-6 or any CSS colour). Defaults to the theme series colours in order. */
  colors?: SeriesColor[];
  height?: number;
  /** Hole size as a fraction of the outer radius. 0 draws a pie. */
  innerRadius?: number;
  /** Gap between slices in degrees. */
  padAngle?: number;
  cornerRadius?: number;
  /** Small caption in the hole. Defaults to the hovered slice name, or "Total". */
  centerLabel?: ReactNode;
  /** Big value in the hole. Defaults to the hovered slice value, or the total. */
  centerValue?: ReactNode;
  valueFormat?: ValueFormat;
  locale?: string;
  legend?: LegendPosition;
  tooltip?: boolean;
  animate?: boolean;
  'aria-label'?: string;
  className?: string;
}

/** Parts of a whole. A donut by default; `innerRadius={0}` makes it a pie. */
export function DonutChart({
  data,
  index,
  valueKey,
  colors,
  height = 240,
  innerRadius = 0.62,
  padAngle = 2,
  cornerRadius = 4,
  centerLabel,
  centerValue,
  valueFormat,
  locale,
  legend = 'bottom',
  tooltip = true,
  animate = true,
  className,
  ...rest
}: DonutChartProps) {
  const [hidden, toggle] = useSeriesVisibility();
  const shown = useTweenedData(data, [valueKey], animate);
  const fmt = createValueFormatter(valueFormat, locale);
  const percent = createValueFormatter({ style: 'percent', maximumFractionDigits: 1 }, locale);
  const names = data.map((row) => String(row[index] ?? ''));
  const cols = data.map((_, i) => resolveColor(colors?.[i], i));
  const total = (rows: ChartDatum[]) => rows.reduce((t, row, i) => t + (hidden.has(names[i]) ? 0 : Math.max(toNumber(row[valueKey]) ?? 0, 0)), 0);
  const sum = total(data);
  const name =
    rest['aria-label'] ??
    `${innerRadius > 0 ? 'Donut' : 'Pie'} chart: ${data.map((row, i) => `${names[i]} ${fmt(toNumber(row[valueKey]) ?? 0)}`).join(', ')}.`;

  return (
    <ChartContainer
      height={height}
      vars={chartVars(cols)}
      legend={legend}
      legendItems={data.map((_, i) => ({ key: names[i], label: names[i], color: seriesVar(i), visible: !hidden.has(names[i]) }))}
      onLegendToggle={(key) => toggle(key, data.length)}
      className={className}
      table={{
        caption: name,
        columns: [index, valueKey, 'Share'],
        rows: data.map((row, i) => {
          const v = toNumber(row[valueKey]) ?? 0;
          return [names[i], fmt(v), sum > 0 ? percent(v / sum) : ''];
        }),
      }}
    >
      {(width) => (
        <DonutPlot
          width={width}
          height={height}
          rows={shown}
          names={names}
          hidden={hidden}
          valueKey={valueKey}
          innerRadius={innerRadius}
          padAngle={padAngle}
          cornerRadius={cornerRadius}
          centerLabel={centerLabel}
          centerValue={centerValue}
          fmt={fmt}
          percent={percent}
          showTooltip={tooltip}
          animate={animate}
          label={name}
        />
      )}
    </ChartContainer>
  );
}

interface Slice {
  /** Index into the original data. */
  i: number;
  value: number;
  start: number;
  end: number;
}

interface DonutPlotProps {
  width: number;
  height: number;
  rows: ChartDatum[];
  names: string[];
  hidden: ReadonlySet<string>;
  valueKey: string;
  innerRadius: number;
  padAngle: number;
  cornerRadius: number;
  centerLabel?: ReactNode;
  centerValue?: ReactNode;
  fmt: (v: number) => string;
  percent: (v: number) => string;
  showTooltip: boolean;
  animate: boolean;
  label: string;
}

const EXPAND = 6;

function DonutPlot(p: DonutPlotProps) {
  const sweep = useSweep(p.animate);
  const cx = p.width / 2;
  const cy = p.height / 2;
  const outer = Math.max(Math.min(p.width, p.height) / 2 - EXPAND - 2, 8);
  const inner = outer * Math.min(Math.max(p.innerRadius, 0), 0.95);

  const { slices, sum } = useMemo(() => {
    const vals = p.rows.map((row, i) => (p.hidden.has(p.names[i]) ? 0 : Math.max(toNumber(row[p.valueKey]) ?? 0, 0)));
    const sum = vals.reduce((a, b) => a + b, 0);
    let acc = 0;
    const slices: Slice[] = [];
    vals.forEach((v, i) => {
      if (v <= 0 || sum <= 0) return;
      const span = (v / sum) * Math.PI * 2;
      slices.push({ i, value: v, start: acc, end: acc + span });
      acc += span;
    });
    return { slices, sum };
  }, [p.rows, p.names, p.hidden, p.valueKey]);

  const { active, props } = useIndexInteraction(slices.length, (x, y) => {
    const dist = Math.hypot(x - cx, y - cy);
    if (dist > outer + EXPAND + 6 || dist < inner * 0.85) return -1;
    let a = Math.atan2(x - cx, -(y - cy));
    if (a < 0) a += Math.PI * 2;
    const hit = slices.findIndex((s) => a >= s.start && a < s.end);
    return hit;
  });
  const { ref, ...handlers } = props;
  const k = active.index != null && active.index >= 0 && active.index < slices.length ? active.index : null;
  const current = k != null ? slices[k] : null;
  const mid = current ? (current.start + current.end) / 2 : 0;
  const anchor = current ? polar(cx, cy, (inner + outer) / 2, mid) : { x: cx, y: cy };
  const tipX = active.source === 'pointer' ? active.x : anchor.x;
  const tipY = active.source === 'pointer' ? active.y : anchor.y;
  const limit = sweep * Math.PI * 2;
  const pad = (p.padAngle * Math.PI) / 180;
  const holeW = Math.max(inner * 1.7, 0);
  const showCenter = inner > 24;

  const label = current ? p.names[current.i] : (p.centerLabel ?? 'Total');
  const value = current ? p.fmt(current.value) : (p.centerValue ?? p.fmt(sum));

  return (
    <div
      ref={ref}
      className="ui-chart-stage"
      role="group"
      aria-label={`${p.label} Use the arrow keys to move between slices.`}
      style={{ width: p.width, height: p.height }}
      data-active={current ? 'true' : 'false'}
      {...handlers}
    >
      <svg width={p.width} height={p.height} viewBox={`0 0 ${p.width} ${p.height}`} role="img" aria-label={p.label}>
        {slices.length === 0 && inner > 0 && (
          <circle cx={cx} cy={cy} r={(inner + outer) / 2} fill="none" strokeWidth={outer - inner} className="ui-chart-track" />
        )}
        {slices.map((s, n) => {
          if (s.start >= limit) return null;
          const dx = Math.sin((s.start + s.end) / 2) * EXPAND;
          const dy = -Math.cos((s.start + s.end) / 2) * EXPAND;
          const on = k === n;
          return (
            <path
              key={p.names[s.i]}
              className="ui-chart-slice"
              d={arcPath({ cx, cy, inner, outer, start: s.start, end: Math.min(s.end, limit), padAngle: pad, cornerRadius: p.cornerRadius })}
              style={{ fill: seriesVar(s.i), transform: on ? `translate(${dx}px, ${dy}px)` : 'translate(0px, 0px)' }}
              data-dim={k != null && !on ? 'true' : 'false'}
            />
          );
        })}
      </svg>
      {showCenter && (
        <div className="ui-chart-center" style={{ width: holeW }} aria-hidden="true">
          <div className="ui-chart-center-label">{label}</div>
          <div className="ui-chart-center-value">{value}</div>
        </div>
      )}
      {p.showTooltip && (
        <ChartTooltip visible={!!current} x={tipX} y={tipY} width={p.width} height={p.height}>
          {current && (
            <TooltipContent
              rows={[{ color: seriesVar(current.i), name: p.names[current.i], value: `${p.fmt(current.value)} · ${p.percent(current.value / sum)}` }]}
            />
          )}
        </ChartTooltip>
      )}
      <div className="ui-chart-sr" role="status" aria-live="polite">
        {active.source === 'keyboard' && current ? `${p.names[current.i]}: ${p.fmt(current.value)}, ${p.percent(current.value / sum)}` : ''}
      </div>
    </div>
  );
}
