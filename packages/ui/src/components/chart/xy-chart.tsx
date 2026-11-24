'use client';

import { useId, useMemo, useRef } from 'react';
import { CartesianStage } from './cartesian-stage';
import { ChartAxes } from './chart-axes';
import { ChartContainer } from './chart-container';
import { createAxisFormatter, createValueFormatter } from './format';
import { axisOptions, gridFlags, tooltipOptions } from './options';
import type { Curve } from './path';
import { chartVars, defaultLabel, indexValue, resolveSeries, seriesVar, summarize, type ResolvedSeries } from './series';
import { toNumber } from './scale';
import type { CartesianChartProps, ChartDatum, XAxisOptions, YAxisOptions } from './types';
import { useTweenedData } from './use-chart-motion';
import { useSeriesVisibility } from './use-series-visibility';
import { computeXY } from './xy-geometry';

export interface XYChartProps extends CartesianChartProps {
  variant: 'line' | 'area';
  stacked?: boolean;
  curve?: Curve;
}

/** Shared implementation of LineChart and AreaChart. */
export function XYChart(props: XYChartProps) {
  const {
    data,
    index,
    series,
    variant,
    stacked = false,
    height = 280,
    valueFormat,
    indexFormat,
    locale,
    xAxis,
    yAxis,
    grid,
    legend,
    tooltip,
    curve = 'monotone',
    animate = true,
    className,
  } = props;

  const all = useMemo(() => resolveSeries(series), [series]);
  const [hidden, toggle] = useSeriesVisibility();
  const visible = all.filter((s) => !hidden.has(s.key));
  const shown = useTweenedData(data, all.map((s) => s.key), animate);
  const fmtIndex = indexFormat ?? defaultLabel;
  const fmt = createValueFormatter(valueFormat, locale);
  const x = axisOptions<XAxisOptions>(xAxis);
  const tip = tooltipOptions(tooltip);
  const labelOf = (row: ChartDatum, i: number) => fmtIndex(indexValue(row, index), i);
  const first = data.length ? labelOf(data[0]!, 0) : undefined;
  const last = data.length ? labelOf(data[data.length - 1]!, data.length - 1) : undefined;
  const name = props['aria-label'] ?? summarize(variant === 'line' ? 'Line chart' : stacked ? 'Stacked area chart' : 'Area chart', data.length, visible, first, last);
  const legendPos = legend ?? (all.length > 1 ? 'bottom' : false);

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
        rows: data.map((row, i) => [labelOf(row, i), ...all.map((s) => { const v = toNumber(row[s.key]); return v == null ? '' : fmt(v); })]),
      }}
    >
      {(width) => (
        <XYPlot
          width={width}
          height={height}
          data={shown}
          rawData={data}
          index={index}
          visible={visible}
          variant={variant}
          stacked={stacked}
          curve={curve}
          showX={x.show}
          xFormat={x.options.format ?? fmtIndex}
          tooltipFormat={tip.options.labelFormat ?? fmtIndex}
          showTooltip={tip.show}
          showY={axisOptions<YAxisOptions>(yAxis).show}
          yOptions={axisOptions<YAxisOptions>(yAxis).options}
          grid={gridFlags(grid)}
          fmt={fmt}
          fmtAxis={createAxisFormatter(valueFormat, locale)}
          animate={animate}
          label={name}
        />
      )}
    </ChartContainer>
  );
}

interface XYPlotProps {
  width: number;
  height: number;
  data: ChartDatum[];
  rawData: ChartDatum[];
  index: string;
  visible: ResolvedSeries[];
  variant: 'line' | 'area';
  stacked: boolean;
  curve: Curve;
  showX: boolean;
  xFormat: (v: string | number, i: number) => string;
  tooltipFormat: (v: string | number, i: number) => string;
  showTooltip: boolean;
  showY: boolean;
  yOptions: YAxisOptions;
  grid: { h: boolean; v: boolean };
  fmt: (v: number) => string;
  fmtAxis: (v: number) => string;
  animate: boolean;
  label: string;
}

