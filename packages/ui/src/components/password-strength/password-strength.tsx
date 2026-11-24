'use client';

import { forwardRef, useEffect, useMemo, useRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons/icon';
import {
  defaultPasswordRequirements,
  scorePassword,
  type PasswordRequirement,
  type PasswordStrengthLevel,
} from './password-score';

export type PasswordStrengthLabels = Partial<Record<Exclude<PasswordStrengthLevel, 'empty'>, string>>;

const DEFAULT_LABELS: Required<PasswordStrengthLabels> = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };
const SEGMENTS = [1, 2, 3, 4] as const;

export interface PasswordStrengthProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The password being typed. Scored on every render with `scorePassword`. */
  value: string;
  /** The checklist. Default: 8+ characters, upper and lower case, a number, a symbol. */
  requirements?: readonly PasswordRequirement[];
  /** Words for each level. Default Weak / Fair / Good / Strong. */
  labels?: PasswordStrengthLabels;
  /** Show the requirement checklist. Default `true`. */
  showChecklist?: boolean;
  /** Show the level word beside the meter (also the polite live region). Default `true`. */
  showLabel?: boolean;
  /** Accessible name of the meter. Default "Password strength". */
  meterLabel?: string;
}

/**
 * PasswordStrength — a 4-segment meter and a requirement checklist that follow a password as it is
 * typed. Place it under the input and point the input's `aria-describedby` at this element's `id`.
 * Segments fill in order on the smooth spring (staggered from the last score); met requirements tick
 * with a snappy pop. The level word is announced politely only when it changes.
 */
export const PasswordStrength = forwardRef<HTMLDivElement, PasswordStrengthProps>(function PasswordStrength(
  {
    value,
    requirements = defaultPasswordRequirements,
    labels,
    showChecklist = true,
    showLabel = true,
    meterLabel = 'Password strength',
    className,
    ...props
  },
  ref,
) {
  const result = useMemo(() => scorePassword(value, requirements), [value, requirements]);
  const { score, level } = result;
  const words = { ...DEFAULT_LABELS, ...labels };
  const word = level === 'empty' ? '' : words[level];

  // Stagger relative to the previous score, so only the segments that change wait their turn
  const previous = useRef(score);
  const from = previous.current;
  useEffect(() => {
    previous.current = score;
  });
  const order = (i: number) => {
    if (score > from && i > from && i <= score) return i - from - 1;
    if (score < from && i > score && i <= from) return from - i;
    return 0;
  };

  return (
    <div ref={ref} className={cn('ui-password-strength', className)} data-level={level} data-score={score} {...props}>
      <div className="ui-password-strength-header">
        <div
          className="ui-password-strength-meter"
          role="meter"
          aria-label={meterLabel}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={score}
          aria-valuetext={word || 'Empty'}
        >
          {SEGMENTS.map((i) => (
            <span
              key={i}
              className="ui-password-strength-segment"
              data-filled={i <= score ? '' : undefined}
              style={{ '--ui-i': order(i) } as CSSProperties}
            />
          ))}
        </div>
        {showLabel && (
          <span className="ui-password-strength-label" aria-live="polite" aria-atomic="true">
            {word}
          </span>
        )}
      </div>
      {showChecklist && result.requirements.length > 0 && (
        <ul className="ui-password-strength-checklist" aria-label="Password requirements">
          {result.requirements.map((r) => (
            <li key={r.id} className="ui-password-strength-requirement" data-id={r.id} data-met={r.met ? '' : undefined}>
              <span className="ui-password-strength-mark" aria-hidden="true">
                <Icon name="check" size={10} strokeWidth={3} />
              </span>
              <span className="ui-password-strength-sr">{r.met ? 'Met: ' : 'Not met: '}</span>
              <span className="ui-password-strength-text">{r.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
