'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Icon, cn } from 'ui-kit';

/** Copies `text`; the icon swaps to a check for 1.5s. */
export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button variant="ghost" size="xs" icon aria-label={copied ? 'Copied' : label} onClick={copy} className={cn('bg-background/80', className)}>
      <Icon name={copied ? 'check' : 'copy'} className={cn(copied && 'animate-pop text-success')} />
      <span className="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
    </Button>
  );
}
