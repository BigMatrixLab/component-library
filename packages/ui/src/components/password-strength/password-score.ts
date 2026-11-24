/* Pure scoring behind PasswordStrength. No DOM, no React: safe on the server and in tests.
   It is a guide for the user while typing, not a security check — validate on the server too. */

export interface PasswordRequirement {
  /** Stable key (React key and data attribute). */
  id: string;
  /** Shown in the checklist, e.g. "At least 8 characters". */
  label: string;
  /** True when the password meets it. */
  test: (password: string) => boolean;
}

export interface PasswordRequirementResult {
  id: string;
  label: string;
  met: boolean;
}

/** 0 empty · 1 weak · 2 fair · 3 good · 4 strong. */
export type PasswordScore = 0 | 1 | 2 | 3 | 4;
export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  score: PasswordScore;
  level: PasswordStrengthLevel;
  requirements: PasswordRequirementResult[];
  /** How many requirements are met. */
  metCount: number;
}

export const passwordStrengthLevels: readonly PasswordStrengthLevel[] = ['empty', 'weak', 'fair', 'good', 'strong'];

/** The default checklist: length, mixed case, a number, a symbol. */
export const defaultPasswordRequirements: readonly PasswordRequirement[] = [
  { id: 'length', label: 'At least 8 characters', test: (p) => Array.from(p).length >= 8 },
  { id: 'case', label: 'Upper and lower case letters', test: (p) => /\p{Ll}/u.test(p) && /\p{Lu}/u.test(p) },
  { id: 'number', label: 'A number', test: (p) => /\p{N}/u.test(p) },
  { id: 'symbol', label: 'A symbol', test: (p) => /[^\p{L}\p{N}]/u.test(p) },
];

/** Passwords (and their obvious stems) that are always weak, whatever else they contain. */
const COMMON = [
  'password', 'passw0rd', 'qwerty', 'letmein', 'welcome', 'admin', 'iloveyou', 'monkey', 'dragon',
  'football', 'baseball', 'sunshine', 'princess', 'abc123', '123456', '111111', '000000',
];

function characterClasses(password: string): number {
  return [/\p{Ll}/u, /\p{Lu}/u, /\p{N}/u, /[^\p{L}\p{N}]/u].filter((re) => re.test(password)).length;
}

/** True when the password has 4+ characters in a straight run: "abcd", "4321", "wxyz". */
export function passwordHasSequence(password: string, run = 4): boolean {
  const codes = Array.from(password.toLowerCase(), (c) => c.codePointAt(0)!);
  let up = 1;
  let down = 1;
  for (let i = 1; i < codes.length; i++) {
    up = codes[i] === codes[i - 1]! + 1 ? up + 1 : 1;
    down = codes[i] === codes[i - 1]! - 1 ? down + 1 : 1;
    if (up >= run || down >= run) return true;
  }
  return false;
}

/** True when the password is mostly one repeated character or contains a common password. */
export function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase();
  if (/^(.)\1*$/u.test(lower)) return true;
  return COMMON.some((word) => lower.includes(word));
}

/**
 * Score a password from 0 to 4.
 *
 * Points: length (8–11 → 1, 12–15 → 2, 16+ → 3) plus variety (character classes − 1, up to 3),
 * minus 1 for a straight run like "1234". Points map to 1 weak (0–1) · 2 fair (2–3) · 3 good (4) ·
 * 4 strong (5+). A common password or a single repeated character is always weak, and "strong"
 * needs every requirement met. Any non-empty password scores at least 1.
 */
export function scorePassword(
  password: string,
  requirements: readonly PasswordRequirement[] = defaultPasswordRequirements,
): PasswordStrengthResult {
  const results = requirements.map((r) => ({ id: r.id, label: r.label, met: password.length > 0 && r.test(password) }));
  const metCount = results.filter((r) => r.met).length;
  if (!password) return { score: 0, level: 'empty', requirements: results, metCount };

  const length = Array.from(password).length;
  let points = length >= 16 ? 3 : length >= 12 ? 2 : length >= 8 ? 1 : 0;
  points += Math.max(0, characterClasses(password) - 1);
  if (passwordHasSequence(password)) points -= 1;

  let score: PasswordScore = points >= 5 ? 4 : points >= 4 ? 3 : points >= 2 ? 2 : 1;
  if (isCommonPassword(password)) score = 1;
  if (score === 4 && metCount < results.length) score = 3;

  return { score, level: passwordStrengthLevels[score]!, requirements: results, metCount };
}
