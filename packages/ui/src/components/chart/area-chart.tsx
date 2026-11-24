'use client';

import type { Curve } from './path';
import type { CartesianChartProps } from './types';
import { XYChart } from './xy-chart';

export interface AreaChartProps extends CartesianChartProps {
  curve?: Curve;
  /** Stack series on top of each other instead of overlaying them. */
  stacked?: boolean;
}

/** Line chart with a gradient fill that fades to transparent. */
export function AreaChart(props: AreaChartProps) {
  return <XYChart {...props} variant="area" />;
}
