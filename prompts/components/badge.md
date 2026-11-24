## Component: Badge

A small inline label for status or metadata. Server Component–safe; only the remove button is a client component.

### Anatomy
- `<span class="ui-badge [ui-badge-<variant>] [ui-badge-<size>] [ui-badge-solid]" [data-live]>` — optional `<span class="ui-badge-dot" aria-hidden="true">`, then an optional icon and the text.
- `BadgeRemove`: `<button type="button" class="ui-badge-remove" aria-label="Remove …">` with a 12px `x` icon (client component).
- `BadgeAnchor`: `<span class="ui-badge-anchor">` wrapping an element and a Badge; the badge is pinned top-right.

### Props
- `variant`: `default` · `secondary` · `outline` · `success` · `warning` · `destructive` · `info`.
- `size`: `sm` 20px · `md` 24px (default) · `lg` 28px.
- `solid`: status tones only, solid fill instead of tint. `dot`: leading status dot. `live`: pulsing dot (implies dot). `asChild`: render the child.

### Visual rules
- Pill (`border-radius: 9999px`), 1px border, text 12px/500 (`lg` 13px), gap 6px, padding-inline 10px (sm 8, lg 12).
- default: `--ui-primary` / `--ui-primary-foreground`. secondary: `--ui-secondary`. outline: transparent + `--ui-border-strong`.
- Status tones: background `color-mix(in oklch, var(--ui-<tone>) 10%, transparent)`, border 24% mix, text `--ui-<tone>-text`, dot `--ui-<tone>`. Solid: fill `--ui-<tone>`, text `--ui-<tone>-foreground`.
- Dot 6px (sm 5, lg 7). Live ring: `::after` scaling 1 to 2.6 and fading, 1.8s infinite.
- Remove button 16px, opacity .7 (1 on hover/focus), hit area extended 4px by `::after`.
- Anchor badge: absolute top/right, `translate: 40% -40%`, min-width 20px, centred, `box-shadow: 0 0 0 2px var(--ui-background)`, `ui-pop-in` on mount.

### Accessibility
- Plain text in a span, no role. The dot is `aria-hidden`; meaning lives in the text. Counters carry visually hidden text ("3 unread").
- BadgeRemove has a label naming what it removes; keyboard focus shows a ring.

### Acceptance checks
- Heights 20/24/28. Status tones readable in light and dark (axe passes). Clicking a remove button removes its tag and keeps the others.
