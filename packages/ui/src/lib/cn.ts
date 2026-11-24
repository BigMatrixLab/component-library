/**
 * Join class names, skipping falsy values.
 * No tailwind-merge needed: ui-* classes live in Tailwind's `components`
 * layer, so any utility passed in `className` already wins.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  let out = '';
  for (const c of classes) {
    if (!c) continue;
    out = out ? `${out} ${c}` : String(c);
  }
  return out;
}
