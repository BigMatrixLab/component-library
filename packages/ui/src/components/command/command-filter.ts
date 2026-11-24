/* Search scoring for the command palette. Higher is a better match, 0 is no match.
   Tiers, best first: exact, prefix, word start, substring of the label; then the
   same tiers on keywords (always below a label prefix); finally every word of a
   multi-word search found somewhere in label + keywords. */

const WORD_BREAK = /[\s\-_/.:,]/;

function tier(haystack: string, q: string): 'exact' | 'prefix' | 'word' | 'substring' | null {
  if (haystack === q) return 'exact';
  if (haystack.startsWith(q)) return 'prefix';
  const at = haystack.indexOf(q);
  if (at === -1) return null;
  // a word start: the match begins right after a separator
  let i = at;
  while (i !== -1) {
    if (i === 0 || WORD_BREAK.test(haystack[i - 1] ?? '')) return 'word';
    i = haystack.indexOf(q, i + 1);
  }
  return 'substring';
}

const LABEL_SCORE = { exact: 100, prefix: 90, word: 70, substring: 50 } as const;
const KEYWORD_SCORE = { exact: 65, prefix: 60, word: 55, substring: 30 } as const;

/** Score `value` (and its `keywords`) against `search`. An empty search matches everything. */
export function commandScore(value: string, search: string, keywords: string[] = []): number {
  const q = search.trim().toLowerCase();
  if (!q) return 1;
  const label = value.toLowerCase();
  const words = keywords.map((k) => k.toLowerCase());

  let best = 0;
  const l = tier(label, q);
  if (l) best = LABEL_SCORE[l];
  for (const k of words) {
    const t = tier(k, q);
    if (t) best = Math.max(best, KEYWORD_SCORE[t]);
  }
  if (best) return best;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const all = [label, ...words].join(' ');
    if (tokens.every((t) => all.includes(t))) return 20;
  }
  return 0;
}
