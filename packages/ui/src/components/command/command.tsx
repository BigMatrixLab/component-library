'use client';

import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { Icon } from '../../icons/icon';
import { Kbd, KbdGroup } from '../kbd/kbd';
import { commandScore } from './command-filter';
import {
  CommandContext,
  CommandGroupContext,
  textOf,
  useCommandContext,
  useVisibleCount,
  visualOptions,
  type CommandFilter,
} from './command-context';

/* -------------------------------------------------------------------------- */

export interface CommandProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled search text. */
  search?: string;
  /** Initial search text when uncontrolled. */
  defaultSearch?: string;
  /** Called when the search text changes. */
  onSearchChange?: (search: string) => void;
  /** Filter and rank items by the search. Set false to filter yourself (async results). Default true. */
  shouldFilter?: boolean;
  /** Custom scorer: return 0 to hide an item, higher to rank it first. */
  filter?: CommandFilter;
  /** Accessible name of the whole palette. */
  label?: string;
  /** Called after an item runs. */
  onItemSelect?: (value: string) => void;
}

/**
 * Command — a searchable list of actions. The input keeps focus; arrows move
 * a highlight through the list (aria-activedescendant) and Enter runs it.
 * Items are filtered and ranked: prefix, then word start, then substring,
 * with keywords counting too.
 */
export const Command = forwardRef<HTMLDivElement, CommandProps>(function Command(
  {
    search: searchProp,
    defaultSearch = '',
    onSearchChange,
    shouldFilter = true,
    filter = commandScore,
    label,
    onItemSelect,
    className,
    onKeyDown,
    ...props
  },
  forwardedRef,
) {
  const [search, setSearch] = useControllableState({ value: searchProp, defaultValue: defaultSearch, onChange: onSearchChange });
  const [activeId, setActiveId] = useControllableState<string | null>({ defaultValue: null });
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, rootRef);
  const { count, register } = useVisibleCount();
  const prevSearch = useRef(search);
  const scrollNext = useRef(false);

  const searching = search.trim() !== '';
  const empty = searching && count === 0;

  // After every render: a new search highlights the top match; a vanished item is replaced
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const options = visualOptions(root);
    if (prevSearch.current !== search) {
      prevSearch.current = search;
      const list = root.querySelector<HTMLElement>('[data-command-list]');
      if (list) list.scrollTop = 0;
      // The best match overall (groups sit in DOM order, so the first row is not always it)
      const best = options.reduce<HTMLElement | undefined>(
        (top, el) => (!top || Number(el.dataset.score ?? 0) > Number(top.dataset.score ?? 0) ? el : top),
        undefined,
      );
      setActiveId(best?.id ?? null);
    } else if (!activeId || !options.some((el) => el.id === activeId)) {
      setActiveId(options[0]?.id ?? null);
    }
  });

  // Keyboard moves keep the highlight in view; hover moves don't scroll
  useEffect(() => {
    if (!activeId || !scrollNext.current) return;
    scrollNext.current = false;
    document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      shouldFilter,
      filter,
      listId: `${id}-list`,
      inputId: `${id}-input`,
      activeId,
      setActiveId,
      register,
      empty,
      onItemSelect,
    }),
    [search, setSearch, shouldFilter, filter, id, activeId, setActiveId, register, empty, onItemSelect],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.nativeEvent.isComposing) return;
    const root = rootRef.current;
    if (!root) return;
    const target = e.target as HTMLElement;
    if (e.key === 'Enter') {
      // Enter belongs to buttons and links inside the palette; elsewhere it runs the highlight
      if (target.closest('button, a')) return;
      const el = activeId ? document.getElementById(activeId) : null;
      if (el) {
        e.preventDefault();
        el.click();
      }
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const options = visualOptions(root);
    if (!options.length) return;
    e.preventDefault();
    const i = options.findIndex((el) => el.id === activeId);
    let next: HTMLElement | undefined;
    if (e.key === 'Home') next = options[0];
    else if (e.key === 'End') next = options[options.length - 1];
    else if (e.key === 'ArrowDown') next = options[(i + 1) % options.length];
    else next = options[(i <= 0 ? options.length : i) - 1];
    scrollNext.current = true;
    setActiveId(next?.id ?? null);
  };

  return (
    <CommandContext.Provider value={value}>
      <div
        ref={ref}
        role={label ? 'group' : undefined}
        aria-label={label}
        className={cn('ui-command', className)}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </CommandContext.Provider>
  );
});

/* -------------------------------------------------------------------------- */

export interface CommandInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'type'> {
  /** Class for the wrapper that holds the icon and the field. */
  wrapperClassName?: string;
}

/** The search field, with a search icon. */
export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput(
  { className, wrapperClassName, onChange, placeholder = 'Type a command or search…', ...props },
  ref,
) {
  const ctx = useCommandContext('CommandInput');
  return (
    <div className={cn('ui-command-input-wrap', wrapperClassName)}>
      <Icon name="search" className="ui-command-input-icon" />
      <input
        ref={ref}
        id={ctx.inputId}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-autocomplete="list"
        aria-controls={ctx.empty ? undefined : ctx.listId}
        aria-activedescendant={ctx.activeId ?? undefined}
        aria-label={props['aria-label'] ?? placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-autofocus=""
        placeholder={placeholder}
        value={ctx.search}
        className={cn('ui-command-input', className)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange?.(e);
          ctx.setSearch(e.target.value);
        }}
        {...props}
      />
    </div>
  );
});

/* -------------------------------------------------------------------------- */

