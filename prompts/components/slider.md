## Component: Slider

Pick a value or a range on a track. Built with pointer events and pointer capture; thumbs are `role="slider"`. A value bubble shows while dragging or keyboard-focused.

### Anatomy
```
<div class="ui-slider" data-orientation data-tooltip [data-disabled] [data-dragging]  role="group" only when 2+ thumbs>
  <div class="ui-slider-track" aria-hidden><div class="ui-slider-range" style="--ui-p-start;--ui-p-end" [data-single]></div></div>
  <div class="ui-slider-thumb" role="slider" tabindex="0" style="--ui-p: 0–1" [data-dragging]>
    <span class="ui-slider-tooltip" aria-hidden>value text</span>
  </div>
  (one thumb per value)
  <input type="hidden" name value>   one per thumb when `name` is set
</div>
```
- Math lives in `slider-math.ts` (pure): `snapToStep`, `pointerToRatio`, `nearestThumb`, `setThumbValue`, `keyToValue`.

### Props
- `value` / `defaultValue` (default `[min]`) / `onValueChange(number[])` — controlled or uncontrolled. `onValueCommit(number[])` fires when a drag ends or a key changes the value.
- `min` 0, `max` 100, `step` 1, `minStepsBetweenThumbs` 0, `orientation` `horizontal` · `vertical`, `disabled`, `name`.
- `formatValue(v)` → bubble text and `aria-valuetext`; `thumbLabels` (default "Minimum"/"Maximum" for two thumbs, "Value n" otherwise); `tooltip` `auto` · `always` · `never`.
- `aria-label` / `aria-labelledby`: on the thumb for a single slider, on the group for a range.

### Behaviour
- Pointer down on a thumb grabs it and keeps the grab offset (no jump). Pointer down on the track moves the nearest thumb there (ties: the thumb that can move toward the pointer) and starts a drag. Pointer is captured on the root; the thumb is focused.
- Value: thumb centre travels `length − thumb size`; ratio → value → snapped to `min + k·step` (float-safe) → clamped between neighbouring thumbs (+ `minStepsBetweenThumbs`). Thumbs never cross.
- Vertical: value 0 at the bottom; Up increases.
- Keys (on the thumb): →/↑ +step, ←/↓ −step, PageUp/PageDown ±≈10% of the range (a multiple of step), Home/End → min/max (or the neighbour limit).
- Thumb `aria-valuemin`/`valuemax` are the neighbours' values in a range.

### Visual rules
- Root height 20px (the thumb) horizontal; vertical: 20px wide, 12rem tall default. `touch-action: pan-y` (vertical: `pan-x`), `user-select: none`.
- Track 6px, full radius, `--ui-control-track`; fill `--ui-control-on` (single: from the track start; range: between the thumbs' centres).
- Thumb 20px circle, 2px `--ui-control-on` border, `--ui-control-thumb` fill, `--ui-shadow-xs`. Position set with layout (`left`/`bottom` via `--ui-p`), never animated, so it tracks the pointer exactly.
- Bubble: `--ui-primary` fill, `--ui-primary-foreground` 12px/500 tabular numbers, `--radius-sm`, 4px 8px padding, 8px above the thumb (vertical: to the right).
- Disabled: opacity .5, `cursor: not-allowed`.

### Motion
- Thumb `scale` 1 → 1.12 while dragging (1.06 hover on fine pointers) on `--ui-spring-snappy`.
- Bubble: opacity 0 → 1, `translate` 4px → 0, blur 2px → 0; 220ms `--ui-ease-out` in, 150ms `--ui-ease-in` out.
- Reduced motion: no movement; state still changes.

### Accessibility
- WAI-ARIA slider and multi-thumb slider: `role="slider"`, `aria-valuenow`, `aria-valuetext`, `aria-valuemin/max`, `aria-orientation`; two-thumb sliders sit in a labelled `role="group"`.
- Focus ring on `:focus-visible`: `0 0 0 4px color-mix(in oklch, var(--ui-ring) 45%, transparent)`.

### Acceptance checks
- Drag with a mouse and touch; click on the track jumps the nearest thumb; keyboard changes by step.
- Range thumbs cannot cross; `aria-valuenow` and bubble text match.
- Form values appear as hidden inputs; vertical works; light, dark, every accent; 390px width.
