'use client';

import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Icon,
  Kbd,
} from 'ui-kit';

export default function CommandInline() {
  const [last, setLast] = useState('Nothing run yet');
  const run = (value: string) => setLast(`Ran “${value}”`);

  return (
    <div className="grid w-full max-w-lg gap-2">
      <Command label="Command palette" className="shadow-sm">
        <CommandInput placeholder="Search pages, actions and settings…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem icon={<Icon name="layout-dashboard" />} onSelect={run}>
              Dashboard
            </CommandItem>
            <CommandItem icon={<Icon name="credit-card" />} keywords={['invoices', 'payments', 'plan']} onSelect={run}>
              Billing
            </CommandItem>
            <CommandItem icon={<Icon name="users" />} keywords={['members', 'people', 'invite']} onSelect={run}>
              Team
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem icon={<Icon name="plus" />} shortcut="⌘N" keywords={['create', 'add']} onSelect={run}>
              New project
            </CommandItem>
            <CommandItem icon={<Icon name="download" />} keywords={['csv', 'export']} onSelect={run}>
              Download invoices
            </CommandItem>
            <CommandItem icon={<Icon name="mail" />} keywords={['invite', 'member']} onSelect={run}>
              Invite teammate
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem icon={<Icon name="moon" />} keywords={['theme', 'dark mode', 'appearance']} onSelect={run}>
              Switch to dark theme
            </CommandItem>
            <CommandItem icon={<Icon name="bell" />} keywords={['alerts', 'email']} onSelect={run}>
              Notification settings
            </CommandItem>
            <CommandItem icon={<Icon name="lock" />} disabled onSelect={run}>
              Security keys (soon)
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span>
            <Kbd size="sm">↑</Kbd>
            <Kbd size="sm">↓</Kbd> navigate
          </span>
          <span>
            <Kbd size="sm">↵</Kbd> select
          </span>
        </CommandFooter>
      </Command>
      <p role="status" className="px-1 text-sm text-muted-foreground">
        {last}
      </p>
    </div>
  );
}
