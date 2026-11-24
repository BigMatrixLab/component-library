## Component: Timeline

Events in order along a connector line, optionally grouped by day. Presentational, Server Component–safe.

### Anatomy
```
<Timeline>                    <ol class="ui-timeline">
  <TimelineGroup label>       <li class="ui-timeline-group"><h3 class="ui-timeline-group-label"/><ol class="ui-timeline-group-list">
    <TimelineItem tone marker markerType>
                              <li class="ui-timeline-item" [data-tone]>
                                <span class="ui-timeline-marker" data-kind="dot|icon|avatar">…</span>
                                <div class="ui-timeline-content">
      <TimelineHeader>          <div class="ui-timeline-header">
        <TimelineTitle />       <div class="ui-timeline-title">
        <TimelineTime />        <time class="ui-timeline-time">
      <TimelineDescription />   <p class="ui-timeline-description">
```
Groups are optional; items can sit directly in `Timeline`.

### Props
- `TimelineItem`: `tone` — `default` · `success` · `warning` · `destructive` · `info`; `marker` (node; omit for a dot); `markerType` — `icon` (wrap in tinted circle, default) · `avatar` (leave bare, 24px `Avatar size="xs"`).
- `TimelineGroup`: `label` (node), `as` (heading element, default `h3`).
- `TimelineTime`: pass `dateTime` (ISO 8601).

### Visual rules
- Marker column 1.5rem, gap .75rem; marker height 1.5rem. Items separated by `padding-bottom: 1.5rem` (none on the last).
- Connector: 1px `--ui-border`, from `marker + .25rem` down to `.25rem` above the next marker, centred under the marker; none after the last item.
- Dot: .5rem circle, `--ui-border-strong` (neutral) or the tone fill, 4px ring in `--ui-background` so the line appears to pass behind it.
- Icon marker: 1.5rem circle, 1px border mixed from the tone, fill `color-mix(tone 12%, background)`, icon .875rem in the tone's `-text` colour.
- Title 14px/500; time 12px muted, tabular-nums, nowrap; description 14px muted. Header wraps on narrow widths.
- Group label 12px/500 muted.

### Motion
- Each item uses `var(--animate-rise)` on mount. Reduced motion: shortened to 1ms.

### Accessibility
- Real ordered lists (`ol > li`); groups nest a labelled list in one `li`.
- `<time datetime>` for times. Dot markers are `aria-hidden`.
- Status is not conveyed by colour alone: the outcome must be in the text.

### Acceptance checks
- Every item except the last has a 1px connector; the last has none.
- Tone changes the marker colour; default dot is neutral.
- Groups render their label as a heading and their items in a nested list.
- No serious axe violations in light and dark.
