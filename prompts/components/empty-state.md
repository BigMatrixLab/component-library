## Component: Empty state

What to show when a list, table or search has nothing in it: say what is missing and offer one next step. Presentational, Server Component–safe.

### Anatomy
```
<Empty>                    <div class="ui-empty [ui-empty-dashed | ui-empty-card]">
  <EmptyHeader>            <div class="ui-empty-header">
    <EmptyMedia />         <div class="ui-empty-media ui-empty-media-icon | -illustration">
    <EmptyTitle />         <h3 class="ui-empty-title">   (as: h2–h6 | div)
    <EmptyDescription />   <p class="ui-empty-description">
  <EmptyActions />         <div class="ui-empty-actions">
```

### Props
- `Empty`: `variant` — `default` (no container) · `dashed` (1px dashed outline) · `card` (solid border + surface).
- `EmptyMedia`: `variant` — `icon` (default: icon in a 48px tile) · `illustration` (free slot, max 12rem wide).
- `EmptyTitle`: `as` — `h3` default; `h2`–`h6` or `div`.
- Every part forwards `ref`, `className` and native props.

### Visual rules
- `.ui-empty`: flex column, centred, `padding: 2.5rem 1.5rem`, gap 1.25rem, text centred.
- `-dashed`: `border: 1px dashed var(--ui-border-strong)`, radius `--radius-xl`. `-card`: `1px solid var(--ui-border)`, `--ui-surface`, radius `--radius-xl`.
- Header: column, gap .375rem, `max-width: 24rem`.
- Icon tile: 3rem square, `--ui-surface-muted`, 1px `--ui-border-subtle`, radius `--radius-lg`, icon 1.5rem in `--ui-muted-foreground`; `margin-bottom: .625rem`.
- Title 15px/600, letter-spacing -.01em. Description 14px in `--ui-muted-foreground`.
- Actions: wrap, centred, gap .5rem.
- No shadows. Reads semantic tokens only.

### Motion
- One entrance on mount: `var(--animate-rise)` (rise 8px, blur clears, `--ui-duration-slow`). Reduced motion: the global rule shortens it to 1ms.

### Accessibility
- Plain headings and text; nothing is announced by itself. The icon is decorative (`aria-hidden`); the title carries the meaning.
- Description text meets 4.5:1 in light and dark.

### Acceptance checks
- Default variant has no border; dashed has a dashed 1px border; card has a solid 1px border and surface background.
- Media icon tile is 48×48px with an icon 24px.
- Title renders as the chosen heading level.
- No serious axe violations in light and dark.
