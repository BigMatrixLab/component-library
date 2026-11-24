## Component: Menubar

A desktop-style bar of menus (File / Edit / View), following the WAI-ARIA menubar pattern. Panels, items and submenus are the DropdownMenu's own parts.

### Anatomy
```
<Menubar>                       <div class="ui-menubar" role="menubar" aria-orientation="horizontal">
  <MenubarMenu value="file">    context: is this menu open; shares open method with the bar
    <MenubarTrigger />          <button class="ui-menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded>
    <MenubarContent>            <div class="ui-floating ui-menu ui-menubar-content" role="menu" aria-labelledby=trigger>
      <MenubarItem /> <MenubarCheckboxItem /> <MenubarRadioGroup><MenubarRadioItem />
      <MenubarLabel /> <MenubarSeparator /> <MenubarGroup />
      <MenubarSub> <MenubarSubTrigger /> <MenubarSubContent />
```

### Props
- `Menubar`: `value` (open menu value or `null`), `defaultValue`, `onValueChange`; native div props.
- `MenubarMenu`: `value` (id of the menu; generated when omitted).
- `MenubarContent`: `placement` (default `bottom-start`), `offset` (default 6).
- Items: same as the DropdownMenu counterparts.

### Behaviour
- One tab stop for the bar (roving tabindex): the first trigger is `tabindex=0` until another one is focused or clicked.
- On a title (closed): `→`/`←` move focus to the next/previous title (wrap); `Home`/`End` first/last; `↓`, `Enter`, `Space` open with the first item focused; `↑` opens on the last item.
- Click toggles a menu. Only one menu is open at a time.
- With a menu open: `→`/`←` on an item (not a submenu trigger, not inside a submenu) switch to the next/previous menu, opening it with its first item focused; a submenu trigger consumes `→`, a submenu `←`.
- With a menu open, moving the mouse onto another title switches to that menu (pointer only, never touch); with none open, hover does nothing.
- Esc closes and returns focus to the title; a click outside closes without moving focus; Tab closes; choosing an item closes the bar.

### Visual rules
- Bar: inline-flex, height 40px, padding 4px, gap 2px, 1px `--ui-border`, `--radius-lg`, `--ui-surface-raised`, `--ui-shadow-xs`; scrolls horizontally on narrow screens with no scrollbar.
- Title: height 30px, padding 0 10px, `--radius-md`, 14px / 500; hover and open: `--ui-accent` background and `--ui-accent-foreground`; keyboard focus ring `0 0 0 3px` `--ui-ring` at 45%.
- Panel min-width 12rem, then the dropdown menu's rules.

### Motion
- Title tint 150ms standard ease. Panel `ui-pop-in` 150ms from the title side; close `ui-pop-out` 160ms. Switching menus closes and opens in the same frame.

### Accessibility
- WAI-ARIA menubar: titles are `role="menuitem"` with `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` (only while open); each menu is labelled by its title.

### Acceptance checks
- Exactly one title has `tabindex=0`.
- Menu opens 6px below its title, left-aligned.
- `→` in an open menu switches menus and focuses the first item of the new one; focus never lands on `<body>`.
- Hover switch works only after a menu is open.
- Submenu `→`/`←` do not switch menus.
- No serious axe violations while open.
