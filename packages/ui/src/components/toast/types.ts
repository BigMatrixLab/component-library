import type { MouseEvent, ReactNode } from 'react';

export type ToastId = string | number;

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToasterPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastButton {
  /** Button label. */
  label: ReactNode;
  /** Called on click. The toast dismisses afterwards unless you call `event.preventDefault()`. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface ToastOptions {
  /** Second line, muted. */
  description?: ReactNode;
  /** Milliseconds before auto-dismiss. `Infinity` keeps it until dismissed. Default 4000 (`Infinity` for loading). */
  duration?: number;
  /** Primary action button. */
  action?: ToastButton;
  /** Secondary button, left of the action. */
  cancel?: ToastButton;
  /** Custom icon. `false` removes the icon, including the built-in one for the type. */
  icon?: ReactNode | false;
  /** Id. Calling again with an existing id updates that toast in place. */
  id?: ToastId;
  /** Allow swipe, the × button and Esc to dismiss it. Default true. */
  dismissible?: boolean;
  /** Announce assertively (role="alert"). Errors always do. */
  important?: boolean;
  /** Show the × button on this toast (overrides the Toaster). */
  closeButton?: boolean;
  /** Show it in the `<Toaster id="…" />` with this id. Without it, it shows in the Toaster that has no id. */
  toasterId?: string;
  /** Class for the toast. */
  className?: string;
  /** Called when the toast is dismissed, by anything. */
  onDismiss?: (toast: ToastRecord) => void;
  /** Called when the timer dismisses it. */
  onAutoClose?: (toast: ToastRecord) => void;
}

/** What the store holds for each toast. */
export interface ToastRecord extends ToastOptions {
  id: ToastId;
  type: ToastType;
  title: ReactNode;
  /** True once dismissed: it stays in the list until its exit animation ends. */
  dismissed: boolean;
  /** Bumped on every update, so timers restart. */
  version: number;
}

export type ToastPromiseResult = ReactNode | (ToastOptions & { title: ReactNode });

export interface ToastPromiseMessages<T> {
  /** Shown while the promise is pending. */
  loading: ReactNode;
  /** Shown when it resolves. May return a string, node or `{ title, description, … }`. */
  success?: ToastPromiseResult | ((data: T) => ToastPromiseResult);
  /** Shown when it rejects. */
  error?: ToastPromiseResult | ((error: unknown) => ToastPromiseResult);
  /** Description shown in every state unless a state sets its own. */
  description?: ReactNode;
  /** Show it in the `<Toaster id="…" />` with this id. */
  toasterId?: string;
  /** Runs after either outcome. */
  finally?: () => void;
}
