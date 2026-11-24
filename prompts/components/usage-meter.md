## Component: Usage meter

How much of a quota is used ("7.2 GB of 10 GB"), with thresholds that shift the fill to warning and destructive colours, and an optional segmented bar with a legend. Server Component–safe (no state; the mount animation is CSS).

### Anatomy
- Root `<div class="ui-usage-meter [ui-usage-meter-sm|-lg]" data-tone="default|warning|destructive" [data-segmented] style="--ui-usage-pct:N">`.
- `.ui-usage-meter-header`: `.ui-usage-meter-label` (id, names the meter) + `.ui-usage-meter-summary` (`aria-hidden`, holds `<span class="ui-usage-meter-used">7.2 GB</span> of 10 GB`).
- `.ui-usage-meter-track` with `role="meter"` > `.ui-usage-meter-fill` (width = total %) > one `.ui-usage-meter-segment` per category (`style="--ui-usage-share:N; --ui-usage-color:…"`), or a single segment without categories. Zero-value segments get `data-empty` (hidden).
- `.ui-usage-meter-footer`: `.ui-usage-meter-status` (icon + "Approaching limit") and `.ui-usage-meter-description`.
- `ul.ui-usage-meter-legend` > `li.ui-usage-meter-legend-item` (`.ui-usage-meter-swatch` + `-legend-label` + `-legend-value`).
- `children` render last (e.g. an upgrade link).

### Props
- `value` (omit with `segments` to use their sum), `max` (required), `label`, `unit` ("GB"), `formatValue(n)` (default `Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })` + unit — fixed locale so server and client match).
- `summary`: ReactNode replaces the "x of y" text; `false` hides it.
- `thresholds`: `{ warning: 75, destructive: 90 }` in percent (defaults); `false` disables tones.
- `segments`: `{ label, value, color? }[]`; colour defaults to `var(--ui-series-N)` in order. `legend` (default true with segments).
- `size`: `sm` 4px · `md` 8px (default) · `lg` 12px track.
- `description`, `labels` (`of`, `warning`, `destructive`, `full`), `getValueText(value, max)`.
- `aria-label` / `aria-labelledby` / `aria-describedby` go to the meter element, everything else to the root.
- Helper: `usageMeterTone(pct, thresholds)` returns the tone.

### Behaviour
- `value` clamped to 0…max. `pct = used / max × 100`. Tone: `pct ≥ destructive` → destructive, `≥ warning` → warning, else default. At `used ≥ max` the status reads "Limit reached".
- Status text (with icon) appears only for warning/destructive, so colour is never the only signal.
- Segmented: fills keep category colours; the tone shows in the status text only. Single bar: the fill and the used number take the tone.

### Visual rules
- Root: grid, gap 8px, 14px text. Label 500 foreground; summary muted, tabular numbers; used number 500 foreground (tone text colour on a single bar at warning/destructive).
- Track: pill, `color-mix(in oklch, var(--ui-foreground) 9%, transparent)`, `overflow: hidden`.
- Fill: pill, `width: calc(var(--ui-usage-pct) * 1%)`, flex with 2px gaps; segments `flex: <share> 1 0%`, colour `var(--ui-usage-color, var(--ui-usage-tone))`. Tone fill: default `--ui-primary`, warning `--ui-warning`, destructive `--ui-destructive`; status text uses `--ui-warning-text` / `--ui-destructive-text`.
- Footer and legend 13px; swatch 8px square, radius 2px; legend values muted, tabular.

### Motion
- Mount: the fill uncovers from the start edge with `clip-path: inset(0 100% 0 0 round 9999px)` → `inset(0)` over `--ui-spring-smooth-duration + 160ms` on `--ui-spring-smooth`, 80ms delay (RTL mirrors).
- Value changes: `width` and `flex-grow` glide on the smooth spring; colours cross-fade over `--ui-duration`.
- Reduced motion: no mount animation; values jump.

### Accessibility
- APG meter pattern: `role="meter"`, `aria-valuemin=0`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` "7.2 GB of 10 GB (72%)" plus ", approaching limit" when relevant. Named by the visible label (or `aria-label`); the description is wired with `aria-describedby`.
- The visual summary is `aria-hidden` (the value text says it); the legend is a real list.

### Acceptance checks
- `aria-valuenow`/`aria-valuetext` follow `value`; fill width ≈ pct of the track after the mount animation.
- 72% default tone; 80% warning with "Approaching limit"; 95% destructive with "Near limit"; 100% "Limit reached".
- Segmented: one segment per category in series colours, widths proportional, legend lists each with its value.
- Track heights 4 / 8 / 12px.
