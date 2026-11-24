'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from 'ui-kit';
import { CopyButton } from './copy-button';

type Tab = 'preview' | 'code' | 'prompt';
type Mode = 'recreate' | 'adapt';

const tabs: { id: Tab; label: string }[] = [
  { id: 'preview', label: 'Preview' },
  { id: 'code', label: 'Code' },
  { id: 'prompt', label: 'Prompt' },
];

export function ExampleTabs({
  file,
  children,
  code,
  codeHtml,
  prompts,
  align,
  minHeight = 176,
}: {
  file: string;
  children: ReactNode;
  code: string;
  codeHtml: string;
  prompts: { recreate: string; adapt: string };
  align: 'center' | 'start' | 'stretch';
  minHeight?: number;
}) {
  const id = useId();
  const [tab, setTab] = useState<Tab>('preview');
  const [mode, setMode] = useState<Mode>('recreate');
  const prompt = prompts[mode];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === tab);
    const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(tabs[next]!.id);
    document.getElementById(`${id}-tab-${tabs[next]!.id}`)?.focus();
  };

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-2">
        <div role="tablist" aria-label="Example views" className="flex gap-1 py-1.5" onKeyDown={onKeyDown}>
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`${id}-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`${id}-panel`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              className="h-7 cursor-pointer rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow-xs"
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'code' && <CopyButton text={code} label="Copy code" />}
        {tab === 'prompt' && <CopyButton text={prompt} label="Copy prompt" />}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`}>
        {tab === 'preview' && (
          <div
            data-example={file}
            className={cn(
              'p-6 sm:p-10',
              align === 'center' && 'flex flex-wrap items-center justify-center gap-3',
              align === 'start' && 'flex flex-wrap items-start justify-start gap-3',
            )}
            style={{
              minHeight,
              backgroundImage: 'radial-gradient(color-mix(in oklch, var(--ui-foreground) 7%, transparent) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {children}
          </div>
        )}
        {tab === 'code' && (
          <div className="docs-code max-h-[30rem] overflow-auto bg-muted/30 p-4 text-sm" dangerouslySetInnerHTML={{ __html: codeHtml }} />
        )}
        {tab === 'prompt' && (
          <div className="bg-muted/30">
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
              <div role="radiogroup" aria-label="Prompt mode" className="inline-flex rounded-md bg-muted p-0.5">
                {(['recreate', 'adapt'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => setMode(m)}
                    className="h-7 cursor-pointer rounded-[calc(var(--radius-md)-2px)] px-3 text-sm font-medium text-muted-foreground capitalize transition-colors duration-150 aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-xs"
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {mode === 'recreate'
                  ? 'Paste into any AI tool to rebuild this exact example.'
                  : 'Same design and behaviour, your content: fill in the last section.'}
              </p>
              <span className="ml-auto font-mono text-xs text-muted-foreground">{Math.round(prompt.length / 4).toLocaleString()} tokens</span>
            </div>
            <pre className="max-h-[26rem] overflow-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/85">
              {prompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
