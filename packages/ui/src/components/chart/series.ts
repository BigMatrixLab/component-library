import type { CSSProperties } from 'react';
import type { ChartDatum, ChartSeries, SeriesColor } from './types';

export interface ResolvedSeries {
  key: string;
  label: string;
  /** A CSS colour expression, e.g. `var(--ui-series-1)`. */
  color: string;
  /** Position in the original `series` array: stable when others are hidden. */
  index: number;
}

export function resolveColor(color: SeriesColor | undefined, i: number): string {
  if (!color) return `var(--ui-series-${(i % 6) + 1})`;
  return /^series-[1-6]$/.test(color) ? `var(--ui-${color})` : color;
}

export function resolveSeries(series: ChartSeries[]): ResolvedSeries[] {
  return series.map((s, i) => ({ key: s.key, label: s.label ?? s.key, color: resolveColor(s.color, i), index: i }));
}

/** CSS custom properties `--ui-chart-c0 ... cN`: marks reference these, so themes switch with no re-render. */
export function chartVars(colors: string[]): CSSProperties {
  const vars: Record<string, string> = {};
  colors.forEach((c, i) => {
    vars[`--ui-chart-c${i}`] = c;
  });
  return vars as CSSProperties;
}

export const seriesVar = (i: number) => `var(--ui-chart-c${i})`;

export const defaultLabel = (v: string | number) => String(v);

/** Index value of a row as string or number. */
export function indexValue(row: ChartDatum, key: string): string | number {
  const v = row[key];
  return typeof v === 'number' || typeof v === 'string' ? v : v == null ? '' : String(v);
}

/** Pixels needed for the longest label (12px tabular text, approximate). */
export function labelWidth(labels: string[]): number {
  return labels.reduce((m, l) => Math.max(m, l.length), 1) * 6.4 + 4;
}

/** A short sentence describing the chart for assistive tech. */
export function summarize(kind: string, count: number, series: ResolvedSeries[], first?: string, last?: string): string {
  const names = series.map((s) => s.label).join(', ');
  const range = first && last && count > 1 ? ` from ${first} to ${last}` : '';
  return `${kind} of ${names}, ${count} ${count === 1 ? 'point' : 'points'}${range}.`;
}
