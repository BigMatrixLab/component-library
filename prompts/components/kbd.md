## Component: Kbd

A key cap for shortcuts. Server Component–safe.

### Anatomy
- `<kbd class="ui-kbd [ui-kbd-sm|ui-kbd-lg]">` is one key. `<span class="ui-kbd-group [ui-kbd-group-plus]">` groups keys (`role="group"` when it has an `aria-label`).

### Props
- `Kbd`: `size` `sm` 20px · `md` 24px (default) · `lg` 28px. `KbdGroup`: `plus` draws "+" between keys.

### Visual rules
- Mono face, 12px/500 (lg 13px), min-width = height, padding-inline 6px, radius `--radius-sm`.
- Fill `--ui-surface`, text `--ui-muted-foreground`, 1px `--ui-border`, lip `box-shadow: 0 1px 0 var(--ui-border-strong)`.
- Group gap 4px; with `plus` gap 14px and a "+" (`content: "+" / ""`, muted) centred in the gap.

### Accessibility
- Semantic `<kbd>`; the "+" is generated content with empty alt text. Add `aria-label` to a symbol-only group.

### Acceptance checks
- Heights 20/24/28; text meets 4.5:1 in light and dark.
