'use client';

import { forwardRef, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { clamp, keyToValue, nearestThumb, pointerToRatio, ratioToValue, sameValues, setThumbValue, valueToRatio } from './slider-math';

export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderTooltip = 'auto' | 'always' | 'never';

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Thumb values (controlled). One number is a single slider, two is a range. */
  value?: number[];
  /** Initial values when uncontrolled. Default `[min]`. */
  defaultValue?: number[];
  /** Called on every change while dragging or using the keyboard. */
  onValueChange?: (value: number[]) => void;
  /** Called once when a drag ends or a key press changes the value. Use it to save. */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Minimum distance between range thumbs, in steps. Default 0. */
  minStepsBetweenThumbs?: number;
  /** `vertical` needs a height (default 12rem); value 0 sits at the bottom. */
  orientation?: SliderOrientation;
  disabled?: boolean;
  /** Form field name; one hidden input per thumb. */
  name?: string;
  /** Text for the tooltip and `aria-valuetext`, e.g. `(v) => '$' + v`. */
  formatValue?: (value: number) => string;
  /** Accessible names per thumb in a range. Default "Minimum" / "Maximum". */
  thumbLabels?: string[];
  /** Value bubble: `auto` shows it while dragging or focused with the keyboard. */
  tooltip?: SliderTooltip;
}

const defaultFormat = (v: number) => String(v);

/**
 * Slider — single value or range, built on pointer events with pointer
 * capture. Thumbs are `role="slider"` and follow the WAI-ARIA slider
 * (and multi-thumb slider) pattern. Controlled or uncontrolled.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    orientation = 'horizontal',
    disabled,
    name,
    formatValue = defaultFormat,
    thumbLabels,
    tooltip = 'auto',
    className,
    style,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    ...props
  },
  ref,
) {
  const [raw, setRaw] = useControllableState<number[]>({ value, defaultValue: defaultValue ?? [min], onChange: onValueChange });
  const values = raw.map((v) => clamp(v, min, max));
  const multi = values.length > 1;
  const vertical = orientation === 'vertical';
  const opts = { min, max, step, minStepsBetweenThumbs };

  const rootRef = useRef<HTMLDivElement>(null);
  const composed = useComposedRefs(ref, rootRef);
  const thumbs = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef<{ index: number; offset: number; pointerId: number } | null>(null);
  const latest = useRef(values);
  latest.current = values;
  const [dragging, setDragging] = useState<number | null>(null);

  const change = (next: number[]) => {
    if (!sameValues(next, latest.current)) setRaw(next);
  };

  const moveTo = (index: number, clientX: number, clientY: number, offset: number) => {
    const root = rootRef.current;
    const thumb = thumbs.current[index];
    if (!root || !thumb) return;
    const rect = root.getBoundingClientRect();
    const ratio = pointerToRatio({
      pointer: vertical ? clientY : clientX,
      trackStart: vertical ? rect.top : rect.left,
      trackLength: vertical ? rect.height : rect.width,
      thumbSize: vertical ? thumb.offsetHeight : thumb.offsetWidth,
      vertical,
      grabOffset: offset,
    });
    change(setThumbValue(latest.current, index, ratioToValue(ratio, min, max), opts));
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(e);
    if (disabled || e.defaultPrevented || e.button !== 0) return;
    const root = rootRef.current;
    if (!root) return;
    const onThumb = (e.target as Element).closest<HTMLElement>('.ui-slider-thumb');
    let index = onThumb ? thumbs.current.indexOf(onThumb as HTMLDivElement) : -1;
    let offset = 0;
    if (index >= 0 && onThumb) {
      // Grabbed a thumb: keep the grab point so it does not jump under the pointer
      const box = onThumb.getBoundingClientRect();
      offset = vertical ? e.clientY - (box.top + box.height / 2) : e.clientX - (box.left + box.width / 2);
    } else {
      const rect = root.getBoundingClientRect();
      const thumbSize = (vertical ? thumbs.current[0]?.offsetHeight : thumbs.current[0]?.offsetWidth) ?? 0;
      const ratio = pointerToRatio({
        pointer: vertical ? e.clientY : e.clientX,
        trackStart: vertical ? rect.top : rect.left,
        trackLength: vertical ? rect.height : rect.width,
        thumbSize,
        vertical,
      });
      index = nearestThumb(latest.current, ratioToValue(ratio, min, max));
    }
    try {
      root.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic pointers cannot be captured */
    }
    drag.current = { index, offset, pointerId: e.pointerId };
    setDragging(index);
    thumbs.current[index]?.focus({ preventScroll: true });
    moveTo(index, e.clientX, e.clientY, offset);
    if (e.pointerType === 'mouse') e.preventDefault();
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    const d = drag.current;
    if (d && d.pointerId === e.pointerId) moveTo(d.index, e.clientX, e.clientY, d.offset);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragging(null);
    try {
      rootRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    onValueCommit?.(latest.current);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (disabled || e.altKey || e.ctrlKey || e.metaKey) return;
    const gap = minStepsBetweenThumbs * step;
    const target = keyToValue(e.key, values[index]!, {
      min,
      max,
      step,
      lowerBound: index > 0 ? values[index - 1]! + gap : min,
      upperBound: index < values.length - 1 ? values[index + 1]! - gap : max,
    });
    if (target === undefined) return;
    e.preventDefault();
    const next = setThumbValue(values, index, target, opts);
    if (next !== values) {
      change(next);
      onValueCommit?.(next);
    }
  };

  const gapSteps = minStepsBetweenThumbs * step;
  const fillStart = multi ? valueToRatio(values[0]!, min, max) : 0;
  const fillEnd = valueToRatio(values[values.length - 1]!, min, max);

  return (
    <div
      ref={composed}
      role={multi ? 'group' : undefined}
      aria-label={multi ? ariaLabel : undefined}
      aria-labelledby={multi ? labelledBy : undefined}
      data-orientation={orientation}
      data-disabled={disabled ? '' : undefined}
      data-dragging={dragging !== null ? '' : undefined}
      data-tooltip={tooltip}
      className={cn('ui-slider', className)}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => {
        onPointerUp?.(e);
        endDrag(e);
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e);
        endDrag(e);
      }}
      {...props}
    >
      <div className="ui-slider-track" aria-hidden="true">
        <div className="ui-slider-range" data-single={multi ? undefined : ''} style={{ '--ui-p-start': fillStart, '--ui-p-end': fillEnd } as CSSProperties} />
      </div>
      {values.map((v, i) => {
        const label = multi ? (thumbLabels?.[i] ?? (values.length === 2 ? (i === 0 ? 'Minimum' : 'Maximum') : `Value ${i + 1}`)) : ariaLabel;
        const text = formatValue(v);
        return (
          <div
            key={i}
            ref={(el) => {
              thumbs.current[i] = el;
            }}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-labelledby={multi ? undefined : labelledBy}
            aria-orientation={orientation}
            aria-valuemin={i > 0 ? values[i - 1]! + gapSteps : min}
            aria-valuemax={i < values.length - 1 ? values[i + 1]! - gapSteps : max}
            aria-valuenow={v}
            aria-valuetext={text}
            aria-disabled={disabled || undefined}
            data-dragging={dragging === i ? '' : undefined}
            className="ui-slider-thumb"
            style={{ '--ui-p': valueToRatio(v, min, max) } as CSSProperties}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {tooltip !== 'never' && (
              <span className="ui-slider-tooltip" aria-hidden="true">
                {text}
              </span>
            )}
          </div>
        );
      })}
      {name && !disabled && values.map((v, i) => <input key={i} type="hidden" name={name} value={v} />)}
    </div>
  );
});
