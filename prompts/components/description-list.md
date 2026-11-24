## Component: Description list

Term / details pairs on a native `<dl>`: customer profile, invoice meta, settings summary. Presentational and Server Component–safe.

### Anatomy
```
<DescriptionList orientation divided labelWidth>   <dl class="ui-dl">  (container-type: inline-size)
  <DescriptionItem>                                <div class="ui-dl-item">
    <DescriptionTerm />                            <dt class="ui-dl-term">
    <DescriptionDetails />                         <dd class="ui-dl-details">
```

### Props
- `DescriptionList`: `orientation` (`stacked` default | `horizontal`), `divided` (hairline between items), `labelWidth` (CSS length for the label column, default `11rem`).

### Visual rules
- 14px / 1.5. Term: `--ui-muted-foreground`, 500. Details: `--ui-foreground`, regular, wraps anywhere (long emails, ids). An empty `<dd>` shows an em dash.
- Items 10px vertical padding (12px when `divided`); first and last trim their outer padding unless divided. Divider: 1px `--ui-border-subtle`, none under the last item.
- `horizontal`: once the **list** (not the viewport) is ≥ 32rem wide, each item becomes a two-column grid — label column, 16px gap, details — baseline-aligned. Narrower, it stacks. Works inside a Card at any width.

### Motion
- None.

### Accessibility
- Native `dl` / `dt` / `dd` with `<div>` grouping (valid HTML). Details may contain badges, links or a CopyButton.

### Acceptance checks
- In a 360px card the list stacks; in a 720px card the label column appears.
- Dividers do not double up with the card border; no horizontal overflow with a 60-character email.