export interface CommandListProps extends HTMLAttributes<HTMLDivElement> {}

/** Scrolling list of groups and items. Put `CommandEmpty` inside it. */
export const CommandList = forwardRef<HTMLDivElement, CommandListProps>(function CommandList(
  { className, onMouseDown, ...props },
  ref,
) {
  const ctx = useCommandContext('CommandList');
  return (
    <div
      ref={ref}
      id={ctx.listId}
      // With nothing to choose, the empty message is not a listbox (a listbox needs options)
      role={ctx.empty ? undefined : 'listbox'}
      aria-label={ctx.empty ? undefined : (props['aria-label'] ?? 'Suggestions')}
      data-command-list=""
      className={cn('ui-command-list', className)}
      onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
        onMouseDown?.(e);
        // Keep focus in the input when an item is pressed
        if (!e.defaultPrevented) e.preventDefault();
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export interface CommandEmptyProps extends HTMLAttributes<HTMLDivElement> {}

/** Shown when a search leaves no item. */
export const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(function CommandEmpty(
  { className, children = 'No results found.', ...props },
  ref,
) {
  const ctx = useCommandContext('CommandEmpty');
  if (!ctx.empty) return null;
  return (
    <div ref={ref} role="status" className={cn('ui-command-empty', className)} {...props}>
      {children}
    </div>
  );
});

/* -------------------------------------------------------------------------- */

export interface CommandGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'heading'> {
  /** Small label above the group. */
  heading?: ReactNode;
}

/** A labelled group of items. It hides itself when a search leaves it empty. */
export const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(function CommandGroup(
  { heading, className, children, ...props },
  ref,
) {
  const ctx = useCommandContext('CommandGroup');
  const id = useId();
  const { count, register } = useVisibleCount();
  const group = useMemo(() => ({ register }), [register]);
  const hidden = ctx.search.trim() !== '' && count === 0;
  return (
    <CommandGroupContext.Provider value={group}>
      <div
        ref={ref}
        role="group"
        aria-labelledby={heading != null ? `${id}-heading` : undefined}
        hidden={hidden}
        className={cn('ui-command-group', className)}
        {...props}
      >
        {heading != null && (
          <div id={`${id}-heading`} aria-hidden="true" className="ui-command-heading">
            {heading}
          </div>
        )}
        {children}
      </div>
    </CommandGroupContext.Provider>
  );
});

/* -------------------------------------------------------------------------- */

export interface CommandItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** What the search matches against. Defaults to the item's text. */
  value?: string;
  /** Extra words that find this item ("dark mode" for Appearance). */
  keywords?: string[];
  /** Leading icon (16px). */
  icon?: ReactNode;
  /** Shortcut hint on the right: a string such as "⌘K" becomes key caps, or pass your own node. */
  shortcut?: ReactNode;
  disabled?: boolean;
  /** Runs when the item is chosen (click or Enter). */
  onSelect?: (value: string) => void;
}

/** One selectable result. */
export const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(function CommandItem(
  { value, keywords, icon, shortcut, disabled, onSelect, onClick, onPointerMove, className, style, children, ...props },
  ref,
) {
  const ctx = useCommandContext('CommandItem');
  const group = useContext(CommandGroupContext);
  const id = useId();
  const text = value ?? textOf(children);
  const searching = ctx.shouldFilter && ctx.search.trim() !== '';
  const score = searching ? ctx.filter(text, ctx.search, keywords ?? []) : 1;
  const visible = score > 0;
  const { register } = ctx;
  const registerGroup = group?.register;

  useIsomorphicLayoutEffect(() => {
    if (!visible) return;
    const a = register(id);
    const b = registerGroup?.(id);
    return () => {
      a();
      b?.();
    };
  }, [visible, id, register, registerGroup]);

  const select = useCallback(() => {
    onSelect?.(text);
    ctx.onItemSelect?.(text);
  }, [onSelect, ctx, text]);

  if (!visible) return null;
  const active = ctx.activeId === id;

  return (
    <div
      ref={ref}
      id={id}
      role="option"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-selected={active ? '' : undefined}
      data-score={searching ? score : undefined}
      data-disabled={disabled ? '' : undefined}
      className={cn('ui-command-item', className)}
      // Better matches float to the top of their group
      style={searching ? { order: -score, ...style } : style}
      onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(e);
        if (e.pointerType !== 'touch' && !disabled && !active) ctx.setActiveId(id);
      }}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) select();
      }}
      {...props}
    >
      {icon != null && <span className="ui-command-icon">{icon}</span>}
      <span className="ui-command-label">{children}</span>
      {shortcut != null && (
        <span className="ui-command-shortcut">
          {typeof shortcut === 'string' ? (
            <KbdGroup>
              {Array.from(shortcut.replace(/\s+/g, '')).map((key, i) => (
                <Kbd key={i} size="sm">
                  {key}
                </Kbd>
              ))}
            </KbdGroup>
          ) : (
            shortcut
          )}
        </span>
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------- */

/** A hairline between groups. Hidden while a search is typed. */
export const CommandSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CommandSeparator(
  { className, ...props },
  ref,
) {
  const ctx = useCommandContext('CommandSeparator');
  if (ctx.search.trim() !== '') return null;
  return <div ref={ref} role="separator" className={cn('ui-command-separator', className)} {...props} />;
});

/** Key hints along the bottom edge: "↑↓ navigate  ↵ select  esc close". */
export const CommandFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CommandFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-command-footer', className)} {...props} />;
});
