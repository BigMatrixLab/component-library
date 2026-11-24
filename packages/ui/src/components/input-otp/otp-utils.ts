export type OTPPattern = 'digits' | 'alphanumeric';

const ALLOWED: Record<OTPPattern, RegExp> = {
  digits: /[^0-9]/g,
  alphanumeric: /[^a-zA-Z0-9]/g,
};

/** Drop characters the pattern does not allow, then cut to `length`. */
export function sanitizeOTP(raw: string, pattern: OTPPattern, length: number): string {
  return raw.replace(ALLOWED[pattern], '').slice(0, length);
}

/** Where the caret sits for a given selection start: the slot to mark active. */
export function activeSlotIndex(selectionStart: number | null, valueLength: number, length: number): number {
  return Math.max(0, Math.min(selectionStart ?? valueLength, valueLength, length - 1));
}

/** Slot sizes for `groups`, or one group of `length`. */
export function resolveGroups(length: number, groups?: number[]): number[] {
  const clean = (groups ?? []).filter((g) => g > 0);
  return clean.length ? clean : [length];
}
