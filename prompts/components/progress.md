## Component: Progress

A bar (`Progress`) or ring (`ProgressCircle`) for a known amount of work. Server Component–safe.

### Anatomy
- Linear: `<div class="ui-progress [ui-progress-<size>] [ui-progress-<tone>]" role="progressbar" data-state style="--ui-progress-pct:N"><span class="ui-progress-indicator"/></div>`.
- Circular: `<div class="ui-progress-circle [ui-progress-circle-<size>] …" role="progressbar">` with `<svg viewBox="0 0 36 36" aria-hidden>` holding track and indicator `circle`s (cx/cy 18, r 16, `pathLength="100"`) and `<span class="ui-progress-circle-value">`.

### Props
- `value` number | null (null or omitted = indeterminate), `max` (100), `tone` `default|success|warning|destructive|info`, `getValueText(value, max)`.
- `Progress.size`: `sm` 4px · `md` 8px · `lg` 12px. `ProgressCircle.size`: `sm` 40 · `md` 64 · `lg` 96 · `xl` 128px; `children` replaces the centred percentage (`null` = none).

### Behaviour
- Value is clamped to 0…max; `--ui-progress-pct` = percentage. `data-state`: `indeterminate` | `loading` | `complete`.
- ARIA: `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax`, `aria-valuenow` (omitted when indeterminate), `aria-valuetext` (default "NN%"). The consumer supplies `aria-label` or `aria-labelledby`.

### Visual rules
- Track: tone 16% mix, pill, `overflow: hidden; isolation: isolate`. Indicator full width, `translateX(calc(pct × 1% − 100%))`, tone fill (default `--ui-primary`; tones use `--ui-success|warning|destructive|info`).
- Transition: `transform var(--ui-spring-smooth-duration) var(--ui-spring-smooth)` (ring: `stroke-dashoffset`, same spring). No overshoot.
- Indeterminate bar: width 40%, `ui-progress-slide` (translateX −100% to 250%) 1.4s infinite. Ring: 28% arc spinning 1.1s.
- Ring: stroke width 3.2 (sm 4, lg 2.6, xl 2.2) in a 36 viewBox, round caps, rotated −90°, hidden when empty. Centre text size `max(11px, diameter × .24)`, tabular.

### Motion
- Reduced motion: the indeterminate bar becomes a faint full-width bar; the ring stops spinning.

### Acceptance checks
- `aria-valuenow` follows `value`; the indicator moves with the value; indeterminate has no `aria-valuenow`; heights 4/8/12.
