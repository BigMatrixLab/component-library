'use client';

import { forwardRef, type HTMLAttributes, type MouseEvent } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons/icon';
import { Button, type ButtonProps } from '../button/button';
import { useCarouselContext } from './carousel';

export interface CarouselButtonProps extends Omit<ButtonProps, 'icon' | 'asChild' | 'loading'> {}

/**
 * Previous slide. Place it inside `Carousel`, beside `CarouselContent`. It stays focusable at the start
 * but is marked `aria-disabled` and does nothing (it is never disabled with `loop`).
 */
export const CarouselPrevious = forwardRef<HTMLButtonElement, CarouselButtonProps>(function CarouselPrevious(
  { className, variant = 'outline', size = 'sm', onClick, children, 'aria-label': label = 'Previous slide', ...props },
  ref,
) {
  const { canPrev, scrollPrev, orientation } = useCarouselContext('CarouselPrevious');
  return (
    <Button
      ref={ref}
      icon
      variant={variant}
      size={size}
      className={cn('ui-carousel-nav ui-carousel-prev', className)}
      aria-label={label}
      aria-disabled={!canPrev || undefined}
      data-orientation={orientation}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && canPrev) scrollPrev();
      }}
      {...props}
    >
      {children ?? <Icon name={orientation === 'vertical' ? 'chevron-up' : 'chevron-left'} />}
    </Button>
  );
});

/** Next slide. See `CarouselPrevious`. */
export const CarouselNext = forwardRef<HTMLButtonElement, CarouselButtonProps>(function CarouselNext(
  { className, variant = 'outline', size = 'sm', onClick, children, 'aria-label': label = 'Next slide', ...props },
  ref,
) {
  const { canNext, scrollNext, orientation } = useCarouselContext('CarouselNext');
  return (
    <Button
      ref={ref}
      icon
      variant={variant}
      size={size}
      className={cn('ui-carousel-nav ui-carousel-next', className)}
      aria-label={label}
      aria-disabled={!canNext || undefined}
      data-orientation={orientation}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && canNext) scrollNext();
      }}
      {...props}
    >
      {children ?? <Icon name={orientation === 'vertical' ? 'chevron-down' : 'chevron-right'} />}
    </Button>
  );
});

/**
 * One dot per stopping position, the active one marked `aria-current="true"` and stretched.
 * Renders nothing when everything fits (a single position).
 */
export const CarouselDots = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CarouselDots(
  { className, role = 'group', 'aria-label': label = 'Choose a slide', ...props },
  ref,
) {
  const { index, snaps, scrollTo, orientation } = useCarouselContext('CarouselDots');
  if (snaps <= 1) return null;
  return (
    <div ref={ref} role={role} aria-label={label} className={cn('ui-carousel-dots', className)} data-orientation={orientation} {...props}>
      {Array.from({ length: snaps }, (_, i) => (
        <button
          key={i}
          type="button"
          className="ui-carousel-dot"
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === index ? 'true' : undefined}
          data-state={i === index ? 'active' : 'inactive'}
          onClick={() => scrollTo(i)}
        />
      ))}
    </div>
  );
});
