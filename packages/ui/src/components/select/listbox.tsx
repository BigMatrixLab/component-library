'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import type { Placement } from '../../lib/position';
import { Icon } from '../../icons/icon';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { usePresence } from '../../hooks/use-presence';
import { FloatingContent } from '../popover/floating-content';
import { fold } from './listbox-utils';

/* Shared listbox logic for Select, Combobox and MultiSelect ------------------
   Options are plain elements with role="option"; the keyboard owner (a button
   or an input) keeps DOM focus and points at the active option through
   aria-activedescendant. Options register their text so the closed control can
   still show a label (the list is rendered hidden while closed). */

/* -------------------------------------------------------------------------- */
/* Option registry                                                            */

export interface OptionEntry {
  value: string;
  text: string;
  node: ReactNode;
  disabled?: boolean;
}

export interface OptionRegistry {
  register: (entry: OptionEntry) => () => void;
  /** Keep the rendered label of an already registered option fresh (no re-render). */
  update: (value: string, node: ReactNode) => void;
  get: (value: string) => OptionEntry | undefined;
  entries: () => OptionEntry[];
  /** Changes whenever an option appears, disappears or changes its text. */
  version: number;
}

export function useOptionRegistry(): OptionRegistry {
  const map = useRef(new Map<string, { entry: OptionEntry; count: number }>());
  const [version, setVersion] = useState(0);

  const register = useCallback((entry: OptionEntry) => {
    const current = map.current.get(entry.value);
    if (current) {
      current.count += 1;
      current.entry = entry;
    } else {
      map.current.set(entry.value, { entry, count: 1 });
    }
    setVersion((v) => v + 1);
    return () => {
      const c = map.current.get(entry.value);
      if (!c) return;
      c.count -= 1;
      if (c.count <= 0) map.current.delete(entry.value);
      setVersion((v) => v + 1);
    };
  }, []);

  const update = useCallback((value: string, node: ReactNode) => {
    const c = map.current.get(value);
    if (c) c.entry = { ...c.entry, node };
  }, []);
  const get = useCallback((value: string) => map.current.get(value)?.entry, []);
  const entries = useCallback(() => Array.from(map.current.values(), (c) => c.entry), []);

  return useMemo(() => ({ register, update, get, entries, version }), [register, update, get, entries, version]);
}

/** Register an option's label with the root so a closed control can display it. */
export function useRegisterOption(
  registry: OptionRegistry,
  value: string,
  text: string,
  node: ReactNode,
  disabled: boolean | undefined,
) {
  const { register, update } = registry;
  useIsomorphicLayoutEffect(() => register({ value, text, node, disabled }), [register, value, text, disabled]);
  useIsomorphicLayoutEffect(() => {
    update(value, node);
  });
}

/* -------------------------------------------------------------------------- */
/* Options in the DOM, active option, typeahead                               */

/** The enabled options inside a list, in document order. */
export function getOptions(list: HTMLElement | null): HTMLElement[] {
  if (!list) return [];
  return Array.from(list.querySelectorAll<HTMLElement>('[role="option"]')).filter(
    (el) => el.getAttribute('aria-disabled') !== 'true',
  );
}

/** Scroll the list (never the page) so `el` is fully visible. */
export function scrollOptionIntoView(el: HTMLElement) {
  const list = el.closest<HTMLElement>('[data-ui-listbox-scroll]');
  if (!list) return;
  if (getOptions(list)[0] === el) {
    list.scrollTop = 0;
    return;
  }
  const l = list.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const pad = 4;
  if (r.top < l.top + pad) list.scrollTop -= l.top + pad - r.top;
  else if (r.bottom > l.bottom - pad) list.scrollTop += r.bottom - (l.bottom - pad);
}

export type OptionTarget = 'next' | 'prev' | 'first' | 'last' | 'pageDown' | 'pageUp';

/** Which option gets highlighted when a list opens. */
export type OpenIntent = 'none' | 'selected' | 'selected-first' | 'selected-last' | 'first' | 'last';

