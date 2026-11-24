'use client';

import { ThemeSwitch } from 'ui-kit';

export default function ThemeSwitchHeader() {
  return (
    <header className="flex w-full max-w-xl items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
      <div className="flex items-center gap-6">
        <span className="text-md font-semibold tracking-tight">Northwind</span>
        <nav aria-label="Example" className="hidden gap-4 text-sm text-muted-foreground sm:flex">
          <span>Overview</span>
          <span>Orders</span>
          <span>Customers</span>
        </nav>
      </div>
      <ThemeSwitch />
    </header>
  );
}
