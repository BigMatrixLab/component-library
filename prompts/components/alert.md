## Component: Alert

An inline, persistent message that belongs to the page.

### Anatomy
```
<Alert variant banner icon>          <div class="ui-alert ui-alert-<variant> [ui-alert-banner]" data-variant>
  .ui-alert-icon                     aria-hidden, 20px, status -text colour
  .ui-alert-body
    <AlertTitle />                   .ui-alert-title (div, 14px/500, status -text colour)
    <AlertDescription />             .ui-alert-description (14px, surface foreground)
    <AlertActions />                 .ui-alert-actions (wrapping row, margin-top 8px)
  {close}                            .ui-alert-close (DismissibleAlert)
```
`DismissibleAlert` (client) wraps it in `.ui-alert-collapse[data-state] > .ui-alert-collapse-inner`.

### Props
- `variant`: `default` (neutral, no icon) · `info` · `success` · `warning` · `destructive`. Icons: info, circle-check, triangle-alert, circle-alert.
- `banner`: full width, radius 0, no side borders.
- `icon`: replace, or `false` for none. `close`: node rendered after the body.
- `DismissibleAlert`: `open` / `defaultOpen` (true) / `onOpenChange`, `dismissLabel` (`Dismiss`).
- `Alert` is Server Component–safe; only `DismissibleAlert` has `'use client'`.

### Visual rules
- Padding 14px 16px, gap 12px, `--radius-lg`, 1px border = 22% status colour over `--ui-border`, background = 6% status colour over `--ui-surface` (default variant: `--ui-surface-muted` + `--ui-border`).
- Title and icon use `--ui-<status>-text`; description uses `--ui-surface-foreground`. Never status fills for text.
- Banner: horizontal padding `max(16px, (100% - 72rem) / 2)`.

### Motion
- Dismiss: `ui-alert-collapse` 220ms `--ui-ease-in-out` animates `grid-template-rows` 1fr to 0fr and opacity to 0; then unmount (`usePresence`). The × button presses to .94.

### Accessibility
- No role by default (page content, read in order). `role="alert"` only for urgent content that appears as a result of the user's action; `role="status"` for polite updates after load. Never `alert` for content present on load.
- Colour is never the only signal (icon + title). × button has `aria-label`, focus ring on `:focus-visible`.

### Acceptance checks
- All variants pass contrast in light and dark.
- Dismissing collapses smoothly and removes the node; `open` controls it.
- Banner spans its container and has no side borders.