/** The id of the highlighted option, plus keyboard movement through the list. */
export function useActiveOption(listRef: RefObject<HTMLElement | null>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const scrollRef = useRef(false);

  const activate = useCallback((id: string | null, scroll = false) => {
    activeRef.current = id;
    scrollRef.current = scroll;
    setActiveId(id);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!activeId || !scrollRef.current) return;
    scrollRef.current = false;
    const el = document.getElementById(activeId);
    if (el) scrollOptionIntoView(el);
  }, [activeId]);

  const move = useCallback(
    (target: OptionTarget) => {
      const options = getOptions(listRef.current);
      if (!options.length) return null;
      const index = options.findIndex((o) => o.id === activeRef.current);
      const last = options.length - 1;
      let next: number;
      switch (target) {
        case 'first':
          next = 0;
          break;
        case 'last':
          next = last;
          break;
        case 'next':
          next = index < 0 ? 0 : Math.min(last, index + 1);
          break;
        case 'prev':
          next = index < 0 ? last : Math.max(0, index - 1);
          break;
        case 'pageDown':
          next = index < 0 ? 0 : Math.min(last, index + 10);
          break;
        default:
          next = index < 0 ? last : Math.max(0, index - 10);
      }
      const option = options[next];
      if (option) activate(option.id, true);
      return option ?? null;
    },
    [listRef, activate],
  );

  /** Highlight the option an `intent` points at. Call once the list is rendered. */
  const highlight = useCallback(
    (intent: OpenIntent) => {
      const options = getOptions(listRef.current);
      const selected = options.find((o) => o.getAttribute('aria-selected') === 'true');
      let target: HTMLElement | undefined;
      switch (intent) {
        case 'first':
          target = options[0];
          break;
        case 'last':
          target = options[options.length - 1];
          break;
        case 'selected':
          target = selected;
          break;
        case 'selected-first':
          target = selected ?? options[0];
          break;
        case 'selected-last':
          target = selected ?? options[options.length - 1];
          break;
        default:
          return;
      }
      if (target) activate(target.id, true);
    },
    [listRef, activate],
  );

  return { activeId, activeRef, activate, move, highlight };
}

/** Accumulates typed characters for 500ms. */
export function useTypeahead() {
  const buffer = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const type = useCallback((char: string) => {
    clearTimeout(timer.current);
    buffer.current += char.toLowerCase();
    timer.current = setTimeout(() => {
      buffer.current = '';
    }, 500);
    return buffer.current;
  }, []);
  const pending = useCallback(() => buffer.current, []);
  return { type, pending };
}

/** The option whose text starts with `buffer`, searching on from the active one. */
export function findByText(list: HTMLElement | null, activeId: string | null, buffer: string): HTMLElement | undefined {
  const options = getOptions(list);
  if (!options.length) return undefined;
  const q = fold(buffer).out;
  const first = q[0] ?? '';
  const repeated = q.length > 1 && [...q].every((c) => c === first);
  const needle = repeated ? first : q;
  const index = options.findIndex((o) => o.id === activeId);
  const start = index < 0 ? 0 : needle.length === 1 ? index + 1 : index;
  for (let i = 0; i < options.length; i++) {
    const option = options[(start + i) % options.length];
    if (option && fold(option.textContent ?? '').out.trimStart().startsWith(needle)) return option;
  }
  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Content                                                                    */

interface ListboxMeta {
  /** False when the list has no options (all filtered out): show an empty state. */
  hasOptions: boolean;
}
const ListboxMetaContext = createContext<ListboxMeta>({ hasOptions: true });

export function useListboxMeta() {
  return useContext(ListboxMetaContext);
}

export interface ListboxContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'id'> {
  open: boolean;
  anchorRef: RefObject<Element | null>;
  /** id of the element with role="listbox". */
  listId: string;
  listRef: RefObject<HTMLDivElement | null>;
  /** Content above the list (not part of the listbox), e.g. a selection summary. */
  header?: ReactNode;
  multiselectable?: boolean;
  placement?: Placement;
  offset?: number;
  matchWidth?: boolean;
  /** Runs once when the list has opened and is positioned. */
  onOpened?: () => void;
}

/**
 * The floating panel: a top-layer FloatingContent holding a scrollable
 * role="listbox". Pressing inside it never steals focus from the trigger or
 * input. While closed the options render in a hidden node so their labels stay
 * known to the root.
 */
export const ListboxContent = forwardRef<HTMLDivElement, ListboxContentProps>(function ListboxContent(
  {
    open,
    anchorRef,
    listId,
    listRef,
    header,
    multiselectable,
    placement = 'bottom-start',
    offset = 6,
    matchWidth = true,
    onOpened,
    className,
    children,
    onMouseDown,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    ...props
  },
  forwardedRef,
) {
  const presence = usePresence<HTMLDivElement>(open);
  const ref = useComposedRefs(forwardedRef, presence.ref);
  const [hasOptions, setHasOptions] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (list) setHasOptions(list.querySelector('[role="option"]') !== null);
  });

  const meta = useMemo(() => ({ hasOptions }), [hasOptions]);

  return (
    <>
      <FloatingContent
        ref={ref}
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={offset}
        matchWidth={matchWidth}
        className={cn('ui-listbox', className)}
        onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
          onMouseDown?.(e);
          e.preventDefault();
        }}
        onOpened={() => onOpened?.()}
        {...props}
      >
        {header}
        <div
          ref={listRef}
          id={listId}
          role={hasOptions ? 'listbox' : undefined}
          aria-multiselectable={multiselectable || undefined}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          data-ui-listbox-scroll=""
          className="ui-listbox-scroll"
        >
          <ListboxMetaContext.Provider value={meta}>{children}</ListboxMetaContext.Provider>
        </div>
      </FloatingContent>
      {!presence.mounted && (
        <div hidden>
          <ListboxMetaContext.Provider value={meta}>{children}</ListboxMetaContext.Provider>
        </div>
      )}
    </>
  );
});

