## Component: Command (command palette)

A searchable list of pages and actions. `Command` is inline; `CommandDialog` puts it in the Dialog, top-aligned, with an optional ⌘K / Ctrl+K hotkey.

### Anatomy
```
<Command>                          <div class="ui-command"> context: search, highlight, filter
  <CommandInput />                 .ui-command-input-wrap: search icon + <input role="combobox">
  <CommandList>                    <div class="ui-command-list" role="listbox"> max-height 22rem, scrolls
    <CommandEmpty />               .ui-command-empty (role="status") only when a search has no match
    <CommandGroup heading="…">     role="group" aria-labelledby heading; hidden when it has no match
      <CommandItem />              .ui-command-item role="option" aria-selected; .ui-command-icon .ui-command-label .ui-command-shortcut
    <CommandSeparator />           hidden while searching
  <CommandFooter />                key hints, .ui-command-footer
<CommandDialog>                    Dialog > DialogContent.ui-command-dialog + hidden DialogTitle + Command
```

### Props
- `Command`: `search`, `defaultSearch`, `onSearchChange`, `shouldFilter` (true), `filter(value, search, keywords) => number`, `label`, `onItemSelect`.
- `CommandInput`: input props (`placeholder` default "Type a command or search…"); `data-autofocus` so a Dialog focuses it.
- `CommandItem`: `value` (search text, default the item text), `keywords: string[]`, `icon`, `shortcut` (a string becomes `Kbd` key caps, or a node), `disabled`, `onSelect(value)`.
- `CommandGroup`: `heading`. `CommandEmpty`: children (default "No results found.").
- `CommandDialog`: `open`, `defaultOpen`, `onOpenChange`, `hotkey` (false), `closeOnSelect` (true), `title` (visually hidden, "Command palette"), `description`, plus `Command` props.

### Behaviour
- Scoring (`commandScore`): label exact 100, prefix 90, word start 70, substring 50; keywords prefix 60, word start 55, substring 30; every word of a multi-word search found in label + keywords 20; else 0 (hidden). Empty search matches all.
- Ranking: inside a group, better matches float to the top (CSS `order: −score`); on every search change the best-scoring option overall is highlighted and the list scrolls to the top. Without a search the first enabled item is highlighted.
- Focus stays in the input. `↓`/`↑` move the highlight (visual order, wrapping, skipping disabled); `Home`/`End` first/last; `Enter` runs the highlighted item (click on it); pointer hover moves the highlight (not touch); `mousedown` in the list does not blur the input. Keyboard moves scroll the item into view (`nearest`).
- Running an item calls `onSelect(value)` then `onItemSelect`; `CommandDialog` closes (unless `closeOnSelect={false}`). The dialog unmounts its content on close, so the search resets.
- `hotkey`: `Ctrl/⌘ + K` anywhere toggles the dialog and prevents the browser default.

### Visual rules
- Command: 1px `--ui-border`, `--radius-xl`, `--ui-surface-raised`; in the dialog no border/radius/background (panel padding 0, max-width 40rem, size lg).
- Input row 48px high, 16px side padding, 1px bottom border, 18px muted search icon; input font 16px on coarse pointers.
- List padding 4px. Item 36px high, padding 0 8px, gap 10px, `--radius-md`; highlighted: `--ui-accent` / `--ui-accent-foreground`; disabled 50% opacity. Heading 12px / 500 muted, padding 8px 8px 4px.
- Footer: 12px muted on `--ui-surface-muted`, 1px top border, gap 16px.
- Dialog sits at `min(18dvh, 8rem)` from the top (8px on phones), never docked to the bottom.

### Motion
- Dialog: the standard soft rise (overlay fade 220ms, panel `ui-pop-in` 380ms). Highlight tint 100ms; no list animation, so typing never lags.

### Accessibility
- Input: `role="combobox"`, `aria-expanded="true"`, `aria-autocomplete="list"`, `aria-controls` = listbox (omitted when nothing matches), `aria-activedescendant` = highlighted option.
- With no match the list drops its `listbox` role (a listbox needs options) and shows the status message.
- Dialog: modal with a hidden title, focus in the field on open, returns to the opener on close.

### Acceptance checks
- Typing "dark mode" leaves one item (keyword match); "zzz" shows the empty message and removes the listbox.
- "inv" ranks "Invite teammate" above "Download invoices" and highlights it.
- ↓/↑/Home/End/Enter work with focus in the field; disabled items are skipped.
- ⌘K / Ctrl+K toggles the dialog; Esc closes and focus returns to the button; search is empty on reopen.
- No serious axe violations in the open dialog.
