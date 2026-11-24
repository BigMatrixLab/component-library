'use client';

import { useMemo, useRef } from 'react';
import { computeBars } from './bar-geometry';
import { CartesianStage } from './cartesian-stage';
import { ChartAxes } from './chart-axes';
import { ChartContainer } from './chart-container';
import { createAxisFormatter, createValueFormatter } from './format';
import { axisOptions, gridFlags, tooltipOptions } from './options';
import { toNumber } from './scale';
import { chartVars, defaultLabel, indexValue, resolveSeries, seriesVar, summarize } from './series';
import type { CartesianChartProps, ChartDatum, XAxisOptions, YAxisOptions } from './types';
import { useTweenedData } from './use-chart-motion';
import { useSeriesVisibility } from './use-series-visibility';

export interface BarChartProps extends CartesianChartProps {
  /** Stack the series in one bar per category instead of grouping them side by side. */
  stacked?: boolean;
  /** 'vertical' bars rise from the bottom; 'horizontal' bars run from the left. */
  orientation?: 'vertical' | 'horizontal';
  /** Corner radius of the rounded end, in px. */
  radius?: number;
}

/** Compare values across categories: grouped or stacked, vertical or horizontal, negatives allowed. */
export function BarChart({
  data,
  index,
  series,
  stacked = false,
  orientation = 'vertical',
  radius = 4,
  height = 280,
  valueFormat,
  indexFormat,
  locale,
  xAxis,
  yAxis,
  grid,
  legend,
  tooltip,
  animate = true,
  className,
  ...rest
}: BarChartProps) {
  const horizontal = orientation === 'horizontal';
  const all = useMemo(() => resolveSeries(series), [series]);
  const [hidden, toggle] = useSeriesVisibility();
  const visible = all.filter((s) => !hidden.has(s.key));
  const shown = useTweenedData(data, all.map((s) => s.key), animate);
  const fmtIndex = indexFormat ?? defaultLabel;
  const fmt = createValueFormatter(valueFormat, locale);
  const fmtAxis = createAxisFormatter(valueFormat, locale);
  const x = axisOptions<XAxisOptions>(xAxis);
  const y = axisOptions<YAxisOptions>(yAxis);
  const tip = tooltipOptions(tooltip);
  const labelOf = (row: ChartDatum, i: number) => fmtIndex(indexValue(row, index), i);
  const labels = data.map(labelOf);
  const kind = `${stacked ? 'Stacked bar' : 'Bar'} chart`;
  const name = rest['aria-label'] ?? summarize(kind, data.length, visible, labels[0], labels[labels.length - 1]);
  const legendPos = legend ?? (all.length > 1 ? 'bottom' : false);
  const g = gridFlags(grid);
  // Default grid runs along the value axis
  const gridH = grid === undefined || grid === true ? !horizontal : g.h;
  const gridV = grid === undefined || grid === true ? horizontal : g.v;

  return (
    <ChartContainer
      height={height}
      vars={chartVars(all.map((s) => s.color))}
      legend={legendPos}
      legendItems={all.map((s) => ({ key: s.key, label: s.label, color: seriesVar(s.index), visible: !hidden.has(s.key) }))}
      onLegendToggle={(key) => toggle(key, all.length)}
      className={className}
      table={{
        caption: name,
        columns: [index, ...all.map((s) => s.label)],
        rows: data.map((row, i) => [labels[i] ?? '', ...all.map((s) => { const v = toNumber(row[s.key]); return v == null ? '' : fmt(v); })]),
      }}
    >
      {(width) => (
        <BarPlot
          width={width}
          height={height}
          data={shown}
          rawData={data}
          index={index}
          labels={labels}
          visible={visible}
          stacked={stacked}
          horizontal={horizontal}
          radius={radius}
          showX={x.show}
          showY={y.show}
          yOptions={y.options}
          tooltipFormat={tip.options.labelFormat ?? fmtIndex}
          showTooltip={tip.show}
          fmt={fmt}
          formatTick={y.options.format ?? fmtAxis}
          gridH={gridH}
          gridV={gridV}
          animate={animate}
          label={name}
        />
      )}
    </ChartContainer>
  );
}

