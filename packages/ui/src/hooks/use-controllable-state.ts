'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue`). Every stateful component uses this so the two modes
 * behave identically.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T | ((prev: T) => T)) => void] {
  const [internal, setInternal] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : internal;
  const currentRef = useRef(current);
  currentRef.current = current;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      currentRef.current = resolved;
      if (!controlled) setInternal(resolved);
      onChangeRef.current?.(resolved);
    },
    [controlled],
  );

  return [current, setValue];
}
