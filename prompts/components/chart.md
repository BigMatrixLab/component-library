## Component: Chart (LineChart, AreaChart, BarChart, DonutChart, RadialChart, Sparkline)

Our own SVG chart engine: no chart library, only React. Calm and precise: dashed low-contrast grid, a crosshair that glides between points, a subtle draw-in. Colours are only ever CSS variables, so theme, dark mode and accent switch live without re-rendering.

### Anatomy
```
<div class="ui-chart" style="--ui-chart-c0: var(--ui-series-1); …">   root, one var per series (or slice)
  .ui-chart-legend (top)            buttons .ui-chart-legend-item[aria-pressed] > .ui-chart-swatch
  .ui-chart-plot                    measured width, fixed height (placeholder on the server)
    .ui-chart-stage                 role="group", tabIndex 0, pointer + key handlers
      <svg role="img" aria-label>   grid · axes · marks · overlay (crosshair, dots, cursor)
      .ui-chart-tooltip             aria-hidden, absolutely positioned
      .ui-chart-center              donut / radial hole (HTML text)
      .ui-chart-sr[role=status]     polite live region (keyboard readout)
  .ui-chart-legend (bottom)
  table.ui-chart-sr                 every value, visually hidden
```
`Sparkline` is `.ui-sparkline > svg` with no stage.

### Props
Common (`LineChart`, `AreaChart`, `BarChart`):
- `data` records, `index` (x key), `series: { key, label?, color? }[]` (`color`: `'series-1'`…`'series-6'` or any CSS colour; default cycles series-1…6).
- `height` (280), `valueFormat` (`'number' | 'currency' | 'percent' | 'compact' | Intl options | fn`; `'percent'` expects 0–100), `indexFormat`, `locale`.
- `xAxis` / `yAxis`: `boolean | options` (y: `format, ticks, width, domain: [min|'auto', max|'auto']`; x: `format`). Bottom and left axes, whatever the orientation.
- `grid`: `boolean | 'horizontal' | 'vertical' | 'both'` (true = horizontal; for horizontal bars true = vertical lines).
- `legend`: `'top' | 'bottom' | false` (default bottom when 2+ series). Items toggle series; the last visible series cannot be hidden.
- `tooltip`: `boolean | { labelFormat }`. `animate` (true). `aria-label`, `className`.
- `LineChart` / `AreaChart`: `curve: 'monotone' | 'linear' | 'step'` (monotone, no overshoot). `AreaChart`: `stacked`.
- `BarChart`: `stacked`, `orientation: 'vertical' | 'horizontal'`, `radius` (4).
- `DonutChart`: `data, index, valueKey, colors?, innerRadius` (0.62; 0 = pie), `padAngle` degrees (2), `cornerRadius` (4), `centerLabel`, `centerValue`, `valueFormat`, `legend` ('bottom'), `tooltip`, `animate`, `height` (240).
- `RadialChart`: `data, index, valueKey, max` (100), `variant: 'ring' | 'semicircle'`, `thickness`, `track` (true), `colors`, `centerLabel`, `centerValue`, `valueFormat`, `height` (240 / 160).
- `Sparkline`: `data` (numbers or records + `valueKey`), `variant: 'line' | 'area' | 'bar'`, `width` (fills parent), `height` (32), `color`, `trend` (success when last > first, destructive when below), `curve`, `dot` (true), `strokeWidth` (1.5).

### Behaviour
- Width comes from a ResizeObserver on `.ui-chart-plot`; height is the prop. Nothing touches `window` during render. Before the first measure (and on the server) only the sized placeholder renders, so there is no layout shift and no hydration flash.
- Pointer / touch: the nearest index follows the pointer and snaps; touch scrubs horizontally (`touch-action: pan-y`) and keeps the readout until a tap elsewhere. Mouse leaving clears it.
- Keyboard (the stage is focusable): ←/→ (and ↑/↓) move the active index, Home/End jump, Esc clears. The readout text goes to the live region.
- Tooltip: label, then rows of swatch, series name and formatted value. It sits 14px beside the anchor, flips to the other side near the edge and is clamped inside the stage. It follows the pointer's y and snaps to the index's x. The first frame after appearing jumps; later frames glide (120ms).
- Bars: hovering a category dims the other categories' bars to 40% and shows a rounded `--ui-accent` slot behind it.
- Donut: hovering expands the slice 6px outward, dims the others, and the hole shows that slice's name and value. Radial: ring under the pointer thickens; hole shows its value.
- Data changes ease numbers over 450ms (requestAnimationFrame); a change in row count snaps. Hidden series leave the domain.
- Axis labels thin out so neighbours never overlap; y-axis width follows the widest tick label.

### Visual rules
- Grid: 1px dashed `3 4`, `--ui-border` at 80%. Axis line `--ui-border-strong`. Axis text 12px `--ui-muted-foreground`, tabular numbers.
- Lines 2px, round caps and joins. Areas: gradient from the series colour at 34% (55% stacked) to 0% (12% stacked).
- Bars: rounded only on the far end (top, bottom for negatives, right/left for horizontal), radius 4, max width 48px per bar, 2px between grouped bars. Stacked: only the outermost segment of each sign is rounded.
- Active dots r=4.5 with a 2px `--ui-surface` ring. Crosshair 1px `--ui-border-strong`.
- Tooltip: `--ui-surface-raised`, 1px `--ui-border`, `--radius-md`, `--ui-shadow-md`, padding 8×10, 12px text, values 500 weight.
- Legend: 12px muted buttons, 28px high (36px on coarse pointers), hover only inside `(hover: hover) and (pointer: fine)`, focus ring `0 0 0 3px` ring at 45%. Hidden series are struck through.
- Donut/radial centre value 24px/600, tracking −0.02em; label 12px muted. Track ring `--ui-surface-muted`.
- Focus on the stage: the standard 3px ring on `:focus-visible` only.

### Motion
- Mount only, ≤ 700ms, `cubic-bezier(0.22, 1, 0.36, 1)`: lines draw in (stroke-dashoffset from `getTotalLength`, 600ms, 40ms stagger per series up to 100ms); areas fade up 8px (600ms); bars grow from the baseline (500ms, stagger ≤ 30ms and ≤ 200ms in total); donut and radial sweep (700ms).
- Crosshair, dots and bar slot glide 160ms; tooltip 120ms; opacity fades 150ms.
- `prefers-reduced-motion: reduce` skips every entrance, tween and glide; the state still changes.

### Accessibility
- The `svg` is `role="img"` with an `aria-label` (generated: kind, series, point count and range) unless `aria-label` is given. The focusable stage is `role="group"` labelled with the same summary and the key hint.
- A visually hidden `<table>` lists every value (row headers = index values); donut adds the share, radial the goal.
- Legend items are buttons with `aria-pressed`. The tooltip is `aria-hidden`; keyboard readouts go through `role="status"`.
- Colour is never the only identifier: legend and tooltip name every series. Axe passes in light and dark.

### Acceptance checks
- Renders the right number of marks (one path per line/area series, one per non-zero bar, one per visible slice).
- Hover or touch shows the tooltip at the nearest index and it never leaves the chart, including at the right edge.
- ←/→ moves the active index, Esc clears it.
- Legend click hides a series and the marks follow; the last series cannot be hidden.
- Resizing the container redraws at the new width with aligned axes.
- No console errors, no layout shift on load, no window access in SSR.
