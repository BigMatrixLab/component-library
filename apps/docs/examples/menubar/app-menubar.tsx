'use client';

import { useState } from 'react';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from 'ui-kit';

export default function MenubarApp() {
  const [sidebar, setSidebar] = useState(true);
  const [statusBar, setStatusBar] = useState(false);
  const [density, setDensity] = useState('default');
  const [last, setLast] = useState('Nothing chosen yet');
  const run = (text: string) => () => setLast(text);

  return (
    <div className="grid w-full max-w-md justify-items-start gap-3">
      <Menubar aria-label="Application">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent className="w-56">
            <MenubarItem shortcut="⌘N" onSelect={run('New file')}>
              New file
            </MenubarItem>
            <MenubarItem shortcut="⇧⌘N" onSelect={run('New window')}>
              New window
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Open recent</MenubarSubTrigger>
              <MenubarSubContent className="w-52">
                <MenubarItem onSelect={run('Opened roadmap.md')}>roadmap.md</MenubarItem>
                <MenubarItem onSelect={run('Opened pricing.tsx')}>pricing.tsx</MenubarItem>
                <MenubarItem onSelect={run('Opened onboarding.fig')}>onboarding.fig</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem shortcut="⌘S" onSelect={run('Saved')}>
              Save
            </MenubarItem>
            <MenubarItem disabled>Export as PDF…</MenubarItem>
            <MenubarSeparator />
            <MenubarItem shortcut="⌘P" onSelect={run('Printing')}>
              Print…
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent className="w-52">
            <MenubarItem shortcut="⌘Z" onSelect={run('Undo')}>
              Undo
            </MenubarItem>
            <MenubarItem shortcut="⇧⌘Z" onSelect={run('Redo')}>
              Redo
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem shortcut="⌘X" onSelect={run('Cut')}>
              Cut
            </MenubarItem>
            <MenubarItem shortcut="⌘C" onSelect={run('Copy')}>
              Copy
            </MenubarItem>
            <MenubarItem shortcut="⌘V" onSelect={run('Paste')}>
              Paste
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent className="w-56">
            <MenubarCheckboxItem checked={sidebar} onCheckedChange={setSidebar}>
              Show sidebar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
              Show status bar
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarLabel>Density</MenubarLabel>
            <MenubarRadioGroup value={density} onValueChange={setDensity}>
              <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
              <MenubarRadioItem value="default">Default</MenubarRadioItem>
              <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p role="status" className="px-1 text-sm text-muted-foreground">
        {last} · sidebar {sidebar ? 'on' : 'off'} · {density}
      </p>
    </div>
  );
}
