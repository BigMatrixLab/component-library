## Component: Navigation menu

Site-header menus whose triggers share ONE floating panel. The panel resizes between items, content slides in from the side of travel and a caret glides under the active trigger. Narrow screens get an accordion.

### Anatomy
```
<NavigationMenu value|defaultValue|onValueChange mode="auto|menu|accordion" collapseBelow openDelay closeDelay>   nav.ui-nav-menu aria-label="Site menu" data-mode
  <NavigationMenuList>                      ul.ui-nav-menu-list (arrow keys between triggers / links)
    <NavigationMenuItem value?>             li.ui-nav-menu-item
      <NavigationMenuTrigger>               button.ui-nav-menu-trigger data-nav-value aria-expanded aria-controls + chevron
      <NavigationMenuContent>               portaled into the shared panel (menu mode) or .ui-nav-menu-accordion (accordion)
        <NavigationMenuLink asChild? active> a.ui-nav-menu-link[data-in-content]
          <NavigationMenuLinkTitle /> <NavigationMenuLinkDescription />
    <NavigationMenuItem><NavigationMenuLink />     plain link in the bar
  (rendered by NavigationMenu in menu mode, when open)
  div.ui-floating.ui-nav-menu-panel[popover=manual][data-state]   top layer, left/top written by JS, --ui-nav-caret-x
    div.ui-nav-menu-surface   border, radius-xl, shadow-lg, overflow hidden — the visible box
      div.ui-nav-menu-slot    position: relative; width: max-content — the content's natural size
        div.ui-nav-menu-content[data-state][data-motion="from-start|from-end|to-start|to-end"]
    span.ui-nav-menu-caret
```
Layout helper class: `.ui-nav-menu-grid` with `--ui-nav-cols` and `--ui-nav-width` (full width, one column in the accordion).

### Behaviour
- State `value` ('' = closed) is controlled or uncontrolled. Mode `auto`: `menu` at ≥ `collapseBelow` (768) viewport width, `accordion` below. Triggers register their elements in a map.
- Hover (mouse only): entering a trigger opens it after `openDelay` (120ms), or at once if a panel is already open. Leaving the whole nav (the panel is a DOM child, so moving trigger → panel never leaves) closes it after `closeDelay` (240ms); entering cancels. Entering a plain link closes it after 150ms. A click right after a hover-open keeps it open; the next click closes it. Touch: click toggles.
- Keyboard: ←/→ between triggers and links (and switch the open panel); ↓ opens and focuses the first link (or enters an open panel); Enter/Space toggle with focus kept on the trigger; Tab from an open trigger enters the panel; inside, arrows move between links, ↑ from the first returns to the trigger; Esc closes and refocuses the trigger; focus leaving the nav closes it; clicking a link closes it.
- Switching items (menu mode): before the state change capture the surface and caret rects and the direction (`end` if the new trigger is to the right). After render (layout effect): `place()` centres the panel under the new trigger (clamped to 8px of the viewport, 12px below the trigger, caret clamped 20px inside), then animate with WAAPI on `--ui-spring-smooth`: the panel's `translate` from the old to the new position, the surface's `width`/`height` from old to new box, the caret's `translate`. The slot (not the surface) defines the natural size, so animating the surface never feeds back into positioning. Skipped for reduced motion.
- Content: the new item enters with `from-<direction>` (28px, opacity, 2px blur, 380ms `--ui-ease-out`); the old one is lifted out (`position: absolute`) and leaves with `to-<opposite>` (160ms `--ui-ease-in`). On a full close the last content stays while the panel fades.
- Accordion mode: content is rendered in place in a `grid-template-rows 0fr → 1fr` region (smooth spring); closed content is `visibility: hidden`. Triggers toggle a single open item.

### Visual rules
- Bar items: 36px high, 12px padding, 14px/500, `--radius-md`, muted → `--ui-foreground` on hover / open / current; open trigger fill `--ui-accent`; chevron 14px rotates 180° (snappy spring).
- Panel: `--ui-surface-raised`, 1px `--ui-border`, `--radius-xl`, `--ui-shadow-lg`; content padding 8px. Rich link: padding 10px 12px, `--radius-md`, title 14px/500, description 13px muted, hover `--ui-accent`.
- Caret: 10px rotated square on the panel's top edge with the top-left borders, same fill as the surface.
- Focus ring `0 0 0 3px` of `--ui-ring` at 45%.

### Motion
- First open: `ui-pop-in` 380ms from the caret (`--ui-origin`), exit `ui-pop-out` 160ms. Everything else as above.

### Accessibility
- Disclosure-navigation pattern: nav landmark, buttons with `aria-expanded` / `aria-controls`, links in the panel. The panel is in the top layer.

### Acceptance checks
- Hover opens after a delay, a second trigger switches without closing, leaving closes.
- The panel's box equals the open content's box after the glide; the caret stays under the active trigger and inside the panel.
- ↓ moves focus into the panel, Esc returns it to the trigger, Tab out closes it.
- At 390px (or `mode="accordion"`) triggers expand their links in place and only one is open.
