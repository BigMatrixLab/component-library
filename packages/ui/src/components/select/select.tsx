'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useDismiss } from '../../hooks/use-dismiss';
import { Icon } from '../../icons/icon';
import { useFieldControl } from '../field/field-context';
import {
  ListboxContent,
  ListboxGroup,
  ListboxLabel,
  ListboxOption,
  ListboxSeparator,
  findByText,
  useActiveOption,
  useOptionRegistry,
  useRegisterOption,
  useTypeahead,
  type ListboxContentProps,
  type ListboxOptionProps,
  type OpenIntent,
  type OptionRegistry,
} from './listbox';
import { nodeText } from './listbox-utils';

interface SelectContextValue {
  value: string;
  choose: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Open the list and highlight an option once it has rendered. */
  openWith: (intent: OpenIntent, typed?: string) => void;
  resolveOpen: () => void;
  disabled: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
  listId: string;
  registry: OptionRegistry;
  activeId: string | null;
  activeRef: MutableRefObject<string | null>;
  activate: (id: string | null, scroll?: boolean) => void;
  move: ReturnType<typeof useActiveOption>['move'];
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Select>.`);
  return ctx;
}

/* -------------------------------------------------------------------------- */

export interface SelectProps {
  /** Controlled value (`''` means nothing selected). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submitted with the surrounding form under this name (via a hidden input). */
  name?: string;
  /** Associate the hidden input with a form by id. */
  form?: string;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * Select — a styled single choice list. The trigger is a button with
 * role="combobox" (the WAI-ARIA select-only combobox pattern); options live in
 * a floating listbox and are highlighted with aria-activedescendant, so DOM
 * focus never leaves the trigger.
 */
export function Select({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  name,
  form,
  disabled = false,
  children,
}: SelectProps) {
  const [value, setValue] = useControllableState<string>({ value: valueProp, defaultValue, onChange: onValueChange });
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const registry = useOptionRegistry();
  const { activeId, activeRef, activate, move, highlight } = useActiveOption(listRef);
  const intent = useRef<OpenIntent>('selected');
  const typed = useRef('');

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (!next) activate(null);
    },
    [setOpenState, activate],
  );

  const openWith = useCallback(
    (nextIntent: OpenIntent, typedText = '') => {
      intent.current = nextIntent;
      typed.current = typedText;
      setOpen(true);
    },
    [setOpen],
  );

  const resolveOpen = useCallback(() => {
    if (typed.current) {
      const match = findByText(listRef.current, null, typed.current);
      typed.current = '';
      if (match) {
        activate(match.id, true);
        return;
      }
    }
    highlight(intent.current);
  }, [activate, highlight]);

  const choose = useCallback(
    (next: string) => {
      setValue(next);
      setOpen(false);
      // Safari and Firefox don't focus a button on click: keep focus on the trigger explicitly
      triggerRef.current?.focus({ preventScroll: true });
    },
    [setValue, setOpen],
  );

  return (
    <SelectContext.Provider
      value={{
        value,
        choose,
        open,
        setOpen,
        openWith,
        resolveOpen,
        disabled,
        triggerRef,
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
    </SelectContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Height: 32 / 36 / 44px. Default `md`. */
  size?: SelectSize;
  /** Text shown while nothing is selected (when you don't pass your own children). */
  placeholder?: string;
  /** Required for form validation styling and `aria-required`. */
  required?: boolean;
}

/** The control that shows the current value and opens the list. Looks like <Input>. */
export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
  { size = 'md', placeholder, className, children, id, required, disabled, onClick, onKeyDown, onKeyUp, onBlur, ...props },
  forwardedRef,
) {
  const ctx = useSelectContext('SelectTrigger');
  const control = useFieldControl({
    id,
    required,
    disabled,
    'aria-describedby': props['aria-describedby'],
    'aria-invalid': props['aria-invalid'],
  });
  const ref = useComposedRefs(forwardedRef, ctx.triggerRef);
  const typeahead = useTypeahead();
  const isDisabled = Boolean(control.disabled || ctx.disabled);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || isDisabled) return;
    const key = e.key;
    const printable = key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (!ctx.open) {
      if (key === 'ArrowDown' || key === 'Enter' || (key === ' ' && !typeahead.pending())) {
        e.preventDefault();
        ctx.openWith('selected-first');
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        ctx.openWith('selected-last');
      } else if (key === 'Home' || key === 'PageUp') {
        e.preventDefault();
        ctx.openWith('first');
      } else if (key === 'End' || key === 'PageDown') {
        e.preventDefault();
        ctx.openWith('last');
      } else if (printable) {
        e.preventDefault();
        ctx.openWith('selected-first', typeahead.type(key));
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        e.preventDefault();
        ctx.move('next');
        return;
      case 'ArrowUp':
        e.preventDefault();
        ctx.move('prev');
        return;
      case 'Home':
        e.preventDefault();
        ctx.move('first');
        return;
      case 'End':
        e.preventDefault();
        ctx.move('last');
        return;
      case 'PageDown':
        e.preventDefault();
        ctx.move('pageDown');
        return;
      case 'PageUp':
        e.preventDefault();
        ctx.move('pageUp');
        return;
      case 'Escape':
        e.preventDefault();
        ctx.setOpen(false);
        return;
      case 'Tab':
        ctx.setOpen(false);
        return;
      case 'Enter':
        e.preventDefault();
        if (ctx.activeRef.current) document.getElementById(ctx.activeRef.current)?.click();
        else ctx.setOpen(false);
        return;
      case ' ':
        if (!typeahead.pending()) {
          e.preventDefault();
          if (ctx.activeRef.current) document.getElementById(ctx.activeRef.current)?.click();
          else ctx.setOpen(false);
          return;
        }
        break;
    }
    if (printable) {
      e.preventDefault();
      const match = findByText(ctx.listRef.current, ctx.activeRef.current, typeahead.type(key));
      if (match) ctx.activate(match.id, true);
    }
  };

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      role="combobox"
      id={control.id}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.listId : undefined}
      aria-activedescendant={ctx.open && ctx.activeId ? ctx.activeId : undefined}
      aria-describedby={control['aria-describedby']}
      aria-invalid={control['aria-invalid']}
      aria-required={control.required || undefined}
      disabled={isDisabled}
      data-state={ctx.open ? 'open' : 'closed'}
      data-placeholder={ctx.value === '' ? '' : undefined}
      className={cn('ui-select-trigger', size !== 'md' && `ui-select-trigger-${size}`, className)}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || isDisabled) return;
        ctx.triggerRef.current?.focus({ preventScroll: true });
        if (ctx.open) ctx.setOpen(false);
        else ctx.openWith('selected');
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={(e) => {
        onKeyUp?.(e);
        // Space clicks a button on keyup; the keydown already handled it
        if (e.key === ' ') e.preventDefault();
      }}
      onBlur={(e) => {
        onBlur?.(e);
        if (ctx.open) ctx.setOpen(false);
      }}
    >
      {children ?? <SelectValue placeholder={placeholder} />}
      <Icon name="chevrons-up-down" className="ui-select-icon" />
    </button>
  );
});

/* -------------------------------------------------------------------------- */

export interface SelectValueProps {
  /** Shown while nothing is selected. */
  placeholder?: ReactNode;
  className?: string;
}

/** The selected option's label (or the placeholder). Goes inside <SelectTrigger>. */
export function SelectValue({ placeholder, className }: SelectValueProps) {
  const ctx = useSelectContext('SelectValue');
  const empty = ctx.value === '';
  return (
    <span className={cn('ui-select-value', className)} data-placeholder={empty ? '' : undefined}>
      {empty ? placeholder : ctx.registry.get(ctx.value)?.node}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

export interface SelectContentProps
  extends Omit<ListboxContentProps, 'open' | 'anchorRef' | 'listId' | 'listRef' | 'onOpened' | 'multiselectable' | 'header'> {}

/** The floating list. It is as wide as the trigger at least and sits in the top layer. */
export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(
  { 'aria-labelledby': labelledBy, ...props },
  forwardedRef,
) {
  const ctx = useSelectContext('SelectContent');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, panelRef);

  useDismiss(ctx.open, [panelRef, ctx.triggerRef], () => ctx.setOpen(false), { escape: false });

  return (
    <ListboxContent
      ref={ref}
      open={ctx.open}
      anchorRef={ctx.triggerRef}
      listId={ctx.listId}
      listRef={ctx.listRef}
      onOpened={ctx.resolveOpen}
      aria-labelledby={labelledBy ?? (ctx.triggerRef.current?.id || undefined)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export interface SelectItemProps
  extends Omit<ListboxOptionProps, 'optionId' | 'selected' | 'highlighted' | 'onChoose' | 'onActivate' | 'value' | 'indicator'> {
  /** The value this option stands for. Must be unique and non-empty. */
  value: string;
  /** Plain text for typeahead and the trigger when `children` isn't text. */
  textValue?: string;
}

/** One option. Shows a check when selected. */
export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { value, disabled, textValue, children, ...props },
  ref,
) {
  const ctx = useSelectContext('SelectItem');
  const id = useId();
  const text = textValue ?? nodeText(children);
  useRegisterOption(ctx.registry, value, text, children, disabled);
  return (
    <ListboxOption
      {...props}
      ref={ref}
      optionId={id}
      value={value}
      selected={ctx.value === value}
      highlighted={ctx.activeId === id}
      disabled={disabled}
      onChoose={() => ctx.choose(value)}
      onActivate={() => ctx.activate(id)}
    >
      {children}
    </ListboxOption>
  );
});

/** A labelled set of options: `<SelectGroup label="Europe">…</SelectGroup>`. */
export const SelectGroup = ListboxGroup;
/** A group heading, as a child of <SelectGroup>. */
export const SelectLabel = ListboxLabel;
/** A divider between groups. */
export const SelectSeparator = ListboxSeparator;
