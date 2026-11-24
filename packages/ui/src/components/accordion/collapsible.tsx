'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Collapse } from './collapse';

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(component: string) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Collapsible>.`);
  return ctx;
}

export interface CollapsibleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the region asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/** Collapsible — one region that opens and closes with a smooth height animation. */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { open: openProp, defaultOpen = false, onOpenChange, disabled = false, className, ...props },
  ref,
) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  return (
    <CollapsibleContext.Provider
      value={{ open, setOpen, disabled, triggerId: `${id}-trigger`, contentId: `${id}-content` }}
    >
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        className={cn('ui-collapsible', className)}
        {...props}
      />
    </CollapsibleContext.Provider>
  );
});

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Use your own element (for example a <Button>) as the trigger. */
  asChild?: boolean;
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(function CollapsibleTrigger(
  { asChild, onClick, disabled, ...props },
  ref,
) {
  const ctx = useCollapsibleContext('CollapsibleTrigger');
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled ?? ctx.disabled;
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : 'button'}
      id={ctx.triggerId}
      aria-expanded={ctx.open}
      aria-controls={ctx.contentId}
      data-state={ctx.open ? 'open' : 'closed'}
      disabled={isDisabled || undefined}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setOpen(!ctx.open);
      }}
      {...props}
    />
  );
});

export const CollapsibleContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CollapsibleContent(
  { className, ...props },
  ref,
) {
  const ctx = useCollapsibleContext('CollapsibleContent');
  return (
    <Collapse
      ref={ref}
      id={ctx.contentId}
      open={ctx.open}
      onReveal={() => ctx.setOpen(true)}
      className={cn('ui-collapsible-content', className)}
      {...props}
    />
  );
});
