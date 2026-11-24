## Component: Stat & metric

A number with context: label, large value, trend delta, help text and an optional sparkline. Presentational and Server Component–safe.

### Anatomy
```
<StatGroup variant>            .ui-stat-group > .ui-stat-group-grid (auto-fit grid)
  <Stat>                       .ui-stat (flex column, gap 4px, padding 20px)
    <StatLabel />              <p class="ui-stat-label">
    <StatValue />              <div class="ui-stat-value">
    <StatDelta />              .ui-stat-delta[data-tone][data-direction]
    <StatHelp />               <p class="ui-stat-help">
    <StatChart />              .ui-stat-chart (32px) — put a <Sparkline> here
```

### Props
- `StatGroup`: `variant` (`separate` default | `shared`), `minItemWidth` (default `13rem`).
- `StatDelta`: `value` (pre-formatted), `direction` (`up` | `down` | `flat`), `tone` (`positive` | `negative` | `neutral`; defaults from direction — set it when down is good), `comparison` ("vs last month").

### Visual rules
- Label 14px / 500 `--ui-muted-foreground`. Value 28px / 500, tracking −0.02em, `tabular-nums`, nowrap, `--ui-foreground`.
- Delta 14px / 500: arrow icon 14px + value, tone colour `--ui-success-text` (positive) / `--ui-destructive-text` (negative) / muted (neutral). Comparison text muted, regular weight.
- Help text 12px muted. Chart slot 32px tall, 12px above.
- `separate`: each Stat is a card (1px `--ui-border`, `--radius-lg`, `--ui-surface`), 16px gap.
- `shared`: one surface with the group border and `--radius-lg`; hairlines between cells (right and bottom edges, clipped so the outer border stays single).
- A bare `Stat` has no surface so it can sit inside a Card.

### Motion
- None built in; wrap in `ui-stagger` for a soft-rise entrance, or use AnimatedNumber for the value.

### Accessibility
- The delta carries visually hidden text ("Up", "Down", "No change,") before the value, so colour and arrow are not the only signal. The group has `role="group"`.

### Acceptance checks
- Four stats fill a desktop row and wrap to 2 then 1 column as the width shrinks, with no horizontal scroll.
- Shared variant: one outer border, single-pixel hairlines, no doubled edges, in light and dark.
- Positive / negative colours pass 4.5:1 on the surface.
