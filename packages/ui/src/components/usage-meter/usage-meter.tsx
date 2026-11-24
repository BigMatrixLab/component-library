import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons/icon';

export type UsageMeterTone = 'default' | 'warning' | 'destructive';
export type UsageMeterSize = 'sm' | 'md' | 'lg';

export interface UsageMeterSegment {
  /** Category name, shown in the legend. */
  label: string;
  /** Amount this category uses, in the same unit as `max`. */
  value: number;
  /** Any CSS colour. Default: the next data series colour (`--ui-series-1…6`). */
  color?: string;
}

export interface UsageMeterThresholds {
  /** Percentage at which the meter turns to the warning colour. Default 75. */
  warning?: number;
  /** Percentage at which it turns destructive. Default 90. */
  destructive?: number;
}

export interface UsageMeterLabels {
  /** Joins used and max: "7.2 GB **of** 10 GB". Default `of`. */
  of?: string;
  /** Status at the warning threshold. Default `Approaching limit`. */
  warning?: string;
  /** Status at the destructive threshold. Default `Near limit`. */
  destructive?: string;
  /** Status when the limit is reached. Default `Limit reached`. */
  full?: string;
}

export interface UsageMeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Amount used. Omit it with `segments` to use their sum. */
  value?: number;
  /** The quota. */
  max: number;
  /** Visible name ("Storage"). Without one, pass `aria-label`. */
  label?: ReactNode;
  /** Appended to formatted numbers: `GB` gives "7.2 GB of 10 GB". */
  unit?: string;
  /** Format a number for display (replaces the default formatter and `unit`). */
  formatValue?: (value: number) => string;
  /** Replace the "7.2 GB of 10 GB" summary, or `false` to hide it. */
  summary?: ReactNode | false;
  /** Percent thresholds for the warning / destructive colours, or `false` for none. */
  thresholds?: UsageMeterThresholds | false;
  /** Split the fill into categories. The fill then keeps category colours; the threshold shows in the status text. */
  segments?: UsageMeterSegment[];
  /** Show the legend under a segmented bar. Default true when there are segments. */
  legend?: boolean;
  /** Track thickness: 4 / 8 / 12px. Default `md`. */
  size?: UsageMeterSize;
  /** Secondary text under the bar ("Resets on 1 December"). */
  description?: ReactNode;
  /** Text for i18n. */
  labels?: UsageMeterLabels;
  /** Screen-reader value. Default: "7.2 GB of 10 GB (72%)" plus the status. */
  getValueText?: (value: number, max: number) => string;
  /** Content after the meter, e.g. an upgrade link. */
  children?: ReactNode;
}

const DEFAULT_THRESHOLDS = { warning: 75, destructive: 90 };
const DEFAULT_LABELS: Required<UsageMeterLabels> = {
  of: 'of',
  warning: 'Approaching limit',
  destructive: 'Near limit',
  full: 'Limit reached',
};

// Fixed locale: the same string on the server and in the browser (no hydration mismatch)
const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/** Which colour a percentage maps to. Exported for custom meters. */
export function usageMeterTone(pct: number, thresholds: UsageMeterThresholds | false = DEFAULT_THRESHOLDS): UsageMeterTone {
  if (thresholds === false) return 'default';
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  if (pct >= t.destructive) return 'destructive';
  if (pct >= t.warning) return 'warning';
  return 'default';
}

/**
 * UsageMeter — how much of a quota is used ("7.2 GB of 10 GB"), with
 * thresholds that shift the colour to warning and destructive, and an
 * optional segmented bar with a legend. The fill grows in on mount (CSS only).
 * Server Component–safe.
 */