function XYPlot(p: XYPlotProps) {
  const uid = useId().replace(/:/g, '');
  const lastIdx = useRef(0);
  const formatY = p.yOptions.format ?? p.fmtAxis;
  const xLabels = useMemo(() => p.rawData.map((row, i) => p.xFormat(indexValue(row, p.index), i)), [p.rawData, p.index, p.xFormat]);

  const geo = useMemo(
    () =>
      computeXY({
        width: p.width,
        height: p.height,
        data: p.data,
        visible: p.visible,
        variant: p.variant,
        stacked: p.stacked,
        curve: p.curve,
        showX: p.showX,
        showY: p.showY,
        yOptions: p.yOptions,
        formatY,
        xLabels,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.width, p.height, p.data, p.visible, p.variant, p.stacked, p.curve, p.showX, p.showY, p.yOptions, formatY, xLabels],
  );

  const marks = useMemo(
    () => (
      <>
        {p.variant === 'area' && (
          <defs>
            {geo.lines.map((l) => (
              <linearGradient key={l.series.key} id={`${uid}-${l.series.index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={seriesVar(l.series.index)} stopOpacity={p.stacked ? 0.55 : 0.34} />
                <stop offset="100%" stopColor={seriesVar(l.series.index)} stopOpacity={p.stacked ? 0.12 : 0} />
              </linearGradient>
            ))}
          </defs>
        )}
        <ChartAxes
          plot={geo.plot}
          hTicks={geo.hTicks}
          vTicks={geo.vTicks}
          gridH={p.grid.h}
          gridV={p.grid.v}
          leftLabels={p.showY}
          bottomLabels={p.showX}
          zero={geo.zeroY != null ? { pos: geo.zeroY, orient: 'h' } : null}
        />
        {geo.lines.map((l, order) =>
          l.area ? (
            <path key={`a-${l.series.key}`} d={l.area} fill={`url(#${uid}-${l.series.index})`} data-fade="" data-order={order} />
          ) : null,
        )}
        {geo.lines.map((l, order) => (
          <path
            key={`l-${l.series.key}`}
            d={l.d}
            className="ui-chart-line"
            style={{ stroke: seriesVar(l.series.index) }}
            data-draw=""
            data-order={order}
          />
        ))}
        {p.rawData.length === 1 &&
          geo.lines.map((l) =>
            l.points[0] ? <circle key={`s-${l.series.key}`} cx={l.points[0].x} cy={l.points[0].y} r={3.5} fill={seriesVar(l.series.index)} /> : null,
          )}
      </>
    ),
    [geo, uid, p.variant, p.stacked, p.grid, p.showX, p.showY, p.rawData.length],
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
      indexAt={(px) => geo.indexAt(px)}
      marks={marks}
      readout={p.showTooltip && readout}
      anchorX={geo.xs}
      animate={p.animate}
      overlay={(active, glide) => {
        if (active != null) lastIdx.current = active;
        const i = Math.min(lastIdx.current, Math.max(p.data.length - 1, 0));
        const on = active != null ? 'true' : 'false';
        return (
          <g aria-hidden="true">
            <g className="ui-chart-active" data-active={on} data-glide={glide} style={{ transform: `translateX(${geo.xs(i)}px)` }}>
              <line className="ui-chart-crosshair" x1={0} x2={0} y1={geo.plot.top} y2={geo.plot.bottom} />
            </g>
            {geo.lines.map((l) => {
              const pt = l.points[i];
              if (!pt) return null;
              return (
                <g
                  key={l.series.key}
                  className="ui-chart-active"
                  data-active={on}
                  data-glide={glide}
                  style={{ transform: `translate(${pt.x}px, ${pt.y}px)` }}
                >
                  <circle className="ui-chart-dot" r={4.5} style={{ fill: seriesVar(l.series.index) }} />
                </g>
              );
            })}
          </g>
        );
      }}
    />
  );
}
