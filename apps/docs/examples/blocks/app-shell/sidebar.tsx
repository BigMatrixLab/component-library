'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Icon,
  Kbd,
  KbdGroup,
  Separator,
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
  SidebarProvider,
  SidebarTrigger,
  Stat,
  StatDelta,
  StatGroup,
  StatLabel,
  StatValue,
  ThemeSwitch,
  useTheme,
  type IconName,
  type ThemeMode,
} from 'ui-kit';

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: string;
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
      { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: '4' },
      { id: 'projects', label: 'Projects', icon: 'folder' },
      { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
      { id: 'customers', label: 'Customers', icon: 'users' },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'billing', label: 'Billing', icon: 'credit-card' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
];
const pages = groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.label })));
const teams = [
  { name: 'Acme Inc', plan: 'Team plan', initials: 'AC' },
  { name: 'Northwind', plan: 'Pro plan', initials: 'NW' },
];
const projects = [
  { name: 'Checkout redesign', owner: 'Amina Rahman', status: 'On track', tone: 'success', updated: '2 h ago' },
  { name: 'Mobile app 3.0', owner: 'Diego Santos', status: 'At risk', tone: 'warning', updated: 'Yesterday' },
  { name: 'Billing migration', owner: 'Grace Liu', status: 'In review', tone: 'info', updated: 'Mon' },
] as const;

export default function AppShellSidebar() {
  const [active, setActive] = useState('overview');
  const [team, setTeam] = useState(teams[0]);
  const [searchOpen, setSearchOpen] = useState(false);
  const { mode, setMode } = useTheme();
  const page = pages.find((p) => p.id === active) ?? pages[0];

  return (
    <SidebarProvider framed storageKey={false} className="h-[640px] rounded-lg border border-border">
      <Sidebar aria-label="App navigation">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar size="sm" shape="rounded">
                      <AvatarFallback>{team.initials}</AvatarFallback>
                    </Avatar>
                    <span className="grid text-start leading-tight">
                      <span className="font-medium">{team.name}</span>
                      <span className="text-xs text-muted-foreground">{team.plan}</span>
                    </span>
                    <Icon name="chevrons-up-down" className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                  {teams.map((t) => (
                    <DropdownMenuItem
                      key={t.name}
                      icon={<Icon name={t.name === team.name ? 'check' : 'globe'} />}
                      onSelect={() => setTeam(t)}
                    >
                      {t.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem icon={<Icon name="plus" />}>Create workspace</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {groups.map((g) => (
            <SidebarGroup key={g.label}>
              <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton isActive={active === item.id} tooltip={item.label} onClick={() => setActive(item.id)}>
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Help and docs">
                <Icon name="info" />
                <span>Help and docs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="@container flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 flex-none items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur @2xl:px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Breadcrumb className="min-w-0">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden @3xl:inline-flex">
                <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>
                  {team.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden @3xl:inline-flex" />
              <BreadcrumbItem className="hidden @3xl:inline-flex">{page.group}</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden @3xl:inline-flex" />
              <BreadcrumbItem>
                <BreadcrumbPage>{page.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex flex-none items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="w-8 justify-center px-0 text-muted-foreground @2xl:w-44 @2xl:justify-start @2xl:px-2.5"
            >
              <Icon name="search" />
              <span className="sr-only @2xl:not-sr-only">Search…</span>
              <KbdGroup className="ml-auto hidden @2xl:inline-flex" aria-hidden="true">
                <Kbd size="sm">⌘</Kbd>
                <Kbd size="sm">K</Kbd>
              </KbdGroup>
            </Button>
            <ThemeSwitch size="sm" className="hidden @2xl:inline-flex" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" icon aria-label="Account menu, Amina Rahman">
                  <Avatar size="xs">
                    <AvatarFallback>AR</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent placement="bottom-end" className="w-60">
                <DropdownMenuLabel>
                  <span className="block font-medium text-foreground">Amina Rahman</span>
                  <span className="block font-normal">amina@acme.dev</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={<Icon name="user" />}>Profile</DropdownMenuItem>
                <DropdownMenuItem icon={<Icon name="credit-card" />} onSelect={() => setActive('billing')}>
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem icon={<Icon name="settings" />} onSelect={() => setActive('settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as ThemeMode)} aria-label="Theme">
                  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={<Icon name="log-out" />} variant="destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="grid flex-1 content-start gap-6 p-4 @2xl:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight">{page.label}</h2>
              <p className="text-sm text-muted-foreground">
                {active === 'overview' ? 'Good afternoon, Amina. Here is your week so far.' : `${page.group} · ${team.name}`}
              </p>
            </div>
            <Button size="sm">
              <Icon name="plus" />
              New project
            </Button>
          </div>

          {active === 'overview' ? (
            <>
              <StatGroup variant="shared" aria-label="This week">
                <Stat>
                  <StatLabel>Active projects</StatLabel>
                  <StatValue>12</StatValue>
                  <StatDelta value="2" direction="up" comparison="new this week" />
                </Stat>
                <Stat>
                  <StatLabel>Open issues</StatLabel>
                  <StatValue>37</StatValue>
                  <StatDelta value="9" direction="down" tone="positive" comparison="vs last week" />
                </Stat>
                <Stat>
                  <StatLabel>Monthly revenue</StatLabel>
                  <StatValue>$48,920</StatValue>
                  <StatDelta value="4.6%" direction="up" comparison="vs last month" />
                </Stat>
              </StatGroup>

              <Card className="min-w-0">
                <CardHeader>
                  <CardTitle>Recent projects</CardTitle>
                  <CardDescription>Updated by your team in the last 7 days</CardDescription>
                  <CardAction>
                    <Button variant="ghost" size="sm" onClick={() => setActive('projects')}>
                      View all
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border" aria-label="Recent projects">
                    {projects.map((p) => (
                      <li key={p.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.owner} · {p.updated}
                          </p>
                        </div>
                        <Badge variant={p.tone} dot className="flex-none">
                          {p.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Empty variant="dashed" className="min-h-64">
              <EmptyHeader>
                <EmptyMedia>
                  <Icon name={page.icon} />
                </EmptyMedia>
                <EmptyTitle as="h3">{page.label} goes here</EmptyTitle>
                <EmptyDescription>
                  The shell stays put while this area changes. In Next.js it is the page rendered inside the layout.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </main>
      </SidebarInset>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} hotkey title="Search">
        <CommandInput placeholder="Search pages and actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((p) => (
              <CommandItem key={p.id} icon={<Icon name={p.icon} />} onSelect={() => setActive(p.id)}>
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            {(['light', 'dark', 'system'] as const).map((m) => (
              <CommandItem
                key={m}
                icon={<Icon name={m === 'light' ? 'sun' : m === 'dark' ? 'moon' : 'monitor'} />}
                keywords={['theme', 'appearance', 'mode']}
                onSelect={() => setMode(m)}
              >
                {`Use ${m} theme`}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}