/* -------------------------------------------------------------------------- */
/* Option                                                                     */

export interface ListboxOptionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'id'> {
  optionId: string;
  value: string;
  selected: boolean;
  highlighted: boolean;
  disabled?: boolean;
  /** `check` shows a tick on the right; `checkbox` a box on the left; `none` nothing. */
  indicator?: 'check' | 'checkbox' | 'none';
  /** Pointer or keyboard chose this option. */
  onChoose: () => void;
  /** Pointer moved over this option: highlight it. */
  onActivate: () => void;
}

/** A single role="option" row. Never focusable: the owner keeps focus. */
export const ListboxOption = forwardRef<HTMLDivElement, ListboxOptionProps>(function ListboxOption(
  {
    optionId,
    value,
    selected,
    highlighted,
    disabled,
    indicator = 'check',
    onChoose,
    onActivate,
    className,
    children,
    onClick,
    onPointerMove,
    ...props
  },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      id={optionId}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-value={value}
      data-state={selected ? 'checked' : 'unchecked'}
      data-highlighted={highlighted ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={cn('ui-option', indicator === 'checkbox' && 'ui-option-with-box', className)}
      onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(e);
        if (e.defaultPrevented || disabled || e.pointerType === 'touch' || highlighted) return;
        onActivate();
      }}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) onChoose();
      }}
    >
      {indicator === 'checkbox' && (
        <span className="ui-option-box" aria-hidden="true">
          <Icon name="check" size={12} strokeWidth={2.5} />
        </span>
      )}
      <span className="ui-option-label">{children}</span>
      {indicator === 'check' && (
        <span className="ui-option-check" aria-hidden="true">
          <Icon name="check" />
        </span>
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Group, label, separator, empty                                             */

const GroupContext = createContext<{ labelId: string; setHasLabel: (v: boolean) => void } | null>(null);

/** A group heading. Not selectable. */
export const ListboxLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ListboxLabel(
  { className, ...props },
  ref,
) {
  const group = useContext(GroupContext);
  const setHasLabel = group?.setHasLabel;
  useIsomorphicLayoutEffect(() => {
    setHasLabel?.(true);
    return () => setHasLabel?.(false);
  }, [setHasLabel]);
  return <div ref={ref} id={group?.labelId} className={cn('ui-listbox-label', className)} {...props} />;
});

export interface ListboxGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Heading for the group. Or render a label component as a child. */
  label?: ReactNode;
}

/** A labelled set of options. It hides itself when all its options are filtered out. */
export const ListboxGroup = forwardRef<HTMLDivElement, ListboxGroupProps>(function ListboxGroup(
  { label, className, children, ...props },
  ref,
) {
  const labelId = useId();
  const [hasLabel, setHasLabel] = useState(false);
  const ctx = useMemo(() => ({ labelId, setHasLabel }), [labelId]);
  return (
    <GroupContext.Provider value={ctx}>
      <div
        ref={ref}
        role="group"
        aria-labelledby={hasLabel ? labelId : undefined}
        className={cn('ui-listbox-group', className)}
        {...props}
      >
        {label != null && <ListboxLabel>{label}</ListboxLabel>}
        {children}
      </div>
    </GroupContext.Provider>
  );
});

/** A thin divider between groups. Decorative. */
export const ListboxSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ListboxSeparator(
  { className, ...props },
  ref,
) {
  return <div ref={ref} aria-hidden="true" className={cn('ui-listbox-separator', className)} {...props} />;
});

/** "No results" text. Shows only while the list has no options. */
export const ListboxEmpty = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ListboxEmpty(
  { className, children, ...props },
  ref,
) {
  const { hasOptions } = useListboxMeta();
  if (hasOptions) return null;
  return (
    <div ref={ref} className={cn('ui-listbox-empty', className)} {...props}>
      {children ?? 'No results found.'}
    </div>
  );
});
