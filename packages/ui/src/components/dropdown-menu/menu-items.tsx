'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Slot } from '../../lib/slot';
import { cn } from '../../lib/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { pointerInGrace, useMenuPanel, useMenuRoot, type MenuPanelContextValue } from './menu-context';

/* -------------------------------------------------------------------------- */

/**
 * Highlight follows the pointer: moving over an item focuses it, and the
 * highlighted state mirrors focus (so the keyboard and the pointer share one
 * highlight). Also closes a sibling's open submenu unless the pointer is on
 * its way there. Returns true when the pointer move should be ignored.
 */
export function pointerMovedOverItem(panel: MenuPanelContextValue, e: PointerEvent<HTMLElement>) {
  const sub = panel.activeSub.current;
  if (!sub || sub.triggerEl === e.currentTarget) return false;
  if (pointerInGrace(sub, e.clientX, e.clientY)) return true;
  sub.close();
  return false;
}

export function useItemHighlight(disabled: boolean | undefined) {
  const panel = useMenuPanel('DropdownMenuItem');
  const [highlighted, setHighlighted] = useState(false);
  return {
    highlighted,
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (disabled || e.pointerType === 'touch') return;
      if (pointerMovedOverItem(panel, e)) return;
      if (document.activeElement !== e.currentTarget) e.currentTarget.focus({ preventScroll: true });
    },
    onFocus: () => setHighlighted(true),
    onBlur: () => setHighlighted(false),
  };
}

/* -------------------------------------------------------------------------- */

interface ItemBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  disabled?: boolean;
  /** Called when the item is chosen. Call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void;
  /** Render the child element instead (a link, a Next.js <Link>). */
  asChild?: boolean;
}

/** Props shared by every selectable item: roving tabindex, highlight, Enter/Space/click → select. */
function useSelectableItem({
  disabled,
  onSelect,
  onClick,
  onKeyDown,
  onPointerMove,
  onFocus,
  onBlur,
}: Pick<ItemBaseProps, 'disabled' | 'onSelect' | 'onClick' | 'onKeyDown' | 'onPointerMove' | 'onFocus' | 'onBlur'>) {
  const root = useMenuRoot('DropdownMenuItem');
  const panel = useMenuPanel('DropdownMenuItem');
  const highlight = useItemHighlight(disabled);

  const select = () => {
    const event = new Event('menu.select', { bubbles: true, cancelable: true });
    onSelect?.(event);
    if (!event.defaultPrevented) root.closeMenu();
  };

  return {
    highlighted: highlight.highlighted,
    props: {
      tabIndex: -1,
      'data-menu-owner': panel.ownerId,
      'data-highlighted': highlight.highlighted ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      'aria-disabled': disabled || undefined,
      onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(e);
        if (!e.defaultPrevented) highlight.onPointerMove(e);
      },
      onFocus: (e: FocusEvent<HTMLDivElement>) => {
        onFocus?.(e);
        highlight.onFocus();
      },
      onBlur: (e: FocusEvent<HTMLDivElement>) => {
        onBlur?.(e);
        highlight.onBlur();
      },
      onClick: (e: MouseEvent<HTMLDivElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) select();
      },
      onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.click();
        }
      },
    },
  };
}

/* -------------------------------------------------------------------------- */

export interface DropdownMenuItemProps extends ItemBaseProps {
  /** Leading icon (16px). */
  icon?: ReactNode;
  /** Keyboard shortcut hint on the right, e.g. "⌘K". */
  shortcut?: ReactNode;
  /** `destructive` colours the item red. */
  variant?: 'default' | 'destructive';
  /** Indent to line up with items that have a check or radio indicator. */
  inset?: boolean;
}

/** A single action. */
export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(function DropdownMenuItem(
  {
    asChild,
    icon,
    shortcut,
    variant = 'default',
    inset,
    disabled,
    onSelect,
    onClick,
    onKeyDown,
    onPointerMove,
    onFocus,
    onBlur,
    className,
    children,
    ...others
  },
  ref,
) {
  const { props } = useSelectableItem({ disabled, onSelect, onClick, onKeyDown, onPointerMove, onFocus, onBlur });
  const classes = cn(
    'ui-menu-item',
    variant === 'destructive' && 'ui-menu-item-destructive',
    inset && 'ui-menu-item-inset',
    className,
  );
  if (asChild) {
    return (
      <Slot ref={ref} role="menuitem" className={classes} {...props} {...others}>
        {children}
      </Slot>
    );
  }
  return (
    <div ref={ref} role="menuitem" className={classes} {...props} {...others}>
      {icon != null && <span className="ui-menu-icon">{icon}</span>}
      {children}
      {shortcut != null && <span className="ui-menu-shortcut">{shortcut}</span>}
    </div>
  );
});

