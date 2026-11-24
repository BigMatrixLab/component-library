'use client';

import { createContext, forwardRef, useContext, useMemo, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type RefObject } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useCarousel, type CarouselOrientation, type CarouselState } from './use-carousel';

export interface CarouselContextValue extends CarouselState {
  orientation: CarouselOrientation;
  loop: boolean;
  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  viewportRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarouselContext(part: string): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Carousel>`);
  return ctx;
}

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /** Scroll direction. A vertical carousel needs a height. Default `horizontal`. */
  orientation?: CarouselOrientation;
  /** Wrap around: Next on the last position goes back to the first (a rewind, not an endless strip). Default `false`. */
  loop?: boolean;
  /**
   * Advance on a timer: `true` (every 5 s) or an interval in milliseconds. Pauses while the pointer is over
   * it, focus is inside it or the tab is hidden, and never runs under reduced motion. At the end it rewinds.
   */
  autoplay?: boolean | number;
  /** Called with the first visible position whenever it changes (swipes, keys, buttons, dots, autoplay). */
  onIndexChange?: (index: number) => void;
  /** Accessible name of the carousel, e.g. "Product photos". Strongly recommended. */
  'aria-label'?: string;
}

/**
 * Carousel — a scroll-snap track with previous/next buttons, dots and keyboard arrows. Swiping and
 * trackpad scrolling are the browser's own. Compose: CarouselContent > CarouselItem…, CarouselPrevious,
 * CarouselNext, CarouselDots. Show several slides at once by setting `--ui-carousel-per-view` (and
 * `--ui-carousel-gap`) on the root, e.g. `className="[--ui-carousel-per-view:2]"`.
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { orientation = 'horizontal', loop = false, autoplay = false, onIndexChange, className, onKeyDown, onMouseEnter, onMouseLeave, onFocus, onBlur, children, ...props },
  ref,
) {
  const c = useCarousel({ orientation, loop, autoplay, onIndexChange });
  const value = useMemo<CarouselContextValue>(
    () => ({
      ...c.state,
      orientation,
      loop,
      scrollTo: c.scrollTo,
      scrollPrev: c.scrollPrev,
      scrollNext: c.scrollNext,
      viewportRef: c.viewportRef,
      contentRef: c.contentRef,
    }),
    [c.state, orientation, loop, c.scrollTo, c.scrollPrev, c.scrollNext, c.viewportRef, c.contentRef],
  );

  return (
    <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          role="region"
          aria-roledescription="carousel"
          className={cn('ui-carousel', className)}
          data-orientation={orientation}
          data-autoplay={c.autoplaying || undefined}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(e);
            c.onKeyDown(e);
          }}
          onMouseEnter={(e) => {
            onMouseEnter?.(e);
            c.pauseProps.onMouseEnter();
          }}
          onMouseLeave={(e) => {
            onMouseLeave?.(e);
            c.pauseProps.onMouseLeave();
          }}
          onFocus={(e) => {
            onFocus?.(e);
            c.pauseProps.onFocus();
          }}
          onBlur={(e) => {
            onBlur?.(e);
            c.pauseProps.onBlur(e);
          }}
          {...props}
        >
          {children}
        </div>
    </CarouselContext.Provider>
  );
});

export interface CarouselContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Class for the scrolling viewport; `className` styles the inner track that holds the slides. */
  viewportClassName?: string;
}

/** The scrolling track. Its direct children must be `CarouselItem`s. */
export const CarouselContent = forwardRef<HTMLDivElement, CarouselContentProps>(function CarouselContent(
  { className, viewportClassName, ...props },
  ref,
) {
  const ctx = useCarouselContext('CarouselContent');
  const setContent = useComposedRefs(ref, ctx.contentRef);
  return (
    <div
      ref={ctx.viewportRef}
      className={cn('ui-carousel-viewport', viewportClassName)}
      // Scrollable regions must be reachable by keyboard (arrows are handled by the carousel)
      tabIndex={0}
    >
      <div ref={setContent} className={cn('ui-carousel-content', className)} data-orientation={ctx.orientation} {...props} />
    </div>
  );
});

export interface CarouselItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Width (height when vertical) as a CSS length, e.g. `"80%"` or `"16rem"`. Default: one slide per view. */
  basis?: string;
}

/** One slide. Labelled "n of m" automatically; pass `aria-label` to name it yourself. */
export const CarouselItem = forwardRef<HTMLDivElement, CarouselItemProps>(function CarouselItem(
  { basis, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn('ui-carousel-item', className)}
      data-custom-label={props['aria-label'] ? '' : undefined}
      style={basis ? ({ ...style, '--ui-carousel-basis': basis } as CSSProperties) : style}
      {...props}
    />
  );
});
