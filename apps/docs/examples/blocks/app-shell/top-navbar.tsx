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
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarMobileMenu,
  NavbarMobileToggle,
  NavbarNav,
  Separator,
  Sparkline,
  useTheme,
  type IconName,
  type ThemeMode,
} from 'ui-kit';

const sections: { id: string; label: string; icon: IconName; blurb: string }[] = [
  { id: 'projects', label: 'Projects', icon: 'folder', blurb: 'Everything your team ships, with live traffic.' },
  { id: 'deployments', label: 'Deployments', icon: 'zap', blurb: 'Every build, preview and rollback in one list.' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart', blurb: 'Visitors, performance and conversions.' },
  { id: 'domains', label: 'Domains', icon: 'globe', blurb: 'DNS records and certificates for every project.' },
  { id: 'settings', label: 'Settings', icon: 'settings', blurb: 'Team members, billing and integrations.' },
];

const projects = [
  { name: 'storefront', url: 'shop.northwind.dev', status: 'Ready', deployed: '12 min ago', traffic: [32, 35, 31, 40, 44, 41, 48, 52, 50, 58, 61, 66] },
  { name: 'marketing-site', url: 'northwind.dev', status: 'Ready', deployed: '3 h ago', traffic: [22, 24, 23, 27, 25, 29, 31, 30, 33, 32, 35, 37] },
  { name: 'admin', url: 'admin.northwind.dev', status: 'Building', deployed: 'Just now', traffic: [8, 9, 9, 10, 9, 11, 10, 12, 11, 12, 13, 12] },
  { name: 'docs', url: 'docs.northwind.dev', status: 'Ready', deployed: 'Yesterday', traffic: [14, 15, 17, 16, 18, 21, 19, 22, 24, 23, 26, 27] },
  { name: 'api-gateway', url: 'api.northwind.dev', status: 'Failed', deployed: '2 days ago', traffic: [41, 43, 42, 45, 44, 47, 46, 45, 48, 47, 49, 50] },
  { name: 'status-page', url: 'status.northwind.dev', status: 'Ready', deployed: 'Last week', traffic: [3, 4, 3, 5, 4, 6, 5, 4, 7, 5, 6, 8] },
] as const;
const tone = { Ready: 'success', Building: 'warning', Failed: 'destructive' } as const;

export default function AppShellTopNavbar() {
  const [active, setActive] = useState('projects');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { mode, setMode } = useTheme();
  const section = sections.find((s) => s.id === active) ?? sections[0];

  const links = sections.map((s) => (
    <NavbarLink
      key={s.id}
      href="#"
      active={active === s.id}
      onClick={(e) => {
        e.preventDefault();
        setActive(s.id);
      }}
    >
      {s.label}
    </NavbarLink>
  ));

  return (
    <div className="@container h-[640px] overflow-y-auto rounded-lg border border-border bg-background">
      <Navbar routeKey={active} mobileOpen={menuOpen} onMobileOpenChange={setMenuOpen}>
        <NavbarBrand href="#" onClick={(e) => e.preventDefault()}>
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Icon name="zap" size={16} />
          </span>
          Lumen
        </NavbarBrand>
        <NavbarNav>{links}</NavbarNav>
        <NavbarActions>
          <Button variant="ghost" size="sm" icon aria-label="Search" className="ui-navbar-hide-narrow" onClick={() => setSearchOpen(true)}>
            <Icon name="search" />
          </Button>
          <Button variant="ghost" size="sm" icon aria-label="Notifications, 3 unread" className="ui-navbar-hide-narrow relative">
            <Icon name="bell" />
            <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>
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
                <span className="block font-normal">amina@northwind.dev</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={<Icon name="user" />}>Profile</DropdownMenuItem>
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
          <NavbarMobileToggle />
        </NavbarActions>
        <NavbarMobileMenu title="Lumen">
          {links}
          <Separator className="my-2" />
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
          >
            <Icon name="search" />
            Search
          </Button>
        </NavbarMobileMenu>
      </Navbar>

      <div className="mx-auto grid max-w-6xl gap-6 p-4 @2xl:p-6">
        <div className="grid gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>
                  Northwind
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{section.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight">{section.label}</h2>
              <p className="text-sm text-muted-foreground">{section.blurb}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <Icon name="users" />
                Invite
              </Button>
              <Button size="sm">
                <Icon name="plus" />
                New project
              </Button>
            </div>
          </div>
        </div>

        {active === 'projects' ? (
          <ul className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3" aria-label="Projects">
            {projects.map((p) => (
              <li key={p.name} className="min-w-0">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="truncate font-mono text-sm">{p.name}</CardTitle>
                    <CardDescription className="truncate">{p.url}</CardDescription>
                    <CardAction>
                      <Badge variant={tone[p.status]} size="sm" dot>
                        {p.status}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <Sparkline
                      data={[...p.traffic]}
                      variant="area"
                      height={40}
                      color={p.status === 'Failed' ? 'series-4' : 'series-1'}
                      aria-label={`${p.name} visitors, last 12 days`}
                    />
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon name="clock" size={14} />
                      Deployed {p.deployed}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Empty variant="dashed" className="min-h-72">
            <EmptyHeader>
              <EmptyMedia>
                <Icon name={section.icon} />
              </EmptyMedia>
              <EmptyTitle as="h3">{section.label} goes here</EmptyTitle>
              <EmptyDescription>
                The navbar stays put while this area changes. In Next.js it is the page rendered inside the layout.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search">
        <CommandInput placeholder="Search projects and pages…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {sections.map((s) => (
              <CommandItem key={s.id} icon={<Icon name={s.icon} />} onSelect={() => setActive(s.id)}>
                {s.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projects">
            {projects.map((p) => (
              <CommandItem key={p.name} icon={<Icon name="folder" />} keywords={[p.url]} onSelect={() => setActive('projects')}>
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
