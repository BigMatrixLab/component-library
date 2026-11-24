export type TagRejectReason = 'duplicate' | 'max' | 'invalid';

export interface TagRejection {
  tag: string;
  reason: TagRejectReason;
  /** A message the `validate` function returned, if any. */
  message?: string;
}

export interface AddTagsOptions {
  /** Most tags allowed. */
  maxTags?: number;
  /** Allow the same tag twice. Default false. */
  allowDuplicates?: boolean;
  /** Treat "Design" and "design" as different tags. Default false. */
  caseSensitive?: boolean;
  /** Return true to accept; false or a message string to reject. */
  validate?: (tag: string, tags: string[]) => boolean | string | void;
}

export const DEFAULT_DELIMITERS = [','];

export function sameTag(a: string, b: string, caseSensitive = false): boolean {
  return caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();
}

/** Split pasted or typed text into trimmed, non-empty tags on newlines and the given delimiters. */
export function splitTags(text: string, delimiters: string[] = DEFAULT_DELIMITERS): string[] {
  let normalized = text;
  for (const d of delimiters) if (d) normalized = normalized.split(d).join('\n');
  return normalized
    .split(/[\r\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Add candidates to `current` one by one. Empty text is ignored; duplicates, tags over
 * the limit and tags `validate` refuses come back in `rejected`.
 */
export function addTags(
  current: string[],
  candidates: string[],
  { maxTags, allowDuplicates = false, caseSensitive = false, validate }: AddTagsOptions = {},
): { tags: string[]; added: string[]; rejected: TagRejection[] } {
  const tags = current.slice();
  const added: string[] = [];
  const rejected: TagRejection[] = [];
  for (const candidate of candidates) {
    const tag = candidate.trim();
    if (!tag) continue;
    if (maxTags !== undefined && tags.length >= maxTags) {
      rejected.push({ tag, reason: 'max' });
      continue;
    }
    if (!allowDuplicates && tags.some((t) => sameTag(t, tag, caseSensitive))) {
      rejected.push({ tag, reason: 'duplicate' });
      continue;
    }
    const verdict = validate?.(tag, tags);
    if (verdict === false || typeof verdict === 'string') {
      rejected.push({ tag, reason: 'invalid', message: typeof verdict === 'string' ? verdict : undefined });
      continue;
    }
    tags.push(tag);
    added.push(tag);
  }
  return { tags, added, rejected };
}
