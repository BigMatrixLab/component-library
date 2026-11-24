import { describe, expect, it } from 'vitest';
import {
  dataTableCompareValues,
  dataTableDeselectIds,
  dataTableFilterRows,
  dataTableNextDirection,
  dataTablePaginate,
  dataTableSelectIds,
  dataTableSortRows,
  dataTableToggleId,
  dataTableToText,
} from './utils';

interface Row {
  id: number;
  name: string;
  amount: number | null;
}

const rows: Row[] = [
  { id: 1, name: 'Acme', amount: 30 },
  { id: 2, name: 'Birch', amount: 10 },
  { id: 3, name: 'Cedar', amount: 30 },
  { id: 4, name: 'Dune', amount: null },
  { id: 5, name: 'Ember', amount: 20 },
];

describe('dataTableCompareValues', () => {
  it('compares numbers numerically and strings naturally', () => {
    expect(dataTableCompareValues(2, 10)).toBeLessThan(0);
    expect(dataTableCompareValues('item 2', 'item 10')).toBeLessThan(0);
    expect(dataTableCompareValues('b', 'A')).toBeGreaterThan(0);
  });

  it('puts empty values last', () => {
    expect(dataTableCompareValues(null, 1)).toBeGreaterThan(0);
    expect(dataTableCompareValues(1, undefined)).toBeLessThan(0);
    expect(dataTableCompareValues(null, undefined)).toBe(0);
  });

  it('compares dates by time', () => {
    expect(dataTableCompareValues(new Date('2024-01-01'), new Date('2024-02-01'))).toBeLessThan(0);
  });
});

describe('dataTableNextDirection', () => {
  it('cycles none → asc → desc → none', () => {
    expect(dataTableNextDirection(null)).toBe('asc');
    expect(dataTableNextDirection('asc')).toBe('desc');
    expect(dataTableNextDirection('desc')).toBeNull();
  });
});

describe('dataTableSortRows', () => {
  it('sorts ascending and descending without mutating the input', () => {
    const before = rows.map((r) => r.id);
    const asc = dataTableSortRows(rows, { direction: 'asc', getValue: (r) => r.amount });
    expect(asc.map((r) => r.id)).toEqual([2, 5, 1, 3, 4]);
    const desc = dataTableSortRows(rows, { direction: 'desc', getValue: (r) => r.amount });
    expect(desc.map((r) => r.id)).toEqual([1, 3, 5, 2, 4]);
    expect(rows.map((r) => r.id)).toEqual(before);
  });

  it('is stable: equal values keep their original order', () => {
    const asc = dataTableSortRows(rows, { direction: 'asc', getValue: (r) => r.amount });
    expect(asc.filter((r) => r.amount === 30).map((r) => r.id)).toEqual([1, 3]);
    const desc = dataTableSortRows(rows, { direction: 'desc', getValue: (r) => r.amount });
    expect(desc.filter((r) => r.amount === 30).map((r) => r.id)).toEqual([1, 3]);
  });

  it('uses a custom comparator', () => {
    const out = dataTableSortRows(rows, { direction: 'asc', compare: (a, b) => b.name.localeCompare(a.name) });
    expect(out.map((r) => r.name)).toEqual(['Ember', 'Dune', 'Cedar', 'Birch', 'Acme']);
  });

  it('returns a copy when there is no sort', () => {
    const out = dataTableSortRows(rows, null);
    expect(out).toEqual(rows);
    expect(out).not.toBe(rows);
  });
});

describe('dataTableToText', () => {
  it('stringifies primitives and dates, ignores objects and empties', () => {
    expect(dataTableToText(12)).toBe('12');
    expect(dataTableToText(true)).toBe('true');
    expect(dataTableToText(new Date('2024-03-05T10:00:00Z'))).toBe('2024-03-05');
    expect(dataTableToText(null)).toBe('');
    expect(dataTableToText({ a: 1 })).toBe('');
  });
});

describe('dataTableFilterRows', () => {
  const getSearchText = (r: Row) => `${r.name} ${r.amount ?? ''}`;

  it('returns everything for an empty query', () => {
    expect(dataTableFilterRows(rows, { search: '  ', getSearchText })).toHaveLength(5);
  });

  it('matches case-insensitively and requires every word', () => {
    expect(dataTableFilterRows(rows, { search: 'ACME', getSearchText }).map((r) => r.id)).toEqual([1]);
    expect(dataTableFilterRows(rows, { search: 'e 30', getSearchText }).map((r) => r.id)).toEqual([1, 3]);
  });

  it('applies predicates together with the search', () => {
    const out = dataTableFilterRows(rows, { search: 'e', getSearchText, predicates: [(r) => (r.amount ?? 0) >= 20] });
    expect(out.map((r) => r.id)).toEqual([1, 3, 5]);
  });
});

describe('dataTablePaginate', () => {
  const many = Array.from({ length: 42 }, (_, i) => i + 1);

  it('slices a page and reports the range', () => {
    const p = dataTablePaginate(many, 2, 10);
    expect(p.rows[0]).toBe(11);
    expect(p).toMatchObject({ page: 2, pageCount: 5, total: 42, from: 11, to: 20 });
  });

  it('shows a short last page', () => {
    expect(dataTablePaginate(many, 5, 10)).toMatchObject({ from: 41, to: 42 });
  });

  it('clamps out-of-range pages', () => {
    expect(dataTablePaginate(many, 99, 10).page).toBe(5);
    expect(dataTablePaginate(many, 0, 10).page).toBe(1);
  });

  it('handles empty data and "all rows"', () => {
    expect(dataTablePaginate([], 1, 10)).toMatchObject({ page: 1, pageCount: 1, from: 0, to: 0, total: 0 });
    expect(dataTablePaginate(many, 1, Infinity)).toMatchObject({ pageCount: 1, from: 1, to: 42 });
  });
});

describe('selection helpers', () => {
  it('selects without duplicates', () => {
    expect(dataTableSelectIds(['a'], ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });
  it('deselects', () => {
    expect(dataTableDeselectIds(['a', 'b', 'c'], ['b'])).toEqual(['a', 'c']);
  });
  it('toggles', () => {
    expect(dataTableToggleId(['a'], 'b')).toEqual(['a', 'b']);
    expect(dataTableToggleId(['a', 'b'], 'a')).toEqual(['b']);
  });
});
