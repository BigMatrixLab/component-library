'use client';

import { forwardRef, useCallback, useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Required: the person's name. Pass `alt=""` only when the name is shown next to the avatar. */
  alt: string;
}

/**
 * The picture. Renders nothing if it fails to load, so `AvatarFallback`
 * underneath shows instead. Also copes with an image that failed before
 * hydration (server-rendered markup never fires `onError`).
 */
export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(function AvatarImage(
  { className, src, onLoad, onError, alt, ...props },
  forwardedRef,
) {
  // Keyed by src, so a new src starts a fresh attempt without an effect
  const [result, setResult] = useState<{ src?: AvatarImageProps['src']; state: 'loading' | 'loaded' | 'error' }>({ state: 'loading' });
  const state = result.src === src ? result.state : 'loading';
  const setState = (next: 'loaded' | 'error') => setResult({ src, state: next });

  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (typeof forwardedRef === 'function') forwardedRef(img);
      else if (forwardedRef) forwardedRef.current = img;
      if (img?.complete) setState(img.naturalWidth > 0 ? 'loaded' : 'error');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forwardedRef, src],
  );

  if (!src || state === 'error') return null;
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      data-state={state}
      className={cn('ui-avatar-image', className)}
      onLoad={(e) => {
        setState('loaded');
        onLoad?.(e);
      }}
      onError={(e) => {
        setState('error');
        onError?.(e);
      }}
      {...props}
    />
  );
});
