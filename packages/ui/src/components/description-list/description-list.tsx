import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type DescriptionListOrientation = 'stacked' | 'horizontal';

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  /**
   * `stacked`: term above details. `horizontal`: term in a label column beside the details once
   * the list is wide enough (≈ 512px), stacked below that. Default `stacked`.
   */
  orientation?: DescriptionListOrientation;
  /** A hairline between items. */
  divided?: boolean;
  /** Width of the label column in `horizontal` (CSS length). Default `11rem`. */
  labelWidth?: string;
}

/**
 * DescriptionList — a native `<dl>` of term / details pairs (customer profile, invoice meta).
 * Sizes itself to its container, so it works full-width or inside a Card. Server Component–safe.
 * Compose: DescriptionItem > DescriptionTerm + DescriptionDetails.
 */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { orientation = 'stacked', divided = false, labelWidth, className, style, ...props },
  ref,
) {
  const merged = labelWidth ? ({ '--ui-dl-label': labelWidth, ...style } as CSSProperties) : style;
  return (
    <dl
      ref={ref}
      className={cn('ui-dl', orientation === 'horizontal' && 'ui-dl-horizontal', divided && 'ui-dl-divided', className)}
      style={merged}
      {...props}
    />
  );
});

/** One term + details pair. Renders a `<div>`, which `<dl>` allows for grouping. */
export const DescriptionItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DescriptionItem(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-dl-item', className)} {...props} />;
});

/** The label: "Email", "Billing plan". */
export const DescriptionTerm = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function DescriptionTerm(
  { className, ...props },
  ref,
) {
  return <dt ref={ref} className={cn('ui-dl-term', className)} {...props} />;
});

/** The value. Can hold text, a Badge, a link or a CopyButton. */
export const DescriptionDetails = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function DescriptionDetails(
  { className, ...props },
  ref,
) {
  return <dd ref={ref} className={cn('ui-dl-details', className)} {...props} />;
});
