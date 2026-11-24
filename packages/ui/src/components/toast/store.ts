import { isValidElement, type ReactNode } from 'react';
import type {
  ToastId,
  ToastOptions,
  ToastPromiseMessages,
  ToastPromiseResult,
  ToastRecord,
  ToastType,
} from './types';

/*
 * A tiny external store. `toast()` can be called from anywhere (event
 * handlers, data layers, outside React); <Toaster /> reads it with
 * useSyncExternalStore. Every change replaces the array, so snapshots are
 * stable between changes.
 */

const EMPTY: ToastRecord[] = [];
let toasts: ToastRecord[] = EMPTY;
let counter = 0;
const listeners = new Set<() => void>();

function emit(next: ToastRecord[]) {
  toasts = next;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const getSnapshot = () => toasts;
export const getServerSnapshot = () => EMPTY;

/** Create a toast, or update the one with the same id in place. */
function create(type: ToastType, title: ReactNode, options: ToastOptions = {}): ToastId {
  const id = options.id ?? `ui-toast-${++counter}`;
  const existing = toasts.find((t) => t.id === id);
  if (existing) {
    // An update: keep its place in the stack, restart its timer, revive it if it was leaving.
    emit(
      toasts.map((t) =>
        t.id === id ? { ...t, ...options, id, type, title, dismissed: false, version: t.version + 1 } : t,
      ),
    );
  } else {
    emit([...toasts, { ...options, id, type, title, dismissed: false, version: 0 }]);
  }
  return id;
}

/** Mark toasts as dismissed. <Toaster /> removes them once their exit animation ends. */
function dismiss(id?: ToastId): ToastId | undefined {
  const leaving: ToastRecord[] = [];
  const next = toasts.map((t) => {
    if (t.dismissed || (id !== undefined && t.id !== id)) return t;
    leaving.push(t);
    return { ...t, dismissed: true };
  });
  if (!leaving.length) return id;
  emit(next);
  leaving.forEach((t) => t.onDismiss?.(t));
  return id;
}

export { dismiss as dismissToast };

/** Drop a toast from the store for good (called after its exit animation). */
export function removeToast(id: ToastId) {
  if (toasts.some((t) => t.id === id)) emit(toasts.filter((t) => t.id !== id));
}

/** Test helper: empty the store. */
export function resetToasts() {
  counter = 0;
  emit(EMPTY);
}

function isResultObject(v: unknown): v is ToastOptions & { title: ReactNode } {
  return typeof v === 'object' && v !== null && !isValidElement(v) && 'title' in v;
}

function resolveResult(result: ToastPromiseResult, fallback: ToastOptions): { title: ReactNode; options: ToastOptions } {
  return isResultObject(result)
    ? { title: result.title, options: { ...fallback, ...result } }
    : { title: result as ReactNode, options: fallback };
}

function promise<T>(source: Promise<T> | (() => Promise<T>), messages: ToastPromiseMessages<T>) {
  const id = create('loading', messages.loading, { description: messages.description, toasterId: messages.toasterId });
  const p = typeof source === 'function' ? source() : source;
  const settle = (type: ToastType, result: ToastPromiseResult | undefined) => {
    // If the user dismissed it while pending, leave it dismissed.
    const current = toasts.find((t) => t.id === id);
    if (result === undefined || result === null || result === false || !current || current.dismissed) {
      dismiss(id);
      return;
    }
    const { title, options } = resolveResult(result, { description: messages.description });
    create(type, title, { ...options, id });
  };
  p.then(
    (data) => settle('success', typeof messages.success === 'function' ? messages.success(data) : messages.success),
    (err) => settle('error', typeof messages.error === 'function' ? messages.error(err) : messages.error),
  ).finally(() => messages.finally?.());
  return { id, unwrap: () => p };
}

type Creator = (title: ReactNode, options?: ToastOptions) => ToastId;

const withType =
  (type: ToastType): Creator =>
  (title, options) =>
    create(type, title, options);

/**
 * Show a toast. Mount <Toaster /> once; call this from anywhere.
 *   toast('Saved');  toast.success('Invoice sent', { description: '…' });
 *   toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Failed' });
 *   toast.dismiss(id)   — or toast.dismiss() for all
 */
export const toast = Object.assign(withType('default'), {
  success: withType('success'),
  error: withType('error'),
  warning: withType('warning'),
  info: withType('info'),
  loading: withType('loading'),
  promise,
  dismiss,
});
