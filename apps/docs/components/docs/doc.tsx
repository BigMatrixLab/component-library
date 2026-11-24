import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from 'ui-kit';
import { findPage, neighbours } from '@/lib/registry';

/** Page wrapper: header from the registry, content, prev/next pager. */
export function DocPage({ href, children, wide }: { href: string; children: ReactNode; wide?: boolean }) {
  const page = findPage(href);
  const { prev, next } = neighbours(href);
  return (
    <article className={wide ? 'mx-auto max-w-5xl' : 'mx-auto max-w-3xl'}>
      <div className="animate-rise">
        <header className="mb-10">
          <p className="mb-2 text-sm text-muted-foreground">{page?.group}</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{page?.title}</h1>
          {page?.description && <p className="mt-3 text-lg text-muted-foreground">{page.description}</p>}
        </header>
        {children}
      </div>
      <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-border pt-6" aria-label="Pager">
        {prev ? (
          <Link href={prev.href} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium transition-colors duration-150 hover:bg-muted/50">
            <Icon name="chevron-left" />
            <span>
              <small className="block text-xs font-normal text-muted-foreground">Previous</small>
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className="flex items-center justify-end gap-3 rounded-lg border border-border p-3 text-right text-sm font-medium transition-colors duration-150 hover:bg-muted/50">
            <span>
              <small className="block text-xs font-normal text-muted-foreground">Next</small>
              {next.title}
            </span>
            <Icon name="chevron-right" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-14 scroll-mt-20">
      <h2 className="mb-3 font-display text-2xl font-semibold tracking-tight">
        <a href={`#${id}`} className="hover:underline hover:decoration-border hover:underline-offset-4">
          {title}
        </a>
      </h2>
      <div className="docs-prose">{children}</div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-md leading-relaxed text-muted-foreground">{children}</p>;
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mb-4 list-disc space-y-1.5 pl-5 text-md leading-relaxed text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: ReactNode;
}

export function PropsTable({ title, rows }: { title?: string; rows: PropRow[] }) {
  return (
    <div className="mb-6">
      {title && <h3 className="mb-2 font-mono text-sm font-medium">{title}</h3>}
      <div className="overflow-x-auto rounded-xl border border-border" tabIndex={0} role="region" aria-label={title ? `${title} props` : "Props"}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 font-medium">Prop</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Default</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-foreground">{r.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.type}</td>
                <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-muted-foreground">{r.default ?? '—'}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function KeyTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-border" tabIndex={0} role="region" aria-label="Keyboard shortcuts">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-2.5 font-medium">Key</th>
            <th className="px-4 py-2.5 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 whitespace-nowrap">
                <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">{k}</kbd>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
