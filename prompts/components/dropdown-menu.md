## Component: Dropdown menu

A list of actions on a trigger, following the WAI-ARIA menu button pattern. The panel is a `popover="manual"` element in the top layer (shared `FloatingContent`: `useFloating` + `usePresence`).

### Anatomy
```
<DropdownMenu>                         context: open state, ids, trigger ref
  <DropdownMenuTrigger />              button: aria-haspopup="menu", aria-expanded, aria-controls
  <DropdownMenuContent>                <div class="ui-floating ui-menu" role="menu" popover="manual" data-state data-side>
    <DropdownMenuLabel />              .ui-menu-label
    <DropdownMenuGroup />              role="group"
    <DropdownMenuItem />               role="menuitem"  (icon, shortcut, variant, disabled, inset, asChild, onSelect)
    <DropdownMenuCheckboxItem />       role="menuitemcheckbox" aria-checked  (checked | defaultChecked, onCheckedChange)
    <DropdownMenuRadioGroup />         role="group" (value | defaultValue, onValueChange)
      <DropdownMenuRadioItem />        role="menuitemradio" aria-checked  (value)
    <DropdownMenuSeparator />          role="separator"
    <DropdownMenuSub>
      <DropdownMenuSubTrigger />       role="menuitem" aria-haspopup="menu" aria-expanded, chevron
      <DropdownMenuSubContent />       nested role="menu" panel, placement right-start
```
Every item carries `data-menu-owner` = the id of its own panel, so a submenu rendered inside its parent's DOM never mixes items in roving focus.

### Props
- `DropdownMenu`: `open`, `defaultOpen`, `onOpenChange`.
- `DropdownMenuContent`: `placement` (default `bottom-start`), `align`, `offset` (6), `matchWidth`, native div props.
- `DropdownMenuItem`: `icon`, `shortcut`, `variant` (`default | destructive`), `disabled`, `inset`, `asChild`, `onSelect(event)`; `event.preventDefault()` keeps the menu open.
- Sub: `DropdownMenuSub` takes `open`, `defaultOpen`, `onOpenChange`; `DropdownMenuSubContent` placement defaults to `right-start`, offset 4.

### Behaviour
- Trigger click toggles; click-initiated opens focus the panel, keyboard opens (Enter/Space/ArrowDown) focus the first item and ArrowUp the last.
- Items have `tabIndex=-1`; `useRovingFocus` (selector = the panel's own items) moves focus with ArrowUp/Down (wraps), Home/End and typeahead. Disabled items (`data-disabled`) are skipped.
- Highlight follows the pointer: `pointermove` on an item (not touch) focuses it; `data-highlighted` mirrors focus. Leaving the panel moves focus to the panel to clear it.
- Enter, Space or click chooses an item: `onSelect` runs, then the whole menu closes unless the event was default-prevented. Checkbox and radio items update their state first.
- Esc and outside pointerdown (`useDismiss`) close it; Tab closes it. Focus returns to the trigger, except after an outside click.
- Submenu: pointer over the sub trigger opens it after 100ms; ArrowRight/Enter/Space opens it and focuses its first item. Hovering a sibling item closes it unless the pointer is inside the "grace" triangle between where it left the trigger and the submenu (400ms), so a diagonal move does not close it. Leaving the trigger elsewhere closes it after 300ms. ArrowLeft or Esc closes only the submenu and refocuses its trigger. Only one submenu per panel is open.
- Selecting inside a submenu closes the whole menu.

### Visual rules
- Panel: `--ui-surface-raised`, 1px `--ui-border`, `--radius-lg`, `--ui-shadow-lg`, padding 4px, min width 8rem, max height `100dvh − 16px` (scrolls).
- Item: 32px high, padding 0 8px, gap 8px, `--radius-md`, 14px; highlighted = `--ui-accent` / `--ui-accent-foreground`; disabled opacity .5.
- Icon 16px `--ui-muted-foreground`; shortcut 12px muted on the right; check/radio indicator in a 16px slot at the left (items get 32px left padding).
- Destructive: `--ui-destructive-text`, highlight tinted with 6% `--ui-destructive`.
- Label: 12px/500 muted, padding 6px 8px. Separator: 1px `--ui-border`, margin 4px −4px.
- Submenu panel is nudged up 5px so its first item lines up with the trigger.

### Motion
- Open: `ui-pop-in` 150ms `--ui-ease-out` from the anchor side, 4px travel, scale .96. Close: `ui-pop-out` 160ms `--ui-ease-in`.

### Accessibility
- Roles and aria-checked as above; the menu is `aria-labelledby` its trigger; submenu panels are labelled by their sub trigger.
- Touch: taps select; hover-intent logic ignores touch pointers; `cursor: pointer` under `(hover: none)` so iOS dispatches clicks.

### Acceptance checks
- Menu sits below the trigger (gap 6px) and flips above near the bottom edge.
- ArrowDown/Up/Home/End/typeahead move focus; Enter/Space choose; Esc closes and refocuses the trigger.
- Hover highlights; submenu opens on hover and ArrowRight, closes with ArrowLeft; selecting a sub item closes everything.
- Checkbox/radio state updates; `preventDefault` in `onSelect` keeps the menu open.
- No axe violations in light and dark with the menu (and submenu) open.
