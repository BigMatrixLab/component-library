'use client';

import { forwardRef, useRef, type HTMLAttributes, type Ref } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useScrollArea } from './use-scroll-area';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Which axes scroll. Default `vertical`. */
  orientation?: ScrollAreaOrientation;
  /**
   * Accessible name of the scrollable region. Keyboard users reach it with Tab and scroll it with the
   * arrow keys, so it needs a name. Default "Scrollable content".
   */
  label?: string;
  /** Fade the edges that have more content beyond them (only while the content overflows). Default `true`. */
  fade?: boolean;
  /** Show the thumbs `always`, or only while hovering, focusing or scrolling (`hover`). Default `hover`. */
  scrollbar?: 'hover' | 'always';
  /** Class for the scrolling viewport (the root takes `className`, e.g. a height). */
  viewportClassName?: string;
  /** Ref to the scrolling element, e.g. to call `scrollTo`. */
  viewportRef?: Ref<HTMLDivElement>;
}

/**
 * ScrollArea — native scrolling with slim overlay thumbs and edge fades.
 * The browser still does the scrolling (wheel, touch, trackpad, keyboard, find-in-page); the thumbs are
 * a draggable view of its position. Give the root a height (`h-80`) or a `max-h-*`.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    orientation = 'vertical',
    label = 'Scrollable content',
    fade = true,
    scrollbar = 'hover',
    viewportClassName,
    viewportRef: viewportRefProp,
    className,
    children,
    ...props
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const setRoot = useComposedRefs(ref, rootRef);
  const setViewport = useComposedRefs(viewportRefProp, viewportRef);
  const area = useScrollArea({ rootRef, viewportRef, fade });
  const vertical = orientation !== 'horizontal';
  const horizontal = orientation !== 'vertical';

  return (
    <div
      ref={setRoot}
      className={cn('ui-scroll-area', className)}
      data-orientation={orientation}
      data-scrollbar={scrollbar}
      {...props}
    >
      <div
        ref={setViewport}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn('ui-scroll-area-viewport', viewportClassName)}
      >
        <div className="ui-scroll-area-content">{children}</div>
      </div>
      {vertical && (
        <div
          ref={area.y.track}
          className="ui-scroll-area-track"
          data-orientation="vertical"
          aria-hidden="true"
          onPointerDown={area.onTrackPointerDown('y')}
        >
          <div
            ref={area.y.thumb}
            className="ui-scroll-area-thumb"
            onPointerDown={area.onThumbPointerDown('y')}
            onPointerMove={area.onThumbPointerMove}
            onPointerUp={area.endDrag}
            onPointerCancel={area.endDrag}
          />
        </div>
      )}
      {horizontal && (
        <div
          ref={area.x.track}
          className="ui-scroll-area-track"
          data-orientation="horizontal"
          aria-hidden="true"
          onPointerDown={area.onTrackPointerDown('x')}
        >
          <div
            ref={area.x.thumb}
            className="ui-scroll-area-thumb"
            onPointerDown={area.onThumbPointerDown('x')}
            onPointerMove={area.onThumbPointerMove}
            onPointerUp={area.endDrag}
            onPointerCancel={area.endDrag}
          />
        </div>
      )}
    </div>
  );
});
