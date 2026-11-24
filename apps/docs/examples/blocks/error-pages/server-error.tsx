'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, CopyButton, Icon } from 'ui-kit';

const ERROR_ID = 'err_7f3a91c2e04b';
const OCCURRED = '2026-11-25 14:32:08 UTC';

/** A calm illustration from plain shapes: a server rack with one amber light. */
function QuietRack() {
  return (
    <svg viewBox="0 0 240 168" className="w-52 @md:w-60" aria-hidden="true">
      <circle cx="120" cy="88" r="70" className="fill-muted" />
      <circle cx="120" cy="88" r="80" fill="none" strokeDasharray="3 7" strokeLinecap="round" className="stroke-border" strokeWidth="1.5" />
      {[44, 78, 112].map((y, i) => (
        <g key={y}>
          <rect x="72" y={y} width="96" height="28" rx="7" strokeWidth="1.5" className="fill-card stroke-border" />
          <rect x="84" y={y + 11} width="36" height="6" rx="3" className="fill-muted-foreground/25" />
          <circle cx="146" cy={y + 14} r="3.5" className={i === 1 ? 'fill-warning' : 'fill-muted-foreground/25'} />
          <circle cx="156" cy={y + 14} r="3.5" className="fill-muted-foreground/25" />
        </g>
      ))}
      <path d="M58 150h124" strokeWidth="1.5" strokeLinecap="round" className="stroke-border" />
      <circle cx="190" cy="46" r="3" className="fill-warning/50" />
      <circle cx="52" cy="70" r="2" className="fill-muted-foreground/30" />
    </svg>
  );
}

export default function ServerErrorPage() {
  const [state, setState] = useState<'error' | 'retrying' | 'still-down' | 'recovered'>('error');
  const attempts = useRef(0);
  const message = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state === 'recovered') message.current?.focus();
  }, [state]);

  // Demo: the first retry still fails, the second one works
  const retry = () => {
    setState('retrying');
    attempts.current += 1;
    setTimeout(() => setState(attempts.current >= 2 ? 'recovered' : 'still-down'), 1400);
  };

  return (
    <div className="@container w-full rounded-xl border border-border bg-background px-5 py-12 @2xl:py-16">
      <div className="mx-auto grid max-w-xl justify-items-center gap-6 text-center">
        <QuietRack />
        <div className="grid gap-3">
          <p className="font-mono text-sm font-medium text-warning-text">500 · Server error</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight @2xl:text-4xl">Something went wrong on our side</h1>
          <p className="text-md text-muted-foreground">
            It’s not you. Our servers hit an unexpected error and couldn’t load this page. We’ve been alerted and are already looking into it.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={retry} loading={state === 'retrying'} disabled={state === 'recovered'}>
            <Icon name="refresh-cw" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="#home">
              <Icon name="home" />
              Go to dashboard
            </a>
          </Button>
        </div>

        <p
          ref={message}
          role="status"
          tabIndex={-1}
          className={
            state === 'recovered'
              ? 'flex items-center gap-2 text-sm font-medium text-success-text outline-none'
              : 'min-h-5 text-sm text-muted-foreground outline-none'
          }
        >
          {state === 'still-down' && 'Still not loading. Give it a minute, or check the status page for updates.'}
          {state === 'recovered' && (
            <>
              <Icon name="circle-check" />
              We’re back. Reloading your page…
            </>
          )}
        </p>

        <div className="grid w-full max-w-md gap-3 rounded-xl border border-border bg-muted/60 p-4 text-left text-sm">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2">
            <dt className="text-muted-foreground">Error ID</dt>
            <dd className="flex min-w-0 items-center justify-between gap-2">
              <code className="truncate font-mono text-foreground">{ERROR_ID}</code>
              <CopyButton value={ERROR_ID} aria-label="Copy error ID" />
            </dd>
            <dt className="text-muted-foreground">Time</dt>
            <dd className="font-mono text-foreground tabular-nums">{OCCURRED}</dd>
          </dl>
          <p className="text-muted-foreground">
            Contacting support? Include the error ID so we can find what happened.{' '}
            <a href="#status" className="inline-flex items-center gap-1 font-medium text-primary-text hover:underline">
              System status
              <Icon name="external-link" size={14} />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
