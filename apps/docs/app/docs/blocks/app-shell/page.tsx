import type { Metadata } from 'next';
import { CodeBlock } from '@/components/docs/code-block';
import { Code, DocPage, KeyTable, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import AppShellSidebar from '@/examples/blocks/app-shell/sidebar';
import AppShellTopNavbar from '@/examples/blocks/app-shell/top-navbar';

export const metadata: Metadata = { title: 'App shell' };

const layoutCode = `import type { ReactNode } from 'react';
import { SidebarInset, SidebarProvider } from 'ui-kit';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';

// Every page in the (app) route group renders inside this shell. The layout
// stays mounted while people move between pages, so the sidebar keeps its
// state and only {children} changes. No 'use client' here: the provider and
// the two shell parts are client components, the pages stay on the server.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="@container flex flex-col">
        <SiteHeader />
        <main className="flex-1 p-4 @2xl:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}`;

const sidebarCode = `'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Icon,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type IconName,
} from 'ui-kit';

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Overview', icon: 'layout-dashboard' },
  { href: '/projects', label: 'Projects', icon: 'folder' },
  { href: '/customers', label: 'Customers', icon: 'users' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar aria-label="App navigation">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {nav.map((item) => (
              <SidebarMenuItem key={item.href}>
                {/* asChild: the row is a real link, so prefetching and new-tab clicks work */}
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <Link href={item.href}>
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}`;

const headerCode = `'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Separator,
  SidebarTrigger,
  ThemeSwitch,
} from 'ui-kit';

const titles: Record<string, string> = {
  dashboard: 'Overview',
  projects: 'Projects',
  customers: 'Customers',
  settings: 'Settings',
};

export function SiteHeader() {
  const section = usePathname().split('/')[1] ?? '';
  return (
    <header className="sticky top-0 z-10 flex h-14 flex-none items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{titles[section] ?? 'Overview'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitch size="sm" />
      </div>
    </header>
  );
}`;

const rootCode = `import { ThemeScript } from 'ui-kit';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}`;

export default function AppShellBlockPage() {
  return (
    <DocPage href="/docs/blocks/app-shell" wide>
      <Section id="sidebar" title="Sidebar shell">
        <P>
          A collapsible sidebar with a workspace switcher, and an inset header with the sidebar trigger, a breadcrumb, a search
          button that opens the command palette (Ctrl / ⌘ + K), the theme switch and an account menu. Press Ctrl / ⌘ + B to collapse
          the sidebar to an icon rail; below 768px it opens as a sheet.
        </P>
        <Example component="blocks/app-shell" file="blocks/app-shell/sidebar" title="Sidebar shell" align="stretch" minHeight={680}>
          <AppShellSidebar />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Sidebar shell: apps with more than five destinations, or people who stay in the app all day.',
            'Top navbar shell: up to five or six sections, content that wants the full width (tables, boards), or a product that also has a marketing site with the same header.',
          ]}
        />
        <P>Not for: marketing pages (use the Hero and Footer blocks with a Navbar) or a single-page tool.</P>
      </Section>

      <Section id="top-navbar" title="Top navbar shell">
        <P>
          A sticky navbar with the sections, search, notifications and the account menu (with the theme choice). Below 768px of its
          own width the links move into a sheet behind the menu button.
        </P>
        <Example component="blocks/app-shell" file="blocks/app-shell/top-navbar" title="Top navbar shell" align="stretch" minHeight={680}>
          <AppShellTopNavbar />
        </Example>
      </Section>

      <Section id="nextjs" title="Next.js usage">
        <P>
          Put the shell in the layout of a route group, so it renders once and stays mounted while the pages inside it change. Split
          it at the interactive parts: the layout itself is a Server Component, <Code>AppSidebar</Code> and <Code>SiteHeader</Code>{' '}
          carry <Code>&apos;use client&apos;</Code> because they read the current path, and every page passed in as{' '}
          <Code>children</Code> stays a Server Component that can fetch its own data.
        </P>
        <CodeBlock title="app/(app)/layout.tsx" code={layoutCode} />
        <CodeBlock title="components/app-sidebar.tsx" code={sidebarCode} />
        <CodeBlock title="components/site-header.tsx" code={headerCode} />
        <List
          items={[
            <>
              <Code>SidebarProvider</Code> is a client component, but Server Components passed to it as children stay on the
              server. That is why the provider can wrap the whole layout without turning your pages into client code.
            </>,
            <>
              Pass <Code>usePathname()</Code> to <Code>{'<Navbar routeKey>'}</Code> in the navbar shell so the mobile menu closes
              after navigation. The sidebar sheet closes itself when a row is clicked.
            </>,
            <>
              The collapsed state is remembered in <Code>localStorage</Code> (<Code>storageKey</Code>) and restored before paint, so
              the first frame already has the right width and nothing animates on load.
            </>,
            <>
              Add <Code>ThemeScript</Code> to the root layout once, so the theme is applied before the first paint and the theme
              switch hydrates without a flash.
            </>,
          ]}
        />
        <CodeBlock title="app/layout.tsx" code={rootCode} />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Ctrl / ⌘ + B', 'Collapse or expand the sidebar (opens the sheet on phones).'],
            ['Ctrl / ⌘ + K', 'Open or close the command palette (sidebar shell).'],
            ['Tab', 'Moves through the sidebar rows, then the header controls, then the page.'],
            ['Esc', 'Closes the open menu, sheet or palette and returns focus to its trigger.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>
              The sidebar is a named <Code>aside</Code> landmark; the current page row has <Code>aria-current=&quot;page&quot;</Code>
              and the breadcrumb ends with the current page.
            </>,
            'Icon-only buttons (sidebar trigger, search on narrow screens, notifications, account) have accessible names.',
            'On the icon rail every row keeps its name, and its label appears in a tooltip on hover or focus.',
            'The theme switch is a radio group; the account menu offers the same choice for narrow headers where the switch is hidden.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
