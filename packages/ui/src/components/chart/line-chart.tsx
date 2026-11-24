'use client';

import type { Curve } from './path';
import type { CartesianChartProps } from './types';
import { XYChart } from './xy-chart';

export interface LineChartProps extends CartesianChartProps {
  /** Line interpolation. 'monotone' never overshoots the data. */
  curve?: Curve;
}

/** One or more series over an ordered index (time, steps). */
export function LineChart(props: LineChartProps) {
  return <XYChart {...props} variant="line" />;
}
