## Component: Skeleton

A placeholder that reserves space while content loads. Server Component–safe.

### Anatomy
- `<div class="ui-skeleton [ui-skeleton-circle|ui-skeleton-block]" aria-hidden="true" data-shape style="width;height">`.

### Props
- `shape` `line` (default, 16px tall) | `circle` (width = height, 40px default) | `block` (96px tall). `width`, `height`: number = px or a CSS string.

### Visual rules
- Base fill `color-mix(in oklch, var(--ui-foreground) 8%, transparent)` (10% in dark). Highlight band: gradient `transparent 30%, shine 50%, transparent 70%`, size 200% × 100%, shine = surface 70% in light, foreground 9% in dark.
- Animation `var(--animate-shimmer)` (1.6s linear infinite). Radius: line `--radius-sm`, block `--radius-md`, circle full.

### Accessibility
- Aria-hidden. The loading region sets `aria-busy="true"` and holds a visually hidden `role="status"` message.

### Motion
- Reduced motion: `animation: none; background-image: none` (static fill).

### Acceptance checks
- Shapes measure as specified; the shimmer runs unless reduced motion is set; visible in dark mode.
