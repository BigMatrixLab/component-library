## Component: Navbar

A sticky site header with a blurred backdrop, a gliding active-link highlight and a mobile menu in a Sheet.

### Anatomy
```
<Navbar variant sticky routeKey mobileOpen|defaultMobileOpen|onMobileOpenChange>   Sheet context + header.ui-navbar data-variant data-sticky data-scrolled
  div.ui-navbar-inner                                                              flex row, max 1280px, height 64px (floating 56px)
    <NavbarBrand asChild?>      a.ui-navbar-brand
    <NavbarNav indicator>       nav.ui-navbar-nav aria-label="Main" data-indicator="pill|underline" — position: relative
      <NavbarLink active asChild?>   a.ui-navbar-link aria-current="page"
      span.ui-navbar-indicator       ONE element, aria-hidden, glides to [aria-current="page"]
    <NavbarActions>             div.ui-navbar-actions (class ui-navbar-hide-narrow hides a child when collapsed)
    <NavbarMobileToggle />      ghost icon <Button> inside SheetTrigger, class ui-navbar-toggle, aria-label="Open menu"
    <NavbarMobileMenu title side>   SheetContent (size sm) → SheetHeader/SheetTitle + SheetBody > nav.ui-navbar-mobile-nav aria-label="Mobile"
```

### Behaviour
- Sticky: `position: sticky; top: 0` (floating: `top: 12px`). `data-scrolled` is set when the nearest scrolling ancestor (or the window) has scrolled more than 2px (`useScrolled`); the bottom border appears then.
- Gliding highlight: `useIndicator(navRef, '[aria-current="page"]', key)` writes `--ui-tab-x/y/w/h`; `data-ready` after the first measure, `data-animate` two frames later. `key` increments from a `MutationObserver` on `aria-current` and child changes, so a Next.js `Link` that gets `aria-current` re-aims it.
- Collapse: the header is a container (`container-type: inline-size`). Under 768px of its own width the nav hides, the toggle shows and the brand takes the free space (`@container`). It works inside a narrow frame as well as on a phone.
- Mobile menu closes on: a click on an `a[href]` inside it, a change of `routeKey` (not on mount), `popstate`, `hashchange`, the Sheet's own Esc / overlay / close.

### Visual rules
- Default: `--ui-background` at 82% with `backdrop-filter: saturate(1.4) blur(14px)` (opaque fallback), 1px bottom border transparent → `--ui-border` when scrolled.
- Floating: `width: min(100% - 24px, 1024px)`, 12px top margin, 1px `--ui-border`, 999px radius, `--ui-surface-raised` at 78%, `--ui-shadow-sm` (`--ui-shadow-md` scrolled).
- Link: 36px high, 12px padding, 14px/500, `--radius-md`, muted → `--ui-foreground` (hover on fine pointers, and when active). Pill indicator `--ui-accent`; underline: links fill the height, 2px bar `--ui-primary` on the bottom edge.
- Brand 15px/600, tracking −0.01em. Focus ring `0 0 0 3px` of `--ui-ring` at 45%.
- Mobile links: 44px rows, 15px; the active one `--ui-accent`.

### Motion
- Indicator: `transform`, `width`, `height` on `--ui-spring-morph`; none on first placement. Border / shadow / background fade 220ms. The sheet slides on `--ui-spring-smooth`. Reduced motion jumps.

### Accessibility
- header + labelled nav; `aria-current="page"` on the active link. The toggle has `aria-haspopup="dialog"` and `aria-expanded`; the sheet is modal with a title and returns focus to the toggle.

### Acceptance checks
- The indicator box matches the active link box after a click, a resize and a route change.
- Border is transparent at scrollTop 0 and visible after scrolling.
- At 360px wide the links are hidden, the toggle opens a sheet, and clicking a link closes it.
- Light and dark both keep text legible over scrolled content.
