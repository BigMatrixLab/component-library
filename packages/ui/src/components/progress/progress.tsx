import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressTone = 'default' | 'success' | 'warning' | 'destructive' | 'info';

interface ProgressBase extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value. `null` or omitted means indeterminate (unknown duration). */
  value?: number | null;
  /** Value that means 100%. Default 100. */
  max?: number;
  /** Colour. Status tones only when the colour carries meaning (low disk space, failed upload). */
  tone?: ProgressTone;
  /** Human-readable value for screen readers, e.g. "3 of 5 files uploaded". Default: the percentage. */
  getValueText?: (value: number, max: number) => string;
}

function resolve(value: number | null | undefined, max: number) {
  if (value === null || value === undefined || Number.isNaN(value)) return { pct: 0, state: 'indeterminate' as const, value: null };
  const clamped = Math.min(Math.max(value, 0), max);
  return { pct: max > 0 ? (clamped / max) * 100 : 0, state: clamped >= max ? ('complete' as const) : ('loading' as const), value: clamped };
}

function aria(value: number | null, max: number, getValueText: ProgressBase['getValueText'], pct: number) {
  return {
    role: 'progressbar' as const,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': value ?? undefined,
    'aria-valuetext': value === null ? undefined : (getValueText?.(value, max) ?? `${Math.round(pct)}%`),
  };
}

export interface ProgressProps extends ProgressBase {
  /** Track thickness: 4 / 8 / 12px. Default `md`. */
  size?: ProgressSize;
}

/**
 * Progress — a horizontal bar for a known amount of work. Needs an accessible
 * name (`aria-label` or `aria-labelledby`). Changes of `value` glide on the
 * smooth spring. Server Component–safe.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, size = 'md', tone = 'default', getValueText, className, style, ...props },
  ref,
) {
  const p = resolve(value, max);
  return (
    <div
      ref={ref}
      data-state={p.state}
      className={cn('ui-progress', size !== 'md' && `ui-progress-${size}`, tone !== 'default' && `ui-progress-${tone}`, className)}
      style={{ '--ui-progress-pct': p.pct, ...style } as CSSProperties}
      {...aria(p.value, max, getValueText, p.pct)}
      {...props}
    >
      <span className="ui-progress-indicator" />
    </div>
  );
});

export type ProgressCircleSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ProgressCircleProps extends ProgressBase {
  /** Diameter: 40 / 64 / 96 / 128px. Default `md`. */
  size?: ProgressCircleSize;
  /** Centre content. Default: the percentage. Pass `null` for an empty ring. */
  children?: ReactNode;
}

/**
 * ProgressCircle — the same, as a ring with a value in the middle.
 */
export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(function ProgressCircle(
  { value, max = 100, size = 'md', tone = 'default', getValueText, className, style, children, ...props },
  ref,
) {
  const p = resolve(value, max);
  const centre = children === undefined ? (p.value === null ? null : `${Math.round(p.pct)}%`) : children;
  return (
    <div
      ref={ref}
      data-state={p.state}
      className={cn('ui-progress-circle', size !== 'md' && `ui-progress-circle-${size}`, tone !== 'default' && `ui-progress-${tone}`, className)}
      style={{ '--ui-progress-pct': p.pct, ...style } as CSSProperties}
      {...aria(p.value, max, getValueText, p.pct)}
      {...props}
    >
      <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
        <circle className="ui-progress-circle-track" cx="18" cy="18" r="16" pathLength={100} />
        <circle className="ui-progress-circle-indicator" cx="18" cy="18" r="16" pathLength={100} data-empty={p.pct === 0 && p.value !== null ? '' : undefined} />
      </svg>
      {centre !== null && centre !== false && <span className="ui-progress-circle-value">{centre}</span>}
    </div>
  );
});
