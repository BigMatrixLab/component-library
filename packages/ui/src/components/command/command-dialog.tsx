'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog/dialog';
import { Command, type CommandProps } from './command';

export interface CommandDialogProps extends Omit<CommandProps, 'onItemSelect'> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the palette asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Toggle with ⌘K (macOS) or Ctrl+K anywhere on the page. Default false. */
  hotkey?: boolean;
  /** Close after an item runs. Default true. */
  closeOnSelect?: boolean;
  /** Name announced when the dialog opens (visually hidden). Default "Command palette". */
  title?: string;
  /** Hidden hint read after the title. */
  description?: string;
  /** Class for the dialog layer. */
  dialogClassName?: string;
  children?: ReactNode;
}

/**
 * CommandDialog — the command palette as a modal: a Command inside our Dialog,
 * aligned to the top of the screen and wider than a normal dialog. The search
 * field is focused on open and the search is cleared when it closes.
 */
export function CommandDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  hotkey = false,
  closeOnSelect = true,
  title = 'Command palette',
  description,
  dialogClassName,
  className,
  children,
  ...commandProps
}: CommandDialogProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hotkey, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        centered
        showClose={false}
        size="lg"
        className={cn('ui-command-dialog', dialogClassName)}
        panelClassName="ui-command-dialog-panel"
      >
        <DialogTitle className="ui-command-title">{title}</DialogTitle>
        {description && <DialogDescription className="ui-command-title">{description}</DialogDescription>}
        <Command className={className} onItemSelect={closeOnSelect ? () => setOpen(false) : undefined} {...commandProps}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}
