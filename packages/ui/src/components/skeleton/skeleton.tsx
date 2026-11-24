import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type SkeletonShape = 'line' | 'circle' | 'block';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** `line` (a text line, default), `circle` (avatar) or `block` (image, card). */
  shape?: SkeletonShape;
  /** Width: a number is px, a string any CSS length (`"60%"`). Lines and blocks fill the width by default. */
  width?: number | string;
  /** Height: a number is px. Lines default to 16px, blocks to 96px; a circle is as tall as it is wide. */
  height?: number | string;
}

/**
 * Skeleton — a placeholder that reserves space while content loads.
 * Decorative (`aria-hidden`): mark the loading region with `aria-busy="true"`
 * and give assistive tech a status message. Server Component–safe.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { shape = 'line', width, height, className, style, ...props },
  ref,
) {
  const size: CSSProperties = {};
  if (width !== undefined) size.width = width;
  if (height !== undefined) size.height = height;
  if (shape === 'circle') {
    size.width ??= 40;
    size.height ??= size.width;
  }
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-shape={shape}
      className={cn('ui-skeleton', shape !== 'line' && `ui-skeleton-${shape}`, className)}
      style={{ ...size, ...style }}
      {...props}
    />
  );
});
