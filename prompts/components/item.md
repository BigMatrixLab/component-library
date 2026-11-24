## Component: Item & list

A row with media, text, actions and trailing meta; `ItemGroup` stacks rows with dividers. Presentational, Server Component–safe.

### Anatomy
```
<ItemGroup>             <div role="list" class="ui-item-group [ui-item-group-outline|-muted] [ui-item-group-flush]">
                          each child wrapped in <div role="listitem" class="ui-item-cell">
  <Item>                <div class="ui-item [ui-item-outline|-muted] [ui-item-sm|-lg]">   (asChild: a link/button gets the classes)
    <ItemMedia />         <div class="ui-item-media [ui-item-media-icon | -image]">
    <ItemContent>         <div class="ui-item-content">
      <ItemTitle />         <div class="ui-item-title">
      <ItemDescription />   <p class="ui-item-description">
    <ItemMeta />          <div class="ui-item-meta">
    <ItemActions />       <div class="ui-item-actions">
```

### Props
- `Item`: `variant` (`default` | `outline` | `muted`), `size` (`sm` | `md` | `lg`), `asChild`.
- `ItemMedia`: `variant` (`default` | `icon` | `image`).
- `ItemGroup`: `variant` (`default` | `outline` | `muted`; draws the group as one container), `divided` (default true).

### Visual rules
- Row: flex, centred, gap .75rem, padding `.75rem 1rem` (sm `.5rem .75rem`, lg `1rem 1.25rem`), 1px transparent border, radius `--radius-lg`, text 14px.
- `outline`: `--ui-border` + `--ui-surface`. `muted`: `--ui-surface-muted`.
- Interactive rows (`a`, `button`, `[role=button|link]`): pointer cursor; hover fill `--ui-accent` (fine pointers only); outline rows strengthen the border on hover; `:focus-visible` ring `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)`.
- Media icon tile 2.25rem (sm 1.75rem, lg 2.75rem), `--ui-surface-muted`, 1px border, radius `--radius-md`. Image 2.5rem (lg 3.5rem) rounded thumbnail, `object-fit: cover`.
- Title 14px/500, single line with ellipsis; description 13px muted, clamped to 2 lines; meta 13px muted, tabular-nums, nowrap; actions flex, gap .5rem.
- Group: dividers `1px solid --ui-border-subtle` between cells; `outline` group is a 1px bordered, clipped container with radius `--radius-lg` (rows lose their own radius); `muted` group is filled.

### Motion
- Hover fill and focus ring transition colours/box-shadow over `--ui-duration-fast`. Nothing moves, so reduced motion changes nothing.

### Accessibility
- Group is `role="list"` and wraps each child in `role="listitem"`, so link rows keep their own role.
- Rows that are links/buttons are real `a`/`button` (via `asChild`). Controls inside a row need their own names; never nest controls in a link row.

### Acceptance checks
- Group has N `role=listitem` children for N items, with 1px dividers between them.
- `asChild` with a link renders a single `<a class="ui-item …">` that is keyboard focusable with a ring.
- Variants show the right border/background; sizes the listed paddings.
- Long titles truncate; descriptions clamp at two lines.
- No serious axe violations in light and dark.
