import type { GridOption, TooltipOptions } from './types';

export function gridFlags(grid: GridOption | undefined): { h: boolean; v: boolean } {
  if (grid === undefined || grid === true) return { h: true, v: false };
  if (grid === false) return { h: false, v: false };
  return { h: grid === 'horizontal' || grid === 'both', v: grid === 'vertical' || grid === 'both' };
}

const EMPTY = {};

export function axisOptions<T extends object>(value: boolean | T | undefined): { show: boolean; options: Partial<T> } {
  if (value === undefined || value === true) return { show: true, options: EMPTY as Partial<T> };
  if (value === false) return { show: false, options: EMPTY as Partial<T> };
  return { show: true, options: value };
}

export function tooltipOptions(value: boolean | TooltipOptions | undefined): { show: boolean; options: TooltipOptions } {
  if (value === undefined || value === true) return { show: true, options: EMPTY };
  if (value === false) return { show: false, options: EMPTY };
  return { show: true, options: value };
}
