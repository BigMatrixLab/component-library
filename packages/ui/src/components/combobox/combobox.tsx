'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  type ChangeEvent,
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
import { Input, InputAction, InputGroup, type InputProps } from '../input';
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
import { fold, highlightMatch, matchesQuery, nodeText } from '../select/listbox-utils';

interface ComboboxContextValue {
  value: string;
  inputValue: string;
  /** What the person typed since the list opened. Items filter by this, not by `inputValue`. */
  query: string;
  open: boolean;
  disabled: boolean;
  setOpen: (open: boolean) => void;
  openWith: (intent: OpenIntent) => void;
  resolveOpen: () => void;
  /** Close and put the selected label back in the input. */
  cancel: () => void;
  choose: (value: string, text: string) => void;
  clear: () => void;
  typeInto: (text: string) => void;
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

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useComboboxContext(component: string) {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Combobox>.`);
  return ctx;
}

/* -------------------------------------------------------------------------- */

export interface ComboboxProps {
  /** Controlled selected value (`''` means nothing selected). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Controlled text in the input. */
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (inputValue: string) => void;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submitted with the surrounding form under this name (via a hidden input). */
  name?: string;
  form?: string;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * Combobox — type to filter a list, pick one value. The input keeps focus and
 * highlights options with aria-activedescendant (WAI-ARIA combobox with list
 * autocomplete). Filtering ignores case and diacritics.
 */
export function Combobox({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue = '',
  onInputValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  name,
  form,
  disabled = false,
  children,
}: ComboboxProps) {
  const [value, setValue] = useControllableState<string>({ value: valueProp, defaultValue, onChange: onValueChange });
  const [inputValue, setInputValue] = useControllableState<string>({
    value: inputValueProp,
    defaultValue: defaultInputValue,
    onChange: onInputValueChange,
  });
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [query, setQuery] = useControllableState<string>({ defaultValue: '' });
  const id = useId();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const registry = useOptionRegistry();
  const { activeId, activeRef, activate, move, highlight } = useActiveOption(listRef);
  const intent = useRef<OpenIntent>('selected');
  const synced = useRef('');

  const selectedText = value ? (registry.get(value)?.text ?? '') : '';

  // Keep the input text in step with the selected option's label
  useIsomorphicLayoutEffect(() => {
    if (!value) {
      synced.current = '';
      return;
    }
    const entry = registry.get(value);
    if (!entry) return;
    const key = `${value}\u0000${entry.text}`;
    if (synced.current === key) return;
    synced.current = key;
    setInputValue(entry.text);
  }, [value, registry.version]);

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
      // A fresh open shows every option; the query is kept while closing so the list doesn't jump
      if (nextIntent !== 'none') setQuery('');
      setOpen(true);
    },
    [setOpen, setQuery],
  );

  const resolveOpen = useCallback(() => highlight(intent.current), [highlight]);

  const cancel = useCallback(() => {
    setOpen(false);
    setInputValue(selectedText);
  }, [setOpen, setInputValue, selectedText]);

  const choose = useCallback(
    (next: string, text: string) => {
      synced.current = `${next}\u0000${text}`;
      setValue(next);
      setInputValue(text);
      setOpen(false);
      inputRef.current?.focus({ preventScroll: true });
    },
    [setValue, setInputValue, setOpen],
  );

  const clear = useCallback(() => {
    setValue('');
    setInputValue('');
    setOpen(false);
    inputRef.current?.focus({ preventScroll: true });
  }, [setValue, setInputValue, setOpen]);

  const typeInto = useCallback(
    (text: string) => {
      setInputValue(text);
      setQuery(text);
      if (!text && value) setValue('');
      if (!open) openWith('none');
    },
    [setInputValue, setQuery, setValue, value, open, openWith],
  );

  // While filtering, the first match is highlighted so Enter picks it
  useIsomorphicLayoutEffect(() => {
    if (!open || !query.trim()) return;
    const first = getOptions(listRef.current)[0];
    activate(first?.id ?? null, true);
  }, [query, open]);

  return (
    <ComboboxContext.Provider
      value={{
        value,
        inputValue,
        query,
        open,
        disabled,
        setOpen,
        openWith,
        resolveOpen,
        cancel,
        choose,
        clear,
        typeInto,
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
      {name && <input type="hidden" name={name} value={value} form={form} disabled={disabled} />}
    </ComboboxContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

export interface ComboboxInputProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'role' | 'type' | 'name'> {
  /** Show a clear (x) button while a value is selected. */
  clearable?: boolean;
  /** Show the chevron button that toggles the list. Default true. */
  showTrigger?: boolean;
  /** Class for the bordered group around the input. */
  groupClassName?: string;
}

const keepFocus = (e: MouseEvent) => e.preventDefault();

/** The text field. Typing filters the list; ArrowDown opens it. */
export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(function ComboboxInput(
  {
    size = 'md',
    clearable = false,
    showTrigger = true,
    groupClassName,
    className,
    onChange,
    onKeyDown,
    onClick,
    onBlur,
    disabled,
    ...props
  },
  forwardedRef,
) {
  const ctx = useComboboxContext('ComboboxInput');
  const field = useFieldControl({ disabled });
  const isDisabled = Boolean(field.disabled || ctx.disabled);
  const ref = useComposedRefs(forwardedRef, ctx.inputRef);

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
        } else if (ctx.inputValue || ctx.value) {
          e.preventDefault();
          ctx.clear();
        }
        return;
    }
  };

  return (
    <InputGroup ref={ctx.anchorRef} size={size} className={groupClassName}>
      <Input
        {...props}
        ref={ref}
        size={size}
        role="combobox"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={ctx.open}
        aria-controls={ctx.open ? ctx.listId : undefined}
        aria-activedescendant={ctx.open && ctx.activeId ? ctx.activeId : undefined}
        disabled={isDisabled}
        value={ctx.inputValue}
        className={className}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange?.(e);
          if (!e.defaultPrevented) ctx.typeInto(e.target.value);
        }}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented && !ctx.open && !isDisabled) ctx.openWith('selected');
        }}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          onBlur?.(e);
          if (ctx.open) ctx.cancel();
        }}
      />
      {clearable && ctx.value && !isDisabled && (
        <InputAction aria-label="Clear" tabIndex={-1} onMouseDown={keepFocus} onClick={ctx.clear}>
          <Icon name="x" />
        </InputAction>
      )}
      {showTrigger && (
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
      )}
    </InputGroup>
  );
});

/* -------------------------------------------------------------------------- */

export interface ComboboxContentProps
  extends Omit<ListboxContentProps, 'open' | 'anchorRef' | 'listId' | 'listRef' | 'onOpened' | 'multiselectable' | 'header'> {}

/** The floating list. Put items, groups and `ComboboxEmpty` inside. */
export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(function ComboboxContent(
  { 'aria-labelledby': labelledBy, ...props },
  forwardedRef,
) {
  const ctx = useComboboxContext('ComboboxContent');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, panelRef);

  useDismiss(ctx.open, [panelRef, ctx.anchorRef], () => ctx.cancel(), { escape: false });

  return (
    <ListboxContent
      ref={ref}
      open={ctx.open}
      anchorRef={ctx.anchorRef}
      listId={ctx.listId}
      listRef={ctx.listRef}
      onOpened={ctx.resolveOpen}
      aria-labelledby={labelledBy ?? (ctx.inputRef.current?.id || undefined)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export interface ComboboxItemProps
  extends Omit<ListboxOptionProps, 'optionId' | 'selected' | 'highlighted' | 'onChoose' | 'onActivate' | 'value' | 'indicator'> {
  /** The value this option stands for. Must be unique and non-empty. */
  value: string;
  /** Plain text to filter and show in the input when `children` isn't text. */
  textValue?: string;
}

/** One option. Hidden while it doesn't match what was typed; text children get the match highlighted. */
export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(function ComboboxItem(
  { value, disabled, textValue, children, ...props },
  ref,
) {
  const ctx = useComboboxContext('ComboboxItem');
  const id = useId();
  const text = textValue ?? nodeText(children);
  useRegisterOption(ctx.registry, value, text, children, disabled);
  if (!matchesQuery(text, ctx.query)) return null;
  return (
    <ListboxOption
      {...props}
      ref={ref}
      optionId={id}
      value={value}
      selected={ctx.value === value}
      highlighted={ctx.activeId === id}
      disabled={disabled}
      onChoose={() => ctx.choose(value, text)}
      onActivate={() => ctx.activate(id)}
    >
      {typeof children === 'string' ? highlightMatch(children, ctx.query) : children}
    </ListboxOption>
  );
});

/* -------------------------------------------------------------------------- */

export interface ComboboxCreateProps
  extends Omit<ListboxOptionProps, 'optionId' | 'selected' | 'highlighted' | 'onChoose' | 'onActivate' | 'value' | 'indicator' | 'children'> {
  /** Called with the typed text when it is chosen. Add the option in your state; the value becomes the text. */
  onCreate: (text: string) => void;
  /** Label for the row. Default: Create “text”. */
  children?: ReactNode | ((text: string) => ReactNode);
}

/** A “Create …” row. It appears only when the typed text doesn't exactly match an existing option. */
export const ComboboxCreate = forwardRef<HTMLDivElement, ComboboxCreateProps>(function ComboboxCreate(
  { onCreate, children, className, ...props },
  ref,
) {
  const ctx = useComboboxContext('ComboboxCreate');
  const id = useId();
  const text = ctx.query.trim();
  if (!text) return null;
  const folded = fold(text).out;
  if (ctx.registry.entries().some((entry) => fold(entry.text).out === folded)) return null;
  return (
    <ListboxOption
      {...props}
      ref={ref}
      optionId={id}
      value={`__create__:${text}`}
      selected={false}
      highlighted={ctx.activeId === id}
      indicator="none"
      className={cn('ui-combobox-create', className)}
      onChoose={() => {
        onCreate(text);
        ctx.choose(text, text);
      }}
      onActivate={() => ctx.activate(id)}
    >
      <Icon name="plus" className="ui-combobox-create-icon" />
      {typeof children === 'function' ? children(text) : (children ?? <>Create “{text}”</>)}
    </ListboxOption>
  );
});

/** “No results” text; shows only while nothing matches. */
export const ComboboxEmpty = ListboxEmpty;
/** A labelled set of options: `<ComboboxGroup label="Europe">…</ComboboxGroup>`. Hides when none of its options match. */
export const ComboboxGroup = ListboxGroup;
/** A group heading, as a child of <ComboboxGroup>. */
export const ComboboxLabel = ListboxLabel;
/** A divider between groups. */
export const ComboboxSeparator = ListboxSeparator;
