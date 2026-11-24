## Component: ContextMenu

A menu of actions that opens at the pointer on right-click, at a long press on touch, or from the keyboard. It reuses the DropdownMenu panel, items and keyboard model: only the trigger and the anchor differ.

### Anatomy
```
<ContextMenu>                    context: open state, ids, pointer point
  <ContextMenuTrigger>           the area: <div class="ui-context-menu-trigger" tabindex="0">
  <ContextMenuContent>           <div class="ui-floating ui-menu ui-context-menu" role="menu" popover="manual">
    <ContextMenuItem />          role="menuitem"            = DropdownMenuItem
    <ContextMenuCheckboxItem />  role="menuitemcheckbox"    = DropdownMenuCheckboxItem
    <ContextMenuRadioGroup> <ContextMenuRadioItem />
    <ContextMenuLabel /> <ContextMenuSeparator /> <ContextMenuGroup />
    <ContextMenuSub> <ContextMenuSubTrigger /> <ContextMenuSubContent />
```
Item parts and classes are the dropdown menu's: `.ui-menu-item`, `.ui-menu-icon`, `.ui-menu-shortcut`, `.ui-menu-separator`, `.ui-menu-label`.

### Props
- `ContextMenu`: `open`, `defaultOpen`, `onOpenChange`.
- `ContextMenuTrigger`: `asChild`, `disabled` (browser menu shows), `longPressDelay` (default 500), `tabIndex` (default 0 unless `asChild`).
- `ContextMenuContent`: `placement` (default `bottom-start`), `offset` (default 2), all floating-panel props except `anchorRef`.
- Items: same props as the DropdownMenu counterpart (`icon`, `shortcut`, `variant="destructive"`, `disabled`, `onSelect(event)`, `inset`, `checked`, `value`).

### Behaviour
- `contextmenu` event on the area: `preventDefault()`, open with a virtual anchor (a 0×0 rect at `clientX/clientY`). Opened with the pointer, focus lands on the menu itself, nothing highlighted.
- Touch / pen: `pointerdown` starts a 500ms timer; it is cancelled by `pointerup`, `pointercancel`, or movement over 10px; when it fires the menu opens at the touch point (the browser's own `contextmenu` event that Android sends afterwards just re-opens at the same point).
- Keyboard: `Shift + F10` or the `ContextMenu` key on the focused area (or a descendant) opens the menu under the focused element with the first item focused. The browser's follow-up `contextmenu` event within 400ms is ignored.
- Right-clicking again (on the area or elsewhere) closes the open menu (outside `pointerdown`), then opens a new one at the new point. Only one menu is ever open.
- Esc closes and returns focus to the area; a click outside closes without moving focus. Tab closes. Choosing an item closes it unless `onSelect` calls `preventDefault()`.
- Positioning flips and shifts to stay at least 8px inside the viewport. The panel's own `contextmenu` is suppressed.

### Visual rules
- Area: `-webkit-touch-callout: none`; on coarse pointers `user-select: none`; keyboard focus ring `0 0 0 3px` of `--ui-ring` at 45%, `--radius-md`.
- Panel and items: exactly the dropdown menu's (`.ui-menu`: min-width 8rem, padding 4px, 1px `--ui-border`, `--radius-lg`, `--ui-surface-raised`, `--ui-shadow-lg`; item 32px high, `--radius-md`, highlight `--ui-accent`).

### Motion
- Open: `ui-pop-in` 150ms ease-out from the pointer (scale .96, no travel). Close: `ui-pop-out` 160ms.

### Accessibility
- WAI-ARIA menu pattern, as the dropdown menu; `aria-label="Context menu"` on the panel (overridable).
- The area is a tab stop so keyboard users can reach the menu. A context menu must never be the only way to reach an action.

### Acceptance checks
- Right-click opens within 3px of the pointer; a second right-click moves it; only one `role="menu"` exists.
- Shift+F10 opens on the first item; arrows, Home/End, wrap; Esc returns focus to the area.
- Long press opens at 500ms and not earlier; moving the finger cancels it.
- Submenu opens with → and closes with ←.
- No serious axe violations while open (light and dark).