export const UsageMeter = forwardRef<HTMLDivElement, UsageMeterProps>(function UsageMeter(
  {
    value: valueProp,
    max,
    label,
    unit,
    formatValue,
    summary,
    thresholds = DEFAULT_THRESHOLDS,
    segments,
    legend,
    size = 'md',
    description,
    labels: labelsProp,
    getValueText,
    className,
    style,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const id = useId();
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const format = formatValue ?? ((n: number) => (unit ? `${numberFormat.format(n)} ${unit}` : numberFormat.format(n)));

  const segs = segments ?? [];
  const segmented = segs.length > 0;
  // Rounded so float noise (3.4 + 2.9 = 6.300000000000001) never reaches aria-valuenow
  const raw = valueProp ?? (segmented ? Math.round(segs.reduce((sum, s) => sum + Math.max(s.value, 0), 0) * 1e6) / 1e6 : 0);
  const used = clamp(Number.isFinite(raw) ? raw : 0, 0, Math.max(max, 0));
  const pct = max > 0 ? (used / max) * 100 : 0;
  const tone = usageMeterTone(pct, thresholds);
  const full = max > 0 && used >= max;
  const status = tone === 'default' ? null : full ? labels.full : labels[tone];

  const labelId = `${id}-label`;
  const descId = `${id}-desc`;
  const statusId = `${id}-status`;
  const valueText =
    getValueText?.(used, max) ??
    `${format(used)} ${labels.of} ${format(max)} (${Math.round(pct)}%)${status ? `, ${status.toLowerCase()}` : ''}`;
  const describedBy = cn(ariaDescribedBy, description != null && description !== false && descId) || undefined;

  // Segment shares are relative to the fill, so the fill alone carries the total width
  const shares = segs.map((s) => Math.max(s.value, 0));
  const showLegend = segmented && legend !== false;

  return (
    <div
      ref={ref}
      data-tone={tone}
      data-segmented={segmented ? '' : undefined}
      className={cn('ui-usage-meter', size !== 'md' && `ui-usage-meter-${size}`, className)}
      style={{ '--ui-usage-pct': pct, ...style } as CSSProperties}
      {...props}
    >
      {(label != null || summary !== false) && (
        <div className="ui-usage-meter-header">
          {label != null && (
            <span id={labelId} className="ui-usage-meter-label">
              {label}
            </span>
          )}
          {summary !== false && (
            <span className="ui-usage-meter-summary" aria-hidden="true">
              {summary ?? (
                <>
                  <span className="ui-usage-meter-used">{format(used)}</span> {labels.of} {format(max)}
                </>
              )}
            </span>
          )}
        </div>
      )}

      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={used}
        aria-valuetext={valueText}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (label != null && !ariaLabel ? labelId : undefined)}
        aria-describedby={describedBy}
        className="ui-usage-meter-track"
      >
        <span className="ui-usage-meter-fill">
          {segmented ? (
            segs.map((s, i) => (
              <span
                key={`${s.label}-${i}`}
                className="ui-usage-meter-segment"
                data-empty={shares[i] === 0 ? '' : undefined}
                style={
                  {
                    '--ui-usage-share': shares[i],
                    '--ui-usage-color': s.color ?? `var(--ui-series-${(i % 6) + 1})`,
                  } as CSSProperties
                }
              />
            ))
          ) : (
            <span className="ui-usage-meter-segment" style={{ '--ui-usage-share': 1 } as CSSProperties} />
          )}
        </span>
      </div>

      {(status || (description != null && description !== false)) && (
        <div className="ui-usage-meter-footer">
          {status && (
            <span id={statusId} className="ui-usage-meter-status">
              <Icon name={tone === 'destructive' ? 'circle-alert' : 'triangle-alert'} size={14} />
              {status}
            </span>
          )}
          {description != null && description !== false && (
            <span id={descId} className="ui-usage-meter-description">
              {description}
            </span>
          )}
        </div>
      )}

      {showLegend && (
        <ul className="ui-usage-meter-legend">
          {segs.map((s, i) => (
            <li key={`${s.label}-${i}`} className="ui-usage-meter-legend-item">
              <span
                className="ui-usage-meter-swatch"
                aria-hidden="true"
                style={{ '--ui-usage-color': s.color ?? `var(--ui-series-${(i % 6) + 1})` } as CSSProperties}
              />
              <span className="ui-usage-meter-legend-label">{s.label}</span>
              <span className="ui-usage-meter-legend-value">{format(Math.max(s.value, 0))}</span>
            </li>
          ))}
        </ul>
      )}

      {children}
    </div>
  );
});
