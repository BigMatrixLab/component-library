## Component: Table

A semantic data table: a native `<table>` in a rounded, scrollable wrapper. Presentational and Server Component–safe.

### Anatomy
```
<Table>                        .ui-table-wrap (border, radius-lg, overflow auto, tabIndex 0) > <table class="ui-table">
  <TableCaption />             <caption class="ui-table-caption"> (caption-side: bottom)
  <TableHeader>                <thead>
    <TableRow>
      <TableHead />            <th scope="col" class="ui-table-head">
  <TableBody>                  <tbody>
    <TableRow selected />      <tr data-state="selected">
      <TableCell numeric />    <td class="ui-table-cell" data-align="right" data-numeric>
  <TableFooter />              <tfoot> totals row on --ui-surface-muted
```

### Props
- `Table`: `striped`, `compact`, `bordered`, `stickyHeader`, `maxHeight` (px or CSS length, the scroll height), `label` (names the scroll region), `wrapperClassName`; all `<table>` props.
- `TableRow`: `selected` → `data-state="selected"`.
- `TableHead` / `TableCell`: `numeric` (right-aligned + tabular-nums), `align` (`left` | `center` | `right`).

### Visual rules
- Wrapper: 1px `--ui-border`, `--radius-lg`, `--ui-surface`. No shadow.
- Header cells: 44px tall (36px compact), `--ui-surface-muted`, 12px / 500, `--ui-muted-foreground`, nowrap, bottom border `--ui-border`.
- Body cells: 48px tall (36px compact), padding 12px 16px (8px 12px compact), 14px text, bottom hairline `--ui-border-subtle`; last row has none.
- Row hover (fine pointers only): `--ui-accent` at 60%. Selected: `--ui-accent`.
- Striped: even body rows `--ui-surface-muted` at 55%. Bordered: hairline between columns.
- Sticky header: `th` is `position: sticky; top: 0` with a 1px shadow line instead of a border; set `maxHeight`.
- Footer cells: `--ui-surface-muted`, 500 weight, top border.
- Numeric cells right-aligned with `font-variant-numeric: tabular-nums`; their header is right-aligned too.

### Motion
- Row background transitions in `--ui-duration-fast`. Nothing else moves.

### Accessibility
- Native table semantics; `scope="col"` on headers. The wrapper is focusable (keyboard scroll) and becomes a named `region` when `label` is set.
- Selection is shown by colour and must be also exposed by the control inside the row (checkbox).

### Acceptance checks
- Numbers line up on the right edge in light and dark; header stays visible when scrolling with `stickyHeader`.
- Narrow screens scroll horizontally inside the wrapper, never the page.
- No serious axe violations.
