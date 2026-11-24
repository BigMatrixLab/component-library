import type { Curve } from './path';
import type { ValueFormat } from './format';

export type { Curve, ValueFormat };

/** `'series-1'` ... `'series-6'` pick a theme colour; any other string is used as a CSS colour. */
export type SeriesColor = 'series-1' | 'series-2' | 'series-3' | 'series-4' | 'series-5' | 'series-6' | (string & {});

export interface ChartSeries {
  /** Key of the value in each data record. */
  key: string;
  /** Name shown in the legend and tooltip. Defaults to the key. */
  label?: string;
  color?: SeriesColor;
}

export type ChartDatum = Record<string, unknown>;
export type LegendPosition = 'top' | 'bottom' | false;
export type GridOption = boolean | 'horizontal' | 'vertical' | 'both';

export interface XAxisOptions {
  /** Format an index value for the axis. Falls back to `indexFormat`. */
  format?: (value: string | number, index: number) => string;
}

export interface YAxisOptions {
  /** Format a tick. Falls back to a compact `valueFormat`. */
  format?: (value: number) => string;
  /** Approximate number of ticks (the scale rounds to nice numbers). */
  ticks?: number;
  /** Fixed width in px for the label column. */
  width?: number;
  /** Fix either end of the domain; 'auto' keeps it computed. */
  domain?: [number | 'auto', number | 'auto'];
}

export interface TooltipOptions {
  /** Format the heading (the index value). Falls back to `indexFormat`. */
  labelFormat?: (value: string | number, index: number) => string;
}

/** Props shared by every chart. */
export interface ChartBaseProps {
  data: ChartDatum[];
  /** Key of the x value (the category or date) in each record. */
  index: string;
  series: ChartSeries[];
  /** Height of the plot in px. */
  height?: number;
  valueFormat?: ValueFormat;
  /** Format the index value everywhere it is shown (axis, tooltip, table). */
  indexFormat?: (value: string | number, index: number) => string;
  legend?: LegendPosition;
  tooltip?: boolean | TooltipOptions;
  /** Draw-in motion on mount and smooth transitions between data. Respects reduced motion. */
  animate?: boolean;
  /** Accessible name; a summary of the data is generated when omitted. */
  'aria-label'?: string;
  /** Locale for number formatting. */
  locale?: string;
  className?: string;
}

/** Props shared by the cartesian charts (line, area, bar). */
export interface CartesianChartProps extends ChartBaseProps {
  /** The bottom axis. */
  xAxis?: boolean | XAxisOptions;
  /** The left axis. */
  yAxis?: boolean | YAxisOptions;
  grid?: GridOption;
}
