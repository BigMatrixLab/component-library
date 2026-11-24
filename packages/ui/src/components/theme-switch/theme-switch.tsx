'use client';

import { forwardRef, useRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { prefersReducedMotion } from '../../lib/dom';
import { useIndicator } from '../../hooks/use-indicator';
import { Icon, type IconName } from '../../icons/icon';
import { useTheme, type ThemeMode } from '../../theme/use-theme';

export type ThemeSwitchSize = 'sm' | 'md';

export interface ThemeSwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Reveal the new theme as a circle growing from the clicked option, using the
   * View Transitions API. Falls back to an instant swap where it is unsupported
   * and under `prefers-reduced-motion`. Default true.
   */
  reveal?: boolean;
  /** 28px (`md`, default) or 24px options. Touch screens always get 36px. */
  size?: ThemeSwitchSize;
  /** Accessible name of the group. Default "Theme". */
  label?: string;
}

const OPTIONS: { value: ThemeMode; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
];

interface ViewTransitionLike {
  ready: Promise<unknown>;
  finished: Promise<unknown>;
}
type DocumentWithTransitions = { startViewTransition?: (update: () => void) => ViewTransitionLike };

const REVEAL_MS = 520;
const REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * ThemeSwitch — light / dark / system as three icons with a gliding pill.
 * Reads and writes the theme through useTheme(). Choosing a theme can reveal
 * it as a circle that grows from the clicked option (View Transitions API).
 */
export const ThemeSwitch = forwardRef<HTMLDivElement, ThemeSwitchProps>(function ThemeSwitch(
  { reveal = true, size = 'md', label = 'Theme', className, onKeyDown, ...props },
  ref,
) {
  const { mode, setMode } = useTheme();
  const listRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, listRef);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useIndicator(listRef, '[role="radio"][aria-checked="true"]', mode);

  const choose = (next: ThemeMode, origin: { x: number; y: number }) => {
    if (next === mode) return;
    const doc = document as unknown as DocumentWithTransitions;
    if (!reveal || typeof doc.startViewTransition !== 'function' || prefersReducedMotion()) {
      setMode(next);
      return;
    }
    const root = document.documentElement;
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    root.setAttribute('data-ui-reveal', '');
    const transition = doc.startViewTransition(() => setMode(next));
    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
          {
            duration: REVEAL_MS,
            easing: REVEAL_EASING,
            pseudoElement: '::view-transition-new(root)',
          } as KeyframeAnimationOptions,
        );
      })
      .catch(() => undefined);
    transition.finished.then(
      () => root.removeAttribute('data-ui-reveal'),
      () => root.removeAttribute('data-ui-reveal'),
    );
  };

  const centerOf = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  const handleClick = (value: ThemeMode, e: MouseEvent<HTMLButtonElement>) => {
    // Keyboard activation reports 0,0 — reveal from the button instead
    const origin = e.detail === 0 ? centerOf(e.currentTarget) : { x: e.clientX, y: e.clientY };
    choose(value, origin);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const current = OPTIONS.findIndex((o) => o.value === mode);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (current + 1) % OPTIONS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (current - 1 + OPTIONS.length) % OPTIONS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = OPTIONS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const el = itemRefs.current[next];
    if (!el) return;
    el.focus();
    choose(OPTIONS[next]!.value, centerOf(el));
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      {...props}
      ref={composedRef}
      className={cn('ui-theme-switch', size === 'sm' && 'ui-theme-switch-sm', className)}
      onKeyDown={handleKeyDown}
    >
      <span className="ui-theme-switch-pill" aria-hidden="true" />
      {OPTIONS.map((option, i) => {
        const checked = option.value === mode;
        return (
          <button
            key={option.value}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.label}
            title={option.label}
            tabIndex={checked ? 0 : -1}
            className="ui-theme-switch-item"
            onClick={(e) => handleClick(option.value, e)}
          >
            <Icon name={option.icon} size={size === 'sm' ? 14 : 16} />
          </button>
        );
      })}
    </div>
  );
});
