import { isValidElement, type ReactNode } from 'react';

/** Lowercase and strip diacritics, keeping a map from folded index → original index. */
export function fold(text: string) {
  let out = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const f = (text[i] ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    for (let k = 0; k < f.length; k++) map.push(i);
    out += f;
  }
  return { out, map };
}

/** Where `query` occurs in `text` (case and diacritic-insensitive), as [start, end) in `text`. */
export function matchRange(text: string, query: string): [number, number] | null {
  const q = fold(query.trim()).out;
  if (!q) return null;
  const { out, map } = fold(text);
  const at = out.indexOf(q);
  if (at < 0) return null;
  const start = map[at];
  const last = map[at + q.length - 1];
  if (start === undefined || last === undefined) return null;
  return [start, last + 1];
}

/** True when `text` contains `query` (an empty query matches everything). */
export function matchesQuery(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return matchRange(text, query) !== null;
}

/** `text` with the part that matches `query` wrapped in <mark>. */
export function highlightMatch(text: string, query: string): ReactNode {
  const range = matchRange(text, query);
  if (!range) return text;
  return (
    <>
      {text.slice(0, range[0])}
      <mark className="ui-option-mark">{text.slice(range[0], range[1])}</mark>
      {text.slice(range[1])}
    </>
  );
}

/** Plain text of a React node (used for typeahead, filtering and chip labels). */
export function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement(node)) return nodeText((node.props as { children?: ReactNode }).children);
  return '';
}
