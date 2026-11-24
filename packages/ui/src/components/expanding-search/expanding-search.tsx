'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { usePresence } from '../../hooks/use-presence';
import { Icon } from '../../icons/icon';
import { Kbd } from '../kbd/kbd';

export type ExpandingSearchSize = 'sm' | 'md' | 'lg';

export interface ExpandingSearchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'onSubmit' | 'results'> {
  /** Controlled query. */
  value?: string;
  /** Initial query when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Controlled expanded state. */
  open?: boolean;
  /** Initial expanded state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Input placeholder. Default "Search". */
  placeholder?: string;
  /** Accessible name of the button and the field. Default "Search". */
  label?: string;
  /** Expanded width: a number of px or any CSS length. Default 280. */
  width?: number | string;
  /** Height: 32 / 36 / 44px. Default `md`. */
  size?: ExpandingSearchSize;
  /** Press ⌘K (Ctrl K on Windows and Linux) to expand and focus. Default false. */
  shortcut?: boolean;
  /** Enter pressed in the field. */
  onSubmit?: (value: string) => void;
  /** Panel shown below the field while it is open and has a query (results, suggestions). */
  results?: ReactNode;
}

/**
 * ExpandingSearch — an icon button that grows into a search field. The width
 * springs open (smooth, no overshoot), the input takes focus, and it folds back
 * on blur when empty or on Esc. An optional results slot opens beneath it.
 */
export const ExpandingSearch = forwardRef<HTMLDivElement, ExpandingSearchProps>(function ExpandingSearch(
  {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placeholder = 'Search',
    label = 'Search',
    width = 280,
    size = 'md',
    shortcut = false,
    onSubmit,
    results,
    className,
    style,
    onBlur,
    onKeyDown,
    ...props
  },
  ref,
) {
  const [open, setOpen] = useControllableState<boolean>({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [value, setValue] = useControllableState<string>({ value: valueProp, defaultValue, onChange: onValueChange });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const focusAfterOpen = useRef(false);
  const resultsId = useId();
  const [modLabel, setModLabel] = useState<string | null>(null);

  const showResults = open && value.length > 0 && results != null && results !== false;
  const presence = usePresence<HTMLDivElement>(showResults);

  useEffect(() => {
    if (!open || !focusAfterOpen.current) return;
    focusAfterOpen.current = false;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!shortcut) return;
    const mac = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
    setModLabel(mac ? '⌘K' : 'Ctrl K');
  }, [shortcut]);

  const reveal = () => {
    if (open) {
      inputRef.current?.focus();
      return;
    }
    focusAfterOpen.current = true;
    setOpen(true);
  };
  const revealRef = useRef(reveal);
  revealRef.current = reveal;

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        revealRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcut]);

  const collapse = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || !open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (value) setValue('');
      collapse(true);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    onBlur?.(e);
    if (!open || value) return;
    const next = e.relatedTarget as Node | null;
    if (next && rootRef.current?.contains(next)) return;
    collapse(false);
  };

  const rootStyle = {
    ...style,
    '--ui-xsearch-w': typeof width === 'number' ? `${width}px` : width,
  } as CSSProperties;

  return (
    <div
      role="search"
      {...props}
      ref={composedRef}
      className={cn('ui-xsearch', size !== 'md' && `ui-xsearch-${size}`, className)}
      style={rootStyle}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <div className="ui-xsearch-field" data-state={open ? 'open' : 'closed'}>
        <button
          ref={toggleRef}
          type="button"
          className="ui-xsearch-toggle"
          aria-label={label}
          aria-expanded={open}
          tabIndex={open ? -1 : 0}
          onMouseDown={(e) => {
            // While open, keep the focus in the field so the blur-collapse never races the click
            if (open) e.preventDefault();
          }}
          onClick={reveal}
        >
          <Icon name="search" size={16} />
        </button>
        <input
          ref={inputRef}
          type="search"
          className="ui-xsearch-input"
          value={value}
          placeholder={placeholder}
          aria-label={label}
          aria-controls={presence.mounted ? resultsId : undefined}
          tabIndex={open ? 0 : -1}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) onSubmit?.(value);
          }}
        />
        {open && value && (
          <button
            type="button"
            className="ui-xsearch-clear"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setValue('');
              inputRef.current?.focus();
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}
        {open && !value && shortcut && modLabel && (
          <Kbd size="sm" className="ui-xsearch-hint" aria-hidden="true">
            {modLabel}
          </Kbd>
        )}
      </div>
      {presence.mounted && (
        <div id={resultsId} ref={presence.ref} className="ui-xsearch-results" data-state={presence.state}>
          {results}
        </div>
      )}
    </div>
  );
});
