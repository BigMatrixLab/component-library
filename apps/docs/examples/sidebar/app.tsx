'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  Icon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubContent,
  SidebarMenuSubItem,
  SidebarMenuSubTrigger,
  SidebarProvider,
  SidebarTrigger,
  type IconName,
} from 'ui-kit';

const platform: { id: string; label: string; icon: IconName; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: '12' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
  { id: 'team', label: 'Team', icon: 'users' },
];
const projects = [
  { id: 'projects-all', label: 'All projects' },
  { id: 'projects-starred', label: 'Starred' },
  { id: 'projects-archived', label: 'Archived' },
];
const workspace: { id: string; label: string; icon: IconName }[] = [
  { id: 'billing', label: 'Billing', icon: 'credit-card' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const titleOf = (id: string) =>
  [...platform, ...projects, ...workspace].find((item) => item.id === id)?.label ?? 'Dashboard';

export default function SidebarApp() {
  const [active, setActive] = useState('dashboard');
  const item = (id: string, label: string, icon: IconName, badge?: string) => (
    <SidebarMenuItem key={id}>
      <SidebarMenuButton isActive={active === id} tooltip={label} onClick={() => setActive(id)}>
        <Icon name={icon} />
        <span>{label}</span>
        {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <SidebarProvider framed storageKey="ui-docs-sidebar" className="h-[560px] rounded-lg border border-border">
      <Sidebar aria-label="Workspace">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Inc">
                <Avatar size="sm" shape="rounded">
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <span className="grid text-start leading-tight">
                  <span className="font-medium">Acme Inc</span>
                  <span className="text-xs text-muted-foreground">Team plan</span>
                </span>
                <Icon name="chevrons-up-down" className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {platform.slice(0, 2).map((p) => item(p.id, p.label, p.icon, p.badge))}
              <SidebarMenuItem>
                <SidebarMenuSub defaultOpen>
                  <SidebarMenuSubTrigger tooltip="Projects" isActive={active.startsWith('projects')}>
                    <Icon name="folder" />
                    <span>Projects</span>
                  </SidebarMenuSubTrigger>
                  <SidebarMenuSubContent>
                    {projects.map((p) => (
                      <SidebarMenuSubItem key={p.id}>
                        <SidebarMenuSubButton isActive={active === p.id} onClick={() => setActive(p.id)}>
                          {p.label}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSubContent>
                </SidebarMenuSub>
              </SidebarMenuItem>
              {platform.slice(2).map((p) => item(p.id, p.label, p.icon, p.badge))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>{workspace.map((w) => item(w.id, w.label, w.icon))}</SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Amina Rahman">
                <Avatar size="sm">
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <span className="grid text-start leading-tight">
                  <span className="font-medium">Amina Rahman</span>
                  <span className="text-xs text-muted-foreground">amina@acme.dev</span>
                </span>
                <Icon name="log-out" className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col">
        <header className="flex h-12 flex-none items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h2 className="text-sm font-medium">{titleOf(active)}</h2>
        </header>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          {[
            ['Active users', '8,402', '+4.1% this week'],
            ['MRR', '$48,920', '+$2,140 this month'],
            ['Open tickets', '37', '9 waiting on you'],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
        <p className="px-6 text-sm text-muted-foreground">Press Ctrl + B to collapse or expand the sidebar.</p>
      </SidebarInset>
    </SidebarProvider>
  );
}