/* -------------------------------------------------------------------------- */

export interface DropdownMenuCheckboxItemProps extends ItemBaseProps {
  /** Controlled checked state. */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  shortcut?: ReactNode;
}

/** An item that toggles an option. Choosing it closes the menu unless `onSelect` prevents it. */
export const DropdownMenuCheckboxItem = forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  function DropdownMenuCheckboxItem(
    { checked: checkedProp, defaultChecked = false, onCheckedChange, shortcut, disabled, onSelect, className, children, asChild: _asChild, ...rest },
    ref,
  ) {
    const [checked, setChecked] = useControllableState({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });
    const { onClick, onKeyDown, onPointerMove, onFocus, onBlur, ...others } = rest;
    const { props } = useSelectableItem({
      disabled,
      onClick,
      onKeyDown,
      onPointerMove,
      onFocus,
      onBlur,
      onSelect: (event) => {
        setChecked(!checked);
        onSelect?.(event);
      },
    });
    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        className={cn('ui-menu-item ui-menu-item-check', className)}
        {...props}
        {...others}
      >
        <span className="ui-menu-indicator" aria-hidden="true">
          {checked && <Icon name="check" size={14} />}
        </span>
        {children}
        {shortcut != null && <span className="ui-menu-shortcut">{shortcut}</span>}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------- */

interface RadioGroupContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface DropdownMenuRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled selected value. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** A group of mutually exclusive items. */
export const DropdownMenuRadioGroup = forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  function DropdownMenuRadioGroup({ value: valueProp, defaultValue, onValueChange, className, ...props }, ref) {
    const [value, setValue] = useControllableState<string | undefined>({
      value: valueProp,
      defaultValue,
      onChange: (v) => v !== undefined && onValueChange?.(v),
    });
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange: setValue }}>
        <div ref={ref} role="group" className={cn('ui-menu-group', className)} {...props} />
      </RadioGroupContext.Provider>
    );
  },
);

export interface DropdownMenuRadioItemProps extends ItemBaseProps {
  /** The value this item selects. */
  value: string;
  shortcut?: ReactNode;
}

export const DropdownMenuRadioItem = forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  function DropdownMenuRadioItem(
    { value, shortcut, disabled, onSelect, className, children, asChild: _asChild, ...rest },
    ref,
  ) {
    const group = useContext(RadioGroupContext);
    if (!group) throw new Error('<DropdownMenuRadioItem> must be used inside <DropdownMenuRadioGroup>.');
    const checked = group.value === value;
    const { onClick, onKeyDown, onPointerMove, onFocus, onBlur, ...others } = rest;
    const { props } = useSelectableItem({
      disabled,
      onClick,
      onKeyDown,
      onPointerMove,
      onFocus,
      onBlur,
      onSelect: (event) => {
        group.onValueChange(value);
        onSelect?.(event);
      },
    });
    return (
      <div
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        className={cn('ui-menu-item ui-menu-item-check', className)}
        {...props}
        {...others}
      >
        <span className="ui-menu-indicator" aria-hidden="true">
          {checked && <span className="ui-menu-dot" />}
        </span>
        {children}
        {shortcut != null && <span className="ui-menu-shortcut">{shortcut}</span>}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------- */

/** A small heading above a group of items. */
export const DropdownMenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  function DropdownMenuLabel({ className, inset, ...props }, ref) {
    return <div ref={ref} className={cn('ui-menu-label', inset && 'ui-menu-item-inset', className)} {...props} />;
  },
);

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return <div ref={ref} role="separator" aria-orientation="horizontal" className={cn('ui-menu-separator', className)} {...props} />;
  },
);

/** Groups related items for assistive technology. Give it an aria-label. */
export const DropdownMenuGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuGroup({ className, ...props }, ref) {
    return <div ref={ref} role="group" className={cn('ui-menu-group', className)} {...props} />;
  },
);
