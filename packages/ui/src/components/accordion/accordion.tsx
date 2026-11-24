'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useRovingFocus } from '../../hooks/use-roving-focus';
import { Icon } from '../../icons/icon';
import { Collapse } from './collapse';

export type AccordionVariant = 'default' | 'cards' | 'flush';

interface AccordionContextValue {
  open: string[];
  toggle: (value: string) => void;
  setItemOpen: (value: string, open: boolean) => void;
  disabled: boolean;
  baseId: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Accordion>.`);
  return ctx;
}

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useItemContext(component: string) {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <AccordionItem>.`);
  return ctx;
}

/** Ids must stay valid for aria-controls / aria-labelledby whatever the value looks like. */
const slug = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '_');
const toArray = (v: string | string[] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : v ? [v] : []);

/* -------------------------------------------------------------------------- */

interface AccordionBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** `default` (divided), `cards` (separated) or `flush`. Default `default`. */
  variant?: AccordionVariant;
  /** Disable every item. */
  disabled?: boolean;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  /** One item open at a time. */
  type: 'single';
  /** Let the open item be closed again. Default false. */
  collapsible?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  /** Any number of items open at once. */
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

/**
 * Accordion — a stack of headings that each reveal a region. Up/Down/Home/End
 * move between headers (WAI-ARIA accordion pattern).
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const {
    type,
    variant = 'default',
    disabled = false,
    className,
    onKeyDown,
    // Pulled out so they are not spread onto the <div>
    collapsible: collapsibleProp,
    value: valueProp,
    defaultValue,
    onValueChange,
    ...rest
  } = props as AccordionProps & { collapsible?: boolean };
  const collapsible = type === 'single' ? collapsibleProp === true : true;

  const [open, setOpen] = useControllableState<string[]>({
    value: toArray(valueProp),
    defaultValue: toArray(defaultValue) ?? [],
    onChange: (next) => {
      if (type === 'single') (onValueChange as ((v: string) => void) | undefined)?.(next[0] ?? '');
      else (onValueChange as ((v: string[]) => void) | undefined)?.(next);
    },
  });
  const baseId = useId();

  const setItemOpen = useCallback(
    (value: string, nextOpen: boolean) => {
      setOpen((prev) => {
        const isOpen = prev.includes(value);
        if (nextOpen === isOpen) return prev;
        if (type === 'multiple') return nextOpen ? [...prev, value] : prev.filter((v) => v !== value);
        if (nextOpen) return [value];
        return collapsible ? [] : prev;
      });
    },
    [setOpen, type, collapsible],
  );
  const toggle = useCallback((value: string) => setItemOpen(value, !open.includes(value)), [setItemOpen, open]);

  const roving = useRovingFocus({ itemSelector: '[data-accordion-trigger]', orientation: 'vertical', typeahead: false });

  return (
    <AccordionContext.Provider value={{ open, toggle, setItemOpen, disabled, baseId }}>
      <div
        ref={ref}
        data-variant={variant}
        className={cn('ui-accordion', className)}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(e);
          // Only arrow keys pressed on a header; fields inside a panel keep their own keys
          if (!e.defaultPrevented && (e.target as HTMLElement).closest('[data-accordion-trigger]')) roving(e);
        }}
        {...rest}
      />
    </AccordionContext.Provider>
  );
});

/* -------------------------------------------------------------------------- */

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Identifies the item in the accordion's value. */
  value: string;
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled, className, ...props },
  ref,
) {
  const ctx = useAccordionContext('AccordionItem');
  const open = ctx.open.includes(value);
  const isDisabled = disabled ?? ctx.disabled;
  return (
    <AccordionItemContext.Provider
      value={{
        value,
        open,
        disabled: isDisabled,
        triggerId: `${ctx.baseId}-trigger-${slug(value)}`,
        contentId: `${ctx.baseId}-content-${slug(value)}`,
      }}
    >
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        data-disabled={isDisabled ? '' : undefined}
        className={cn('ui-accordion-item', className)}
        {...props}
      />
    </AccordionItemContext.Provider>
  );
});

/* -------------------------------------------------------------------------- */

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Heading level that wraps the button, so the structure fits your page. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger(
  { headingLevel = 3, className, children, onClick, ...props },
  ref,
) {
  const ctx = useAccordionContext('AccordionTrigger');
  const item = useItemContext('AccordionTrigger');
  const Heading = `h${headingLevel}` as 'h3';
  return (
    <Heading className="ui-accordion-header">
      <button
        ref={ref}
        type="button"
        id={item.triggerId}
        data-accordion-trigger=""
        data-state={item.open ? 'open' : 'closed'}
        aria-expanded={item.open}
        aria-controls={item.contentId}
        disabled={item.disabled}
        className={cn('ui-accordion-trigger', className)}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (!e.defaultPrevented) ctx.toggle(item.value);
        }}
        {...props}
      >
        {children}
        <Icon name="chevron-down" size={16} className="ui-accordion-chevron" />
      </button>
    </Heading>
  );
});

export const AccordionContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AccordionContent(
  { className, children, ...props },
  ref,
) {
  const ctx = useAccordionContext('AccordionContent');
  const item = useItemContext('AccordionContent');
  return (
    <Collapse
      ref={ref}
      id={item.contentId}
      role="region"
      aria-labelledby={item.triggerId}
      open={item.open}
      onReveal={() => ctx.setItemOpen(item.value, true)}
      className={cn('ui-accordion-content', className)}
      {...props}
    >
      <div className="ui-accordion-body">{children}</div>
    </Collapse>
  );
});
