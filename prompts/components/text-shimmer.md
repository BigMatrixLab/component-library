## Component: Text shimmer

A soft band of light that sweeps across text, for loading and "thinking" labels. Pure CSS, no JavaScript
behaviour, Server Component–safe.

### Anatomy
- `<span class="ui-text-shimmer" data-state="active|idle" style="--ui-text-shimmer-duration: 2000ms">Thinking…</span>`
- `asChild` puts the class and state on the child instead (e.g. an `<h3>`), merging className and style.

### Props
- `active` (default `true`): runs the sweep; `false` sets `data-state="idle"` and shows plain text in the
  inherited colour.
- `duration` (ms): sets `--ui-text-shimmer-duration` inline; CSS default 2s.
- `asChild`: render the child element via `Slot`.
- Every other span attribute is forwarded (`ref`, `className`, `role`, `style`).

### Visual rules
- Variables on `.ui-text-shimmer`: `--ui-text-shimmer-base: var(--ui-muted-foreground)`,
  `--ui-text-shimmer-highlight: var(--ui-foreground)`, `--ui-text-shimmer-band: 10%`; `color` = base.
- A `span` root is `display: inline-block` so the gradient spans the whole label.
- Inside `@supports (background-clip: text) or (-webkit-background-clip: text)`, active state:
  `linear-gradient(90deg, base calc(50% − band×2), highlight 50%, base calc(50% + band×2))`,
  `background-size: 250% 100%`, no repeat, `background-position: 100% 0`, `-webkit-background-clip: text`,
  `background-clip: text`, `-webkit-text-fill-color: transparent`.
- Without support: plain text in the base colour.
- `[data-state="idle"]`: `color: inherit` and no gradient.

### Motion
- `@keyframes ui-text-shimmer { from { background-position: 100% 0 } to { background-position: 0% 0 } }` —
  the band travels from just left of the text to just right of it.
- `animation: ui-text-shimmer var(--ui-text-shimmer-duration, 2s) linear infinite`.
- RTL (`[dir="rtl"]` ancestor): `animation-direction: reverse`.
- Reduced motion: `animation: none; background-image: none; -webkit-text-fill-color: currentColor` — static
  text in the base colour.

### Accessibility
- The text stays real, selectable text and is read normally.
- It announces nothing; wrap it in `role="status"` when the label is the news.
- The resting colour (`--ui-muted-foreground`) meets 4.5:1 on the background; the band only brightens it.

### Acceptance checks
- Active: computed `background-clip` is `text`, `animation-name` is `ui-text-shimmer`, and
  `background-position` changes over time.
- `active={false}`: `data-state="idle"`, no animation, text in the inherited colour.
- `duration={3200}` sets `--ui-text-shimmer-duration: 3200ms`.
- Reduced motion: `animation-name` is `none` and no background image.
- Works in light and dark; axe finds no serious violations.
