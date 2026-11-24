'use client';

import type { KeyboardEvent } from 'react';
import { useRovingFocus } from '../../hooks/use-roving-focus';
import { formatTimeLabel, nearestTimeIndex, timeToSeconds } from './time-utils';

export interface TimeListProps {
  /** "HH:mm" options, ascending. */
  options: string[];
  value: string | null;
  locale: string;
  hour12: boolean;
  seconds: boolean;
  label: string;
  onSelect: (value: string) => void;
}

/** CSS selector of the option that gets focus when the list opens. */
export const TIME_LIST_FOCUS = '.ui-timepicker-option[tabindex="0"]';

/** Scroll the list so the focused option sits in the middle (no page scroll). */
export function centerTimeOption(panel: HTMLElement) {
  const list = panel.querySelector<HTMLElement>('.ui-timepicker-list');
  const option = list?.querySelector<HTMLElement>(TIME_LIST_FOCUS);
  if (!list || !option) return;
  list.scrollTop = Math.max(0, option.offsetTop - (list.clientHeight - option.offsetHeight) / 2);
}

/**
 * The popover list of times: a listbox with one option per step. The chosen
 * time is selected; when the value sits between steps, the last step before it
 * is marked as current. Arrow keys, Home and End move; Enter or Space picks.
 */
export function TimeList({ options, value, locale, hour12, seconds, label, onSelect }: TimeListProps) {
  const onKeyDown = useRovingFocus({ itemSelector: '[role="option"]', orientation: 'vertical', loop: false, typeahead: false });
  const current = nearestTimeIndex(options, value);
  const target = timeToSeconds(value);

  return (
    <div role="listbox" aria-label={label} className="ui-timepicker-list" onKeyDown={onKeyDown}>
      {options.map((option, i) => {
        const selected = target !== null && timeToSeconds(option) === target;
        return (
          <div
            key={option}
            role="option"
            aria-selected={selected}
            tabIndex={i === current ? 0 : -1}
            className="ui-timepicker-option"
            data-current={(i === current && value !== null) || undefined}
            onClick={() => onSelect(option)}
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(option);
              }
            }}
          >
            {formatTimeLabel(option, locale, hour12, seconds)}
          </div>
        );
      })}
    </div>
  );
}
