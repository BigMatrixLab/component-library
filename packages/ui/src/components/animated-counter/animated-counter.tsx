'use client';

import { forwardRef, useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { buildNumberCells, localizedDigits, numberText } from './number-parts';

export interface AnimatedNumberProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The number to show. Changing it rolls each changed digit to its new value. */
  value: number;
  /** Intl.NumberFormat options: `{ style: 'currency', currency: 'USD' }`, `{ notation: 'compact' }`… */
  format?: Intl.NumberFormatOptions;
  /** BCP 47 locale. Default `en-US` (fixed, so server and client render the same). */
  locale?: string;
  /** Static text before the number (not animated), e.g. "+". */
  prefix?: string;
  /** Static text after the number (not animated), e.g. " users". */
  suffix?: string;
  /** Start every digit at 0 and roll to the value when the number first scrolls into view. */
  animateOnView?: boolean;
}

/**
 * AnimatedNumber — digits that roll. Each digit is a column of 0–9 that slides to the new digit on
 * the morph spring; the width stays steady (tabular figures, one cell per character) and symbols and
 * separators come from Intl, so any locale or currency works. Reduced motion changes instantly.
 * Screen readers get the plain formatted text.
 */
export const AnimatedNumber = forwardRef<HTMLSpanElement, AnimatedNumberProps>(function AnimatedNumber(
  { value, format, locale = 'en-US', prefix, suffix, animateOnView = false, className, ...props },
  forwardedRef,
) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const ref = useComposedRefs(forwardedRef, rootRef);
  const [ready, setReady] = useState(!animateOnView);

  useEffect(() => {
    if (ready) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  const formatKey = format ? JSON.stringify(format) : '';
  const digits = useMemo(() => localizedDigits(locale), [locale]);
  const { cells, text } = useMemo(() => {
    let parts: Intl.NumberFormatPart[];
    try {
      parts = new Intl.NumberFormat(locale, format).formatToParts(value);
    } catch {
      parts = [{ type: 'integer', value: String(value) }];
    }
    return { cells: buildNumberCells(parts, digits), text: numberText(parts) };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `format` is tracked through formatKey
  }, [value, locale, formatKey, digits]);

  // Cells that were not there on the previous render get an entrance
  const previous = useRef<Set<string> | null>(null);
  const entering = new Set<string>();
  if (previous.current) for (const cell of cells) if (!previous.current.has(cell.key)) entering.add(cell.key);
  useEffect(() => {
    previous.current = new Set(cells.map((c) => c.key));
  });

  return (
    <span ref={ref} className={cn('ui-number', className)} data-ready={ready ? '' : undefined} {...props}>
      <span className="ui-number-sr">{`${prefix ?? ''}${text}${suffix ?? ''}`}</span>
      <span className="ui-number-visual" aria-hidden="true">
        {prefix ? <span className="ui-number-symbol">{prefix}</span> : null}
        {cells.map((cell) =>
          cell.kind === 'digit' ? (
            <span key={cell.key} className="ui-number-digit" data-enter={entering.has(cell.key) ? '' : undefined}>
              <span className="ui-number-reel" style={{ '--ui-digit': ready ? cell.digit : 0 } as CSSProperties}>
                {digits.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={cell.key} className="ui-number-symbol" data-type={cell.type} data-enter={entering.has(cell.key) ? '' : undefined}>
              {cell.text}
            </span>
          ),
        )}
        {suffix ? <span className="ui-number-symbol">{suffix}</span> : null}
      </span>
    </span>
  );
});
