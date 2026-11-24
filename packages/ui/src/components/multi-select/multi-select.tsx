'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useDismiss } from '../../hooks/use-dismiss';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { Icon } from '../../icons/icon';
import { useFieldControl } from '../field/field-context';
import { InputAction, InputGroup, type InputSize } from '../input';
import {
  ListboxContent,
  ListboxEmpty,
  ListboxGroup,
  ListboxLabel,
  ListboxOption,
  ListboxSeparator,
  getOptions,
  useActiveOption,
  useOptionRegistry,
  useRegisterOption,
  type ListboxContentProps,
  type ListboxOptionProps,
  type OpenIntent,
  type OptionRegistry,
} from '../select/listbox';
import { highlightMatch, matchesQuery, nodeText } from '../select/listbox-utils';

interface MultiSelectContextValue {
  values: string[];
  max: number | undefined;
  full: boolean;
  /** Text in the search input. */
  text: string;
  /** What filters the list (kept while closing so the list doesn't jump). */
  query: string;
  open: boolean;
  disabled: boolean;
  setOpen: (open: boolean) => void;
  openWith: (intent: OpenIntent) => void;
  resolveOpen: () => void;
  cancel: () => void;
  toggle: (value: string) => void;
  remove: (value: string) => void;
  clear: () => void;
  typeInto: (text: string) => void;
  clearText: () => void;
  anchorRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
  listId: string;
  registry: OptionRegistry;
  activeId: string | null;
  activeRef: RefObject<string | null>;
  activate: (id: string | null, scroll?: boolean) => void;
  move: ReturnType<typeof useActiveOption>['move'];
}

const MultiSelectContext = createContext<MultiSelectContextValue | null>(null);

