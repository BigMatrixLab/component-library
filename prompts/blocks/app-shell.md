## Block: App shell

The frame an app's pages render inside: navigation, a header with global controls, and a content area. Two variants, each one self-contained file. In the docs they are framed at 640px high; in an app the same markup fills the page (drop `framed` and the fixed height).

### Variants
- **Sidebar shell** (`sidebar`): `SidebarProvider framed storageKey={false}` → `Sidebar` (workspace switcher `DropdownMenu` in the header, grouped `SidebarMenuButton`s with icons, tooltips and a count badge, a help row in the footer) + `SidebarInset` (`@container`) holding a sticky 56px header and the page. Header, left to right: `SidebarTrigger`, vertical `Separator`, `Breadcrumb` (workspace › group › page; only the page under 48rem), then search button (icon only under 42rem, "Search…" + ⌘K keycaps above), `ThemeSwitch size="sm"` (from 42rem), account `DropdownMenu` (avatar trigger; profile, billing, settings, a Theme radio group, log out). `CommandDialog` with `hotkey` lists the pages and the theme commands.
- **Top navbar shell** (`top-navbar`): a scroll container (`h-[640px] overflow-y-auto`) with a sticky `Navbar` (brand, five `NavbarLink`s, actions: search and notifications hidden when narrow via `ui-navbar-hide-narrow`, account menu, `NavbarMobileToggle`) and `NavbarMobileMenu` (the links plus a Search button). Below: breadcrumb, `h2` page title with a one-line description and two actions, then a grid of project cards (`Card` with mono title, URL, status `Badge`, area `Sparkline`, deploy time). Mobile menu state is controlled so the search button can close it before opening the palette.

Both: clicking a nav item swaps the page title, breadcrumb and content; pages other than the home one show a dashed `Empty` placeholder.

### Anatomy (sidebar shell)
```
SidebarProvider (framed, h-[640px], rounded-lg border)
  Sidebar aria-label="App navigation"
    SidebarHeader > workspace switcher (SidebarMenuButton size="lg" as DropdownMenuTrigger)
    SidebarContent > SidebarGroup × 2 > SidebarGroupLabel + SidebarMenu
    SidebarFooter > help row
  SidebarInset.@container.flex.flex-col
    header.sticky.top-0.h-14.border-b.bg-background/85.backdrop-blur
    main.grid.gap-6.p-4 (@2xl:p-6)
  CommandDialog (hotkey)
```

### Visual rules
- Header: 56px, 1px bottom border, `bg-background/85` with backdrop blur, 12px side padding (16px from 42rem), 8px gaps.
- Sidebar: library defaults (256px, 56px rail, `--ui-sidebar` surface). Only the active row is highlighted.
- Page title 20px/600 (`text-xl`, 24px in the navbar shell), description 14px muted.
- Primary colour is spent on one action per page ("New project") and the brand mark.

### Behaviour
- Ctrl/⌘ + B collapses the sidebar to the rail (labels clip, tooltips appear); below 768px viewport the sidebar is a sheet opened by the trigger.
- Ctrl/⌘ + K toggles the palette (sidebar shell only, so two shells on one page never fight over the key).
- Theme changes go through `useTheme()`; the switch and the menu radio group stay in sync.

### Next.js
- Put the shell in `app/(app)/layout.tsx` (Server Component). The interactive parts (`AppSidebar`, `SiteHeader`) are `'use client'` files that read `usePathname()`; pages stay Server Components passed in as `children`.
- `SidebarMenuButton asChild` wraps `next/link`; pass `usePathname()` to `Navbar routeKey` so the mobile menu closes on navigation.
- `ThemeScript` in the root layout's `<head>`, `suppressHydrationWarning` on `<html>`.

### Accessibility
- Sidebar is a named `aside`; the active row has `aria-current="page"`; the breadcrumb ends with `BreadcrumbPage`.
- Icon-only buttons have names: "Toggle sidebar", "Search", "Notifications, 3 unread", "Account menu, Amina Rahman".
- The search button keeps a visually hidden "Search…" label when it shrinks to an icon.

### Acceptance checks
- Collapsing the sidebar glides the width 256 → 56px without moving the header controls.
- At 360px: no horizontal overflow; the header shows trigger, current page, search icon and avatar only; the navbar shows brand, avatar and menu button.
- Menus open below their trigger, align to its end, and return focus to it on Esc.
