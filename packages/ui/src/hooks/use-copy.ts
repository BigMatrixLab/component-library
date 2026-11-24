'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { copyText } from '../lib/copy-text';

export type CopyStatus = 'idle' | 'copied' | 'error';

export interface UseCopyOptions {
  /** How long `copied` / `error` stay before returning to `idle`, in ms. Default 1500. */
  resetAfter?: number;
  onCopy?: (text: string) => void;
  onError?: () => void;
}

/**
 * Copy text and track the result.
 *   const { copy, copied, status } = useCopy();
 *   <button onClick={() => copy(apiKey)}>{copied ? 'Copied' : 'Copy'}</button>
 * `copy` resolves to whether it worked.
 */
export function useCopy({ resetAfter = 1500, onCopy, onError }: UseCopyOptions = {}) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacks = useRef({ onCopy, onError });
  callbacks.current = { onCopy, onError };

  const clear = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    setStatus('idle');
  }, [clear]);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      clear();
      setStatus(ok ? 'copied' : 'error');
      if (ok) callbacks.current.onCopy?.(text);
      else callbacks.current.onError?.();
      timer.current = setTimeout(() => {
        timer.current = null;
        setStatus('idle');
      }, resetAfter);
      return ok;
    },
    [clear, resetAfter],
  );

  useEffect(() => clear, [clear]);

  return { copy, reset, status, copied: status === 'copied', error: status === 'error' };
}
