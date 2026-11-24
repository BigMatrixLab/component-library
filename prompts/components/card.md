## Component: Card

A contained group of content and actions. Server Component–safe.

### Anatomy
```
<Card>                       div.ui-card (or the child with asChild)
  <CardHeader>               grid: title/description in column 1, action in column 2
    <CardTitle />            h3.ui-card-title (as: h2–h6 | div)
    <CardDescription />      p.ui-card-description
    <CardAction />           top-right slot
  <CardContent />            .ui-card-content
  <CardFooter />             .ui-card-footer (flex, gap 8px)
```

### Props
- `Card`: `variant` `default` · `interactive` · `muted` · `inset`; `asChild`. `CardTitle`: `as`.

### Visual rules
- Flex column, gap 16px, padding-block 20px; sections padding-inline 20px. Radius `--radius-xl`, 1px `--ui-border`, fill `--ui-surface`. No shadow.
- Title 15px/600, tracking -.01em. Description 14px `--ui-muted-foreground`.
- muted: fill `--ui-surface-muted`, transparent border. inset: muted, padding 16px, radius `max(--radius-xs, --radius-xl − 8px)` (concentric with a parent that has 8px padding).
- interactive: pointer cursor; hover (fine pointer only) `translateY(-2px)`, border `--ui-border-strong`, fill 6% toward foreground; spring-smooth; press `scale(.985)`; focus ring 3px.

### Accessibility
- A container; pick a heading level. An interactive card is one link with no nested interactive elements.

### Acceptance checks
- No box-shadow at rest. Hover lifts 2px. The action sits top-right of the header.
