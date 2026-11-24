import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons/icon';

export type StatGroupVariant = 'separate' | 'shared';

export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `separate`: each stat is its own bordered card. `shared`: one bordered surface with hairlines between stats (Stripe-like). Default `separate`. */
  variant?: StatGroupVariant;
  /** Narrowest a stat may get before the grid wraps (CSS length). Default `13rem`. */
  minItemWidth?: string;
}

/**
 * StatGroup — a responsive grid of Stats that wraps by available width.
 * Server Component–safe.
 */
export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(function StatGroup(
  { variant = 'separate', minItemWidth, className, style, children, ...props },
  ref,
) {
  const gridStyle = minItemWidth ? ({ '--ui-stat-min': minItemWidth } as CSSProperties) : undefined;
  return (
    <div
      ref={ref}
      role="group"
      className={cn('ui-stat-group', variant === 'shared' && 'ui-stat-group-shared', className)}
      style={style}
      {...props}
    >
      <div className="ui-stat-group-grid" style={gridStyle}>
        {children}
      </div>
    </div>
  );
});

/**
 * Stat — one metric: label, big value, optional delta, help text and chart.
 * Flat by default so it sits inside a Card; StatGroup gives it a surface.
 * Server Component–safe.
 */
export const Stat = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Stat({ className, ...props }, ref) {
  return <div ref={ref} className={cn('ui-stat', className)} {...props} />;
});

/** What the number measures: "Monthly revenue". */
export const StatLabel = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function StatLabel(
  { className, ...props },
  ref,
) {
  return <p ref={ref} className={cn('ui-stat-label', className)} {...props} />;
});

/** The number: large, tabular, never wraps. */
export const StatValue = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StatValue(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-stat-value', className)} {...props} />;
});

export type StatDirection = 'up' | 'down' | 'flat';
export type StatTone = 'positive' | 'negative' | 'neutral';

export interface StatDeltaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The change, already formatted: "12.4%", "+$1,240". */
  value: ReactNode;
  /** Arrow direction. Default `up`. */
  direction?: StatDirection;
  /** Colour. Defaults from the direction (up = positive, down = negative); set it when down is good (churn, latency). */
  tone?: StatTone;
  /** Context after the value: "vs last month". */
  comparison?: ReactNode;
}

const DIRECTION_TEXT: Record<StatDirection, string> = { up: 'Up', down: 'Down', flat: 'No change,' };

/** The change since the last period, with an arrow and a success / destructive tone. */
export const StatDelta = forwardRef<HTMLDivElement, StatDeltaProps>(function StatDelta(
  { value, direction = 'up', tone, comparison, className, ...props },
  ref,
) {
  const resolved: StatTone = tone ?? (direction === 'up' ? 'positive' : direction === 'down' ? 'negative' : 'neutral');
  return (
    <div ref={ref} className={cn('ui-stat-delta', className)} data-tone={resolved} data-direction={direction} {...props}>
      <span className="ui-stat-delta-value">
        {direction !== 'flat' && <Icon name={direction === 'up' ? 'arrow-up' : 'arrow-down'} size={14} strokeWidth={2} />}
        <span className="ui-stat-sr">{DIRECTION_TEXT[direction]} </span>
        {value}
      </span>
      {comparison != null && <span className="ui-stat-delta-comparison">{comparison}</span>}
    </div>
  );
});

/** Quiet supporting text under the value. */
export const StatHelp = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function StatHelp(
  { className, ...props },
  ref,
) {
  return <p ref={ref} className={cn('ui-stat-help', className)} {...props} />;
});

/** Slot for a Sparkline (or any small chart) at the bottom of the stat. */
export const StatChart = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StatChart(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-stat-chart', className)} {...props} />;
});
