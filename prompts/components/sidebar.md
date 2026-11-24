## Component: Sidebar

App navigation column that collapses to an icon rail on desktop and becomes an off-canvas Sheet on mobile.

### Anatomy
```
<SidebarProvider open|defaultOpen|onOpenChange storageKey shortcut mobileBreakpoint framed>   div.ui-sidebar-wrapper data-state data-framed data-animate (+ TooltipProvider)
  <Sidebar side collapsible="icon|offcanvas|none">     aside.ui-sidebar data-side data-collapsible data-state="expanded|collapsed" > div.ui-sidebar-inner
    <SidebarHeader> / <SidebarContent> (scrolls) / <SidebarFooter>
    <SidebarGroup> <SidebarGroupLabel> <SidebarMenu> ul > <SidebarMenuItem> li
      <SidebarMenuButton isActive tooltip size="default|lg" asChild?>   button.ui-sidebar-menu-button data-active data-size — icon, <span> label, <SidebarMenuBadge>
      <SidebarMenuSub open|defaultOpen>                                  div.ui-sidebar-sub
        <SidebarMenuSubTrigger tooltip isActive>                         button.ui-sidebar-menu-button.ui-sidebar-sub-trigger aria-expanded aria-controls + chevron
        <SidebarMenuSubContent>                                          div.ui-sidebar-sub-content > .ui-sidebar-sub-inner > ul.ui-sidebar-sub-list
          <SidebarMenuSubItem> li > <SidebarMenuSubButton isActive asChild?>
  <SidebarInset asChild?>                              div.ui-sidebar-inset (main area)
<SidebarTrigger />                                     ghost icon Button, aria-label="Toggle sidebar", Tooltip with "Ctrl B"
useSidebar() → { open, setOpen, openMobile, setOpenMobile, isMobile, collapsed, toggle }
```

### Behaviour
- State: controlled or uncontrolled (default expanded). `storageKey` (default `ui-sidebar`, `false` = off) persists `"open" | "collapsed"` in `localStorage`; every read and write is in try/catch. It is restored in a layout effect, and the width transition (`data-animate`) turns on two frames after mount so a restored state never animates.
- `shortcut`: Ctrl / Cmd + B toggles (the Sheet on mobile). Ignored in inputs, textareas, selects and contenteditable.
- Mobile (`matchMedia(max-width: breakpoint - 1)`, default 768): `Sidebar` renders its children in a `Sheet` (`side`, size sm, no close button, title "Sidebar" as `sr-only`) and `collapsed` is false. Choosing a menu button closes it.
- `collapsed` = desktop and closed (and `collapsible !== "none"`). Tooltips: the tree never changes shape (focus survives collapsing); a `Tooltip` is held closed (`open={false}`) unless collapsed, then shows the label to the right.
- Sub-menu: the trigger toggles; while collapsed it expands the sidebar and opens the group. Content is hidden with `visibility` after the close animation, so closed items leave the tab order; on the rail it is `display: none`.
- `framed`: the wrapper is `height: 100%`, `overflow: hidden`; the inset scrolls. Full page: sidebar is `sticky; top: 0; height: 100svh`.

### Visual rules
- Widths `--ui-sidebar-width` 16rem, `--ui-sidebar-width-icon` 3.5rem. Colours: `--ui-sidebar`, `--ui-sidebar-foreground`, `--ui-sidebar-border` (1px on the inner edge), `--ui-sidebar-accent` for the active row, 60% of it on hover.
- Rows: 36px (lg 48px), 12px horizontal padding, 10px gap, 16px icon, 14px, `--radius-md`, nowrap + `overflow: hidden` so the label clips on the rail while the icon stays centred in 56px.
- Group label 12px/500, 66% foreground; collapses to height 0 on the rail, groups then separate with a 1px border.
- Badge: 20px pill, `--ui-primary` at 12%, `--ui-primary-text`. Sub-list: 20px left margin with a 1px `--ui-sidebar-border` rule, rows 32px.
- Focus ring `0 0 0 3px` of `--ui-ring` at 45%.

### Motion
- Width on `--ui-spring-smooth` / `-duration` (size is the information). Sub-content `grid-template-rows 0fr → 1fr` on the same spring; chevron rotates 90° on `--ui-spring-snappy`. Rows scale .985 when pressed. Reduced motion keeps the state, drops the movement.

### Accessibility
- aside landmark (label "Sidebar" unless given); `aria-current="page"` on the active row; trigger `aria-expanded`; sub triggers `aria-expanded` + `aria-controls`.

### Acceptance checks
- Ctrl + B toggles between 256px and 56px; reload keeps the choice; no animation on load.
- Collapsed: labels clipped, tooltips appear on hover and keyboard focus, and every icon-only row still has its accessible name.
- Collapsing while a row is focused keeps focus on it.
- At 390px the sidebar is a sheet opened by the trigger and closed by choosing a row.
- Works in a 560px framed container and on a full page.
