'use client';

import { useState } from 'react';
import {
  Icon,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  type IconName,
} from 'ui-kit';

const docs: { label: string; icon: IconName }[] = [
  { label: 'Getting started', icon: 'home' },
  { label: 'Guides', icon: 'file' },
  { label: 'API reference', icon: 'command' },
  { label: 'Changelog', icon: 'clock' },
];

export default function SidebarOffcanvas() {
  const [active, setActive] = useState('Getting started');
  return (
    <SidebarProvider
      framed
      shortcut={false}
      storageKey={false}
      className="h-72 rounded-lg border border-border"
    >
      <Sidebar collapsible="offcanvas" aria-label="Documentation">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Documentation</SidebarGroupLabel>
            <SidebarMenu>
              {docs.map(({ label, icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton isActive={active === label} onClick={() => setActive(label)}>
                    <Icon name={icon} />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex h-12 flex-none items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h2 className="text-sm font-medium">{active}</h2>
        </header>
        <p className="p-6 text-sm text-muted-foreground">
          This sidebar slides away completely instead of shrinking to an icon rail.
        </p>
      </SidebarInset>
    </SidebarProvider>
  );
}
