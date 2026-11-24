'use client';

import { useCallback, useState } from 'react';

/** Hidden-series state for legend toggling. The last visible series cannot be hidden. */
export function useSeriesVisibility(): [ReadonlySet<string>, (key: string, total: number) => void] {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = useCallback((key: string, total: number) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (total - next.size > 1) next.add(key);
      else return prev;
      return next;
    });
  }, []);
  return [hidden, toggle];
}
