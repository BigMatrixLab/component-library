'use client';

import type { CSSProperties, ReactNode } from 'react';
import { ChartLegend, type LegendItem } from './chart-legend';
import { cn } from '../../lib/cn';
import type { LegendPosition } from './types';
import { useChartSize } from './use-chart-size';

export interface ChartTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface ChartContainerProps {
  /** Plot height in px; reserved on the server and before the first measure. */
  height: number;
  /** `--ui-chart-cN` custom properties (see chartVars). */
  vars: CSSProperties;
  legend: LegendPosition;
  legendItems: LegendItem[];
  onLegendToggle: (key: string) => void;
  table: ChartTable;
  className?: string;
  /** Rendered once the width is known (never on the server). */
  children: (width: number) => ReactNode;
}

/**
 * Shared frame for every chart: measures the width, reserves the height,
 * lays out the legend and carries the visually hidden data table.
 */
export function ChartContainer({ height, vars, legend, legendItems, onLegendToggle, table, className, children }: ChartContainerProps) {
  const { ref, width } = useChartSize<HTMLDivElement>();
  const legendEl = legend ? <ChartLegend items={legendItems} onToggle={onLegendToggle} /> : null;
  return (
    <div className={cn('ui-chart', className)} style={vars} data-legend={legend || undefined}>
      {legend === 'top' ? legendEl : null}
      <div ref={ref} className="ui-chart-plot" style={{ height }}>
        {width > 0 ? children(width) : null}
      </div>
      {legend === 'bottom' ? legendEl : null}
      <table className="ui-chart-sr">
        <caption>{table.caption}</caption>
        <thead>
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