function useMultiSelectContext(component: string) {
  const ctx = useContext(MultiSelectContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <MultiSelect>.`);
  return ctx;
}

/* -------------------------------------------------------------------------- */

export interface MultiSelectProps {
  /** Controlled selected values. */
  value?: string[];
  /** Initial values when uncontrolled. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Most values that can be selected. Other options turn disabled once reached. */
  max?: number;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submitted with the form: one hidden input per value, all under this name. */
  name?: string;
  form?: string;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * MultiSelect — pick several values. Selected values show as removable chips
 * in the field; the list beside them filters as you type and keeps its options
 * checked (WAI-ARIA combobox with a multiselectable listbox).
 */
export function MultiSelect({
  value: valueProp,
  defaultValue,
  onValueChange,
  max,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  name,
  form,
  disabled = false,
  children,
}: MultiSelectProps) {
  const [values, setValues] = useControllableState<string[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [text, setText] = useControllableState<string>({ defaultValue: '' });
  const [query, setQuery] = useControllableState<string>({ defaultValue: '' });
  const id = useId();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const registry = useOptionRegistry();
  const { activeId, activeRef, activate, move, highlight } = useActiveOption(listRef);
  const intent = useRef<OpenIntent>('selected');
  const full = max !== undefined && values.length >= max;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (!next) activate(null);
    },
    [setOpenState, activate],
  );

  const openWith = useCallback(
    (nextIntent: OpenIntent) => {
      intent.current = nextIntent;
      if (nextIntent !== 'none') setQuery('');
      setOpen(true);
    },
    [setOpen, setQuery],
  );

  const resolveOpen = useCallback(() => highlight(intent.current), [highlight]);

  const cancel = useCallback(() => {
    setOpen(false);
    setText('');
  }, [setOpen, setText]);

  const toggle = useCallback(
    (v: string) => {
      setValues((prev) => {
        if (prev.includes(v)) return prev.filter((x) => x !== v);
        if (max !== undefined && prev.length >= max) return prev;
        return [...prev, v];
      });
      setText('');
      setQuery('');
      inputRef.current?.focus({ preventScroll: true });
    },
    [setValues, setText, setQuery, max],
  );

  const remove = useCallback((v: string) => setValues((prev) => prev.filter((x) => x !== v)), [setValues]);

  const clear = useCallback(() => {
    setValues([]);
    inputRef.current?.focus({ preventScroll: true });
  }, [setValues]);

  const typeInto = useCallback(
    (next: string) => {
      setText(next);
      setQuery(next);
      if (!open) {
        intent.current = 'none';
        setOpen(true);
      }
    },
    [setText, setQuery, open, setOpen],
  );

  const clearText = useCallback(() => {
    setText('');
    setQuery('');
  }, [setText, setQuery]);

  // While filtering, the first match is highlighted so Enter picks it
  useIsomorphicLayoutEffect(() => {
    if (!open || !query.trim()) return;
    const first = getOptions(listRef.current)[0];
    activate(first?.id ?? null, true);
  }, [query, open]);

  return (
    <MultiSelectContext.Provider
      value={{
        values,
        max,
        full,
        text,
        query,
        open,
        disabled,
        setOpen,
        openWith,
        resolveOpen,
        cancel,
        toggle,
        remove,
        clear,
        typeInto,
        clearText,
        anchorRef,
        inputRef,
        listRef,
        listId: `${id}-list`,
        registry,
        activeId,
        activeRef,
        activate,
        move,
      }}
    >
      {children}
      {name &&
        values.map((v) => <input key={v} type="hidden" name={name} value={v} form={form} disabled={disabled} />)}
    </MultiSelectContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

export interface MultiSelectInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'type' | 'role' | 'name'> {
  /** Height of one row: 32 / 36 / 44px. Default `md`. */
  size?: InputSize;
  /** Chips shown before the rest collapse into a “+n more” pill. Default 3. */
  maxChips?: number;
  /** Class for the bordered field around the chips and the input. */
  groupClassName?: string;
}

const keepFocus = (e: MouseEvent) => e.preventDefault();

/** The field: removable chips, a search input and a chevron. */
export const MultiSelectInput = forwardRef<HTMLInputElement, MultiSelectInputProps>(function MultiSelectInput(
  {
    size = 'md',
    maxChips = 3,
    groupClassName,
    className,
    placeholder,
    id,
    required,
    disabled,
    onChange,
    onKeyDown,
    onBlur,
    ...props
  },
  forwardedRef,
) {
  const ctx = useMultiSelectContext('MultiSelectInput');
  const control = useFieldControl({
    id,
    required,
    disabled,
    'aria-describedby': props['aria-describedby'],
    'aria-invalid': props['aria-invalid'],
  });
  const ref = useComposedRefs(forwardedRef, ctx.inputRef);
  const isDisabled = Boolean(control.disabled || ctx.disabled);
  const invalid = control['aria-invalid'] === true || control['aria-invalid'] === 'true';
  const shown = ctx.values.slice(0, Math.max(0, maxChips));
  const hidden = ctx.values.length - shown.length;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || isDisabled || e.nativeEvent.isComposing) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (ctx.open) ctx.move('next');
        else ctx.openWith('selected-first');
        return;
      case 'ArrowUp':
        e.preventDefault();
        if (ctx.open) ctx.move('prev');
        else ctx.openWith('selected-last');
        return;
      case 'PageDown':
        if (ctx.open) {
          e.preventDefault();
          ctx.move('pageDown');
        }
        return;
      case 'PageUp':
        if (ctx.open) {
          e.preventDefault();
          ctx.move('pageUp');
        }
        return;
      case 'Enter':
        if (ctx.open) {
          // Never submit the form while the list is open
          e.preventDefault();
          if (ctx.activeRef.current) document.getElementById(ctx.activeRef.current)?.click();
        }
        return;
      case 'Escape':
        if (ctx.open) {
          e.preventDefault();
          ctx.cancel();
        } else if (ctx.text) {
          e.preventDefault();
          ctx.clearText();
        }
        return;
      case 'Backspace': {
        const last = ctx.values[ctx.values.length - 1];
        if (e.currentTarget.value === '' && last !== undefined) {
          e.preventDefault();
          ctx.remove(last);
        }
        return;
      }
    }
  };

  return (
    <InputGroup
      ref={ctx.anchorRef}
      size={size}
      className={cn('ui-multi-select-control', groupClassName)}
      data-invalid={invalid ? '' : undefined}
      data-disabled={isDisabled ? '' : undefined}
      data-state={ctx.open ? 'open' : 'closed'}
      onClick={(e) => {
        if (isDisabled || ctx.open || (e.target as HTMLElement).closest('button')) return;
        ctx.openWith('selected');
      }}
    >
      <div className="ui-multi-select-chips">
        {shown.map((v) => {
          const entry = ctx.registry.get(v);
          return (
            <span key={v} className="ui-multi-select-chip" data-value={v}>
              <span className="ui-multi-select-chip-label">{entry?.node ?? v}</span>
              <button
                type="button"
                tabIndex={-1}
                disabled={isDisabled}
                aria-label={`Remove ${entry?.text || v}`}
                className="ui-multi-select-chip-remove"
                onMouseDown={keepFocus}
                onClick={() => {
                  ctx.remove(v);
                  ctx.inputRef.current?.focus({ preventScroll: true });
                }}
              >
                <Icon name="x" size={12} strokeWidth={2} />
              </button>
            </span>
          );
        })}
        {hidden > 0 && <span className="ui-multi-select-chip ui-multi-select-more">{`+${hidden} more`}</span>}
        <input
          {...props}
          ref={ref}
          id={control.id}
          role="combobox"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={ctx.open}
          aria-controls={ctx.open ? ctx.listId : undefined}
          aria-activedescendant={ctx.open && ctx.activeId ? ctx.activeId : undefined}
          aria-describedby={control['aria-describedby']}
          aria-invalid={control['aria-invalid']}
          aria-required={control.required || undefined}
          disabled={isDisabled}
          placeholder={ctx.values.length ? undefined : placeholder}
          value={ctx.text}
          className={cn('ui-multi-select-input', className)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            if (!e.defaultPrevented) ctx.typeInto(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            onBlur?.(e);
            if (ctx.open) ctx.cancel();
          }}
        />
      </div>
      <InputAction
        aria-label="Show options"
        aria-expanded={ctx.open}
        tabIndex={-1}
        disabled={isDisabled}
        onMouseDown={keepFocus}
        onClick={() => {
          ctx.inputRef.current?.focus({ preventScroll: true });
          if (ctx.open) ctx.cancel();
          else ctx.openWith('selected');
        }}
      >
        <Icon name="chevron-down" className="ui-combobox-chevron" />
      </InputAction>
    </InputGroup>
  );
});

/* -------------------------------------------------------------------------- */

export interface MultiSelectContentProps
  extends Omit<ListboxContentProps, 'open' | 'anchorRef' | 'listId' | 'listRef' | 'onOpened' | 'multiselectable' | 'header'> {}

/** The floating list, with an “n selected” summary and a Clear all button above the options. */
export const MultiSelectContent = forwardRef<HTMLDivElement, MultiSelectContentProps>(function MultiSelectContent(
  { 'aria-labelledby': labelledBy, ...props },
  forwardedRef,
) {
  const ctx = useMultiSelectContext('MultiSelectContent');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, panelRef);
  const count = ctx.values.length;

  useDismiss(ctx.open, [panelRef, ctx.anchorRef], () => ctx.cancel(), { escape: false });

  const header =
    count > 0 || ctx.max !== undefined ? (
      <div className="ui-multi-select-status">
        <span role="status" className="ui-multi-select-count">
          {`${count} selected${ctx.max !== undefined ? ` of ${ctx.max}` : ''}`}
        </span>
        {count > 0 && (
          <button type="button" tabIndex={-1} className="ui-multi-select-clear" onClick={ctx.clear}>
            Clear all
          </button>
        )}
      </div>
    ) : null;

  return (
    <ListboxContent
      ref={ref}
      open={ctx.open}
      anchorRef={ctx.anchorRef}
      listId={ctx.listId}
      listRef={ctx.listRef}
      multiselectable
      header={header}
      onOpened={ctx.resolveOpen}
      aria-labelledby={labelledBy ?? (ctx.inputRef.current?.id || undefined)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export interface MultiSelectItemProps
  extends Omit<ListboxOptionProps, 'optionId' | 'selected' | 'highlighted' | 'onChoose' | 'onActivate' | 'value' | 'indicator'> {
  /** The value this option stands for. Must be unique and non-empty. */
  value: string;
  /** Plain text to filter and name the chip when `children` isn't text. */
  textValue?: string;
}

/** One option with a checkbox. Choosing it toggles the value and keeps the list open. */
export const MultiSelectItem = forwardRef<HTMLDivElement, MultiSelectItemProps>(function MultiSelectItem(
  { value, disabled, textValue, children, ...props },
  ref,
) {
  const ctx = useMultiSelectContext('MultiSelectItem');
  const id = useId();
  const text = textValue ?? nodeText(children);
  useRegisterOption(ctx.registry, value, text, children, disabled);
  if (!matchesQuery(text, ctx.query)) return null;
  const selected = ctx.values.includes(value);
  return (
    <ListboxOption
      {...props}
      ref={ref}
      optionId={id}
      value={value}
      selected={selected}
      highlighted={ctx.activeId === id}
      disabled={disabled || (ctx.full && !selected)}
      indicator="checkbox"
      onChoose={() => ctx.toggle(value)}
      onActivate={() => ctx.activate(id)}
    >
      {typeof children === 'string' ? highlightMatch(children, ctx.query) : children}
    </ListboxOption>
  );
});

/** “No results” text; shows only while nothing matches. */
export const MultiSelectEmpty = ListboxEmpty;
/** A labelled set of options. Hides when none of its options match. */
export const MultiSelectGroup = ListboxGroup;
/** A group heading, as a child of <MultiSelectGroup>. */
export const MultiSelectLabel = ListboxLabel;
/** A divider between groups. */
export const MultiSelectSeparator = ListboxSeparator;
