## Component: Separator

A quiet line between groups, optionally with a centred label. Server Component–safe.

### Anatomy
- `<div class="ui-separator" data-orientation="horizontal|vertical" role="none|separator">`.
- Labelled: `<div class="ui-separator ui-separator-label"><span class="ui-separator-text">or</span></div>` (a line on both sides via `::before/::after`).

### Props
- `orientation`: `horizontal` (default) | `vertical`. `decorative` (default true gives `role="none"`; false gives `role="separator"` plus `aria-orientation` when vertical). `children`: label.

### Visual rules
- 1px in `--ui-border`. Horizontal: full width. Vertical: `align-self: stretch`, min-height 16px, so the parent needs a height.
- Label: 12px/500, uppercase, letter-spacing .04em, `--ui-muted-foreground`, gap 12px.

### Accessibility
- Decorative by default; use `decorative={false}` only for a meaningful thematic break.

### Acceptance checks
- Horizontal is 1px tall; vertical is 1px wide and as tall as its row; the label sits between two lines.
