/* Pure helpers behind AnimatedNumber: turn Intl parts into stable "cells". */

export interface DigitCell {
  kind: 'digit';
  /** Stable across value changes: the digit keeps its place from the decimal point. */
  key: string;
  /** 0–9: which row of the reel to show. */
  digit: number;
}

export interface SymbolCell {
  kind: 'symbol';
  key: string;
  text: string;
  /** The Intl part type: currency, group, decimal, minusSign, percentSign, compact, literal… */
  type: string;
}

export type NumberCell = DigitCell | SymbolCell;

const digitCache = new Map<string, string[]>();

/** The ten digits in the locale's numbering system ("0".."9" for en, "٠".."٩" for ar-EG). */
export function localizedDigits(locale: string): string[] {
  const cached = digitCache.get(locale);
  if (cached) return cached;
  let digits: string[];
  try {
    const nf = new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 0 });
    digits = Array.from({ length: 10 }, (_, i) => nf.format(i));
  } catch {
    digits = Array.from({ length: 10 }, (_, i) => String(i));
  }
  digitCache.set(locale, digits);
  return digits;
}

/**
 * Split formatted parts into cells. Digits are keyed by place value (`int-3` is the thousands digit,
 * `frac-0` the first decimal), so when 999 becomes 1,000 the existing digits roll and only the new
 * ones appear. Separators and symbols are keyed by their part type.
 */
export function buildNumberCells(parts: readonly Intl.NumberFormatPart[], digits: readonly string[]): NumberCell[] {
  const integerLength = parts.reduce((n, p) => (p.type === 'integer' ? n + Array.from(p.value).length : n), 0);
  const cells: NumberCell[] = [];
  const counts: Record<string, number> = {};
  let integerIndex = 0;
  let fractionIndex = 0;

  const pushSymbol = (type: string, text: string) => {
    counts[type] = (counts[type] ?? -1) + 1;
    cells.push({ kind: 'symbol', key: `${type}-${counts[type]}`, text, type });
  };

  for (const part of parts) {
    if (part.type === 'integer' || part.type === 'fraction') {
      for (const char of Array.from(part.value)) {
        const digit = digits.indexOf(char);
        if (part.type === 'integer') {
          const place = integerLength - 1 - integerIndex++;
          if (digit === -1) pushSymbol('integer', char);
          else cells.push({ kind: 'digit', key: `int-${place}`, digit });
        } else {
          const index = fractionIndex++;
          if (digit === -1) pushSymbol('fraction', char);
          else cells.push({ kind: 'digit', key: `frac-${index}`, digit });
        }
      }
    } else if (part.type === 'group') {
      // Keyed by the place of the digit that follows it
      cells.push({ kind: 'symbol', key: `group-${integerLength - 1 - integerIndex}`, text: part.value, type: 'group' });
    } else {
      pushSymbol(part.type, part.value);
    }
  }
  return cells;
}

/** The plain formatted text, for screen readers. */
export function numberText(parts: readonly Intl.NumberFormatPart[]): string {
  return parts.map((p) => p.value).join('');
}
