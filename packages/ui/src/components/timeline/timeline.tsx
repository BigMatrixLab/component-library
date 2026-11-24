import { forwardRef, type HTMLAttributes, type LiHTMLAttributes, type OlHTMLAttributes, type ReactNode, type TimeHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type TimelineTone = 'default' | 'success' | 'warning' | 'destructive' | 'info';

/**
 * Timeline — events in order, joined by a connector line. Server Component–safe.
 * A flat `<ol>`; wrap items in `TimelineGroup` to split them by day.
 */
export const Timeline = forwardRef<HTMLOListElement, OlHTMLAttributes<HTMLOListElement>>(function Timeline(
  { className, ...props },
  ref,
) {
  return <ol ref={ref} className={cn('ui-timeline', className)} {...props} />;
});

export interface TimelineGroupProps extends LiHTMLAttributes<HTMLLIElement> {
  /** The group heading, usually a day: "Today", "Yesterday", "21 November 2026". */
  label: ReactNode;
  /** Heading element. Default `h3`. */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

/** A labelled run of items inside a `Timeline` (one `<li>` holding a heading and a nested list). */
export const TimelineGroup = forwardRef<HTMLLIElement, TimelineGroupProps>(function TimelineGroup(
  { label, as: Tag = 'h3', className, children, ...props },
  ref,
) {
  return (
    <li ref={ref} className={cn('ui-timeline-group', className)} {...props}>
      <Tag className="ui-timeline-group-label">{label}</Tag>
      <ol className="ui-timeline-group-list">{children}</ol>
    </li>
  );
});

export interface TimelineItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** Colours the marker: `default` is neutral; the rest are status tones. Default `default`. */
  tone?: TimelineTone;
  /**
   * What sits on the line. Omit for a dot. Pass an `Icon` (it is put in a 24px tinted circle) or a 24px
   * `Avatar size="xs"` (kept as is). Use `markerType` to say which.
   */
  marker?: ReactNode;
  /** How `marker` is presented: `icon` wraps it in a tinted circle, `avatar` leaves it bare. Default `icon`. */
  markerType?: 'icon' | 'avatar';
}

/** One event: a marker on the line and its content (`TimelineHeader`, `TimelineDescription`…). */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { tone = 'default', marker, markerType = 'icon', className, children, ...props },
  ref,
) {
  const kind = marker ? markerType : 'dot';
  return (
    <li ref={ref} className={cn('ui-timeline-item', className)} data-tone={tone === 'default' ? undefined : tone} {...props}>
      <span className="ui-timeline-marker" data-kind={kind} aria-hidden={kind === 'dot' ? true : undefined}>
        {marker ?? <span className="ui-timeline-dot" />}
      </span>
      <div className="ui-timeline-content">{children}</div>
    </li>
  );
});

/** Title and time on one line; wraps on narrow screens. */
export const TimelineHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TimelineHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-timeline-header', className)} {...props} />;
});

export const TimelineTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TimelineTitle(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-timeline-title', className)} {...props} />;
});

/** A `<time>`. Pass `dateTime` (ISO 8601) so assistive tech and crawlers read the real value. */
export const TimelineTime = forwardRef<HTMLTimeElement, TimeHTMLAttributes<HTMLTimeElement>>(function TimelineTime(
  { className, ...props },
  ref,
) {
  return <time ref={ref} className={cn('ui-timeline-time', className)} {...props} />;
});

export const TimelineDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function TimelineDescription(
  { className, ...props },
  ref,
) {
  return <p ref={ref} className={cn('ui-timeline-description', className)} {...props} />;
});
