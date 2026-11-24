import { useCallback, type Ref, type RefCallback } from 'react';

type PossibleRef<T> = Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/** Merge several refs into one callback ref. */
export function composeRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) setRef(ref, node);
  };
}

/** Memoised composeRefs for use inside components. */
export function useComposedRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(composeRefs(...refs), refs);
}
