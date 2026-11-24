## Component: Spinner

Work in progress, duration unknown. Server Component–safe. Inherits `currentColor`.

### Anatomy
- `<span class="ui-spinner [ui-spinner-<size>]" role="status">` containing `<span class="ui-spinner-ring" aria-hidden>` (or `<span class="ui-spinner-dots" aria-hidden><i/><i/><i/></span>`) and `<span class="sr-only">Loading</span>`.

### Props
- `variant` `ring` (default) | `dots`; `size` `xs` 12 · `sm` 16 · `md` 20 (default) · `lg` 28 · `xl` 40; `label` string (default "Loading") or `false` (decorative: `aria-hidden`, no role).

### Visual rules
- Ring: border `max(2px, size × .1)`, track `currentColor` 18%, top segment `currentColor`, `ui-spin .7s linear infinite`.
- Dots: three circles of size × .26, gap size × .16, `ui-spinner-bounce` 1s ease-in-out, delays 0/.14/.28s (translateY -40%, opacity .4 to 1).

### Accessibility
- `role="status"` with hidden text (a polite live region). Reduced motion: the indicator holds still.

### Acceptance checks
- Sizes measure as listed; `label={false}` has no role; the colour follows the parent's text colour.
