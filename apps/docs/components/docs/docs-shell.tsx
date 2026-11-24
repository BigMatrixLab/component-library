'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button, Icon, cn } from 'ui-kit';
import { nav } from '@/lib/registry';
import { AccentPicker, PackPicker, ThemeToggle } from './theme-controls';

export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => setNavOpen(false), [pathname]);
  // Marker for tests: the docs are hydrated and interactive
  useEffect(() => {
    document.documentElement.dataset.hydrated = '';
  }, []);
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setNavOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const q = query.trim().toLowerCase();

  return (
    <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-[16rem_minmax(0,1fr)]">
      <header className="sticky top-0 z-40 col-span-full flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md backdrop-saturate-150">
        <Button variant="ghost" size="sm" icon className="lg:hidden" aria-label="Open navigation" onClick={() => setNavOpen(true)}>
          <Icon name="menu" />
        </Button>
        <Link href="/" className="flex items-center gap-2 text-md font-semibold tracking-tight">
          <span className="size-5 rounded-md bg-primary" aria-hidden="true" />
          ui-kit
          <span className="rounded-full border border-border px-1.5 font-mono text-xs font-normal text-muted-foreground">0.0</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <PackPicker className="hidden md:block" />
          <AccentPicker className="hidden md:flex" />
          <ThemeToggle />
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-[var(--ui-overlay)] transition-opacity duration-200 lg:hidden',
          navOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />
      <aside
        aria-label="Documentation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar transition-transform duration-[var(--ui-spring-smooth-duration)] ease-[var(--ui-spring-smooth)]',
          'lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100dvh-3.5rem)] lg:w-auto lg:translate-x-0 lg:bg-transparent',
          navOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full',
        )}
      >
        <div className="relative m-3 mb-1 flex items-center text-muted-foreground">
          <Icon name="search" className="pointer-events-none absolute left-2.5" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label="Search the docs"
            className="h-8 w-full rounded-md border border-border bg-background pr-2 pl-8 text-sm text-foreground outline-none focus:border-ring"
          />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-6">
          {nav.map((group) => {
            const items = group.items.filter((i) => !q || i.title.toLowerCase().includes(q));
            if (!items.length) return null;
            return (
              <div key={group.title} className="mb-5">
                <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">{group.title}</p>
                {items.map((item) => {
                  const href = `${group.base}/${item.slug}`;
                  const active = pathname === href;
                  if (item.soon)
                    return (
                      <span key={href} className="flex h-8 items-center justify-between px-2 text-sm text-muted-foreground/60">
                        {item.title}
                        <span className="text-xs">soon</span>
                      </span>
                    );
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex h-8 items-center rounded-md px-2 text-sm transition-colors duration-150',
                        active ? 'bg-sidebar-accent font-medium text-foreground' : 'text-foreground/75 hover:bg-sidebar-accent hover:text-foreground',
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-border p-4 md:hidden">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Theme pack</p>
          <PackPicker className="mb-4" />
          <p className="mb-2 text-xs font-medium text-muted-foreground">Accent</p>
          <AccentPicker />
        </div>
      </aside>

      <main className="min-w-0 px-4 pt-10 pb-24 sm:px-8 lg:px-12">{children}</main>
    </div>
  );
}