interface BarPlotProps {
  width: number;
  height: number;
  data: ChartDatum[];
  rawData: ChartDatum[];
  index: string;
  labels: string[];
  visible: ReturnType<typeof resolveSeries>;
  stacked: boolean;
  horizontal: boolean;
  radius: number;
  showX: boolean;
  showY: boolean;
  yOptions: YAxisOptions;
  tooltipFormat: (v: string | number, i: number) => string;
  showTooltip: boolean;
  fmt: (v: number) => string;
  formatTick: (v: number) => string;
  gridH: boolean;
  gridV: boolean;
  animate: boolean;
  label: string;
}

function BarPlot(p: BarPlotProps) {
  const lastIdx = useRef(0);
  const geo = useMemo(
    () =>
      computeBars({
        width: p.width,
        height: p.height,
        data: p.data,
        visible: p.visible,
        stacked: p.stacked,
        horizontal: p.horizontal,
        radius: p.radius,
        showX: p.showX,
        showY: p.showY,
        yOptions: p.yOptions,
        formatValue: p.formatTick,
        labels: p.labels,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.width, p.height, p.data, p.visible, p.stacked, p.horizontal, p.radius, p.showX, p.showY, p.yOptions, p.formatTick, p.labels],
  );

  const axes = (
    <ChartAxes
      plot={geo.plot}
      hTicks={geo.hTicks}
      vTicks={geo.vTicks}
      gridH={p.gridH}
      gridV={p.gridV}
      leftLabels={p.showY}
      bottomLabels={p.showX}
      baseline={geo.baseline}
      zero={geo.zero}
    />
  );

  const readout = (i: number) => ({
    label: p.tooltipFormat(indexValue(p.rawData[i]!, p.index), i),
    rows: p.visible.map((s) => {
      const v = toNumber(p.rawData[i]![s.key]);
      return { color: seriesVar(s.index), name: s.label, value: v == null ? '—' : p.fmt(v) };
    }),
  });

  return (
    <CartesianStage
      width={p.width}
      height={p.height}
      ariaLabel={p.label}
      count={p.data.length}
      indexAt={geo.indexAt}
      marks={axes}
      readout={p.showTooltip && readout}
      anchorX={(i) => (p.horizontal ? geo.extent(i) : geo.centre(i))}
      anchorY={(i) => (p.horizontal ? geo.centre(i) : 36)}
      animate={p.animate}
      overlay={(active, glide) => {
        if (active != null) lastIdx.current = active;
        const i = Math.min(lastIdx.current, Math.max(p.data.length - 1, 0));
        const slot = geo.slot(i);
        const { left, right, top, bottom } = geo.plot;
        const on = active != null ? 'true' : 'false';
        return (
          <>
            <g aria-hidden="true">
              <g
                className="ui-chart-active"
                data-active={on}
                data-glide={glide}
                style={{ transform: p.horizontal ? `translateY(${slot.start}px)` : `translateX(${slot.start}px)` }}
              >
                <rect
                  className="ui-chart-cursor"
                  x={p.horizontal ? left : 0}
                  y={p.horizontal ? 0 : top}
                  width={p.horizontal ? right - left : slot.size}
                  height={p.horizontal ? slot.size : bottom - top}
                  rx={4}
                />
              </g>
              {geo.bars.map((b) => (
                <path
                  key={`${b.i}-${b.series.key}`}
                  d={b.d}
                  className="ui-chart-bar"
                  style={{ fill: seriesVar(b.series.index) }}
                  data-grow=""
                  data-axis={p.horizontal ? 'x' : 'y'}
                  data-origin={b.origin}
                  data-dim={active != null && active !== b.i ? 'true' : 'false'}
                />
              ))}
            </g>
          </>
        );
      }}
    />
  );
}
