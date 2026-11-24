'use client';

import { useState } from 'react';
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Icon,
  Kbd,
  KbdGroup,
} from 'ui-kit';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('Nothing run yet');
  const run = (value: string) => setLast(`Ran “${value}”`);

  return (
    <div className="grid justify-items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Icon name="search" />
        Search…
        <KbdGroup className="ml-2">
          <Kbd size="sm">⌘</Kbd>
          <Kbd size="sm">K</Kbd>
        </KbdGroup>
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {last}
      </p>

      <CommandDialog open={open} onOpenChange={setOpen} hotkey title="Command palette">
        <CommandInput placeholder="Search pages, actions and settings…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem icon={<Icon name="home" />} onSelect={run}>
              Overview
            </CommandItem>
            <CommandItem icon={<Icon name="folder" />} keywords={['repositories', 'apps']} onSelect={run}>
              Projects
            </CommandItem>
            <CommandItem icon={<Icon name="bar-chart" />} keywords={['metrics', 'traffic']} onSelect={run}>
              Analytics
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem icon={<Icon name="plus" />} shortcut="⌘N" keywords={['create']} onSelect={run}>
              New project
            </CommandItem>
            <CommandItem icon={<Icon name="copy" />} keywords={['link', 'share']} onSelect={run}>
              Copy preview link
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem icon={<Icon name="sun" />} keywords={['theme', 'light mode', 'appearance']} onSelect={run}>
              Switch to light theme
            </CommandItem>
            <CommandItem icon={<Icon name="settings" />} shortcut="⌘," onSelect={run}>
              Preferences
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
          <span>
            <Kbd size="sm">Esc</Kbd> close
          </span>
        </CommandFooter>
      </CommandDialog>
    </div>
  );
}
