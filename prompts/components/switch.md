## Component: Switch

A `role="switch"` button for a setting that applies immediately. Track plus thumb; the thumb slides on a spring that never overshoots and widens slightly while pressed.

### Anatomy
```
<button type="button" role="switch" aria-checked data-state="checked|unchecked" class="ui-switch [ui-switch-sm]">
  <span class="ui-switch-thumb" aria-hidden>
</button>
<input type="hidden" name value>            only while on, when `name` is set and not disabled
```
With `label` or `description`, everything is wrapped:
```
<div class="ui-switch-field [ui-switch-field-start]" data-disabled>
  <button …/>
  <span class="ui-switch-text"><label for=id class="ui-switch-label"> <span id class="ui-switch-description">
```

### Props
- `checked` / `defaultChecked` / `onCheckedChange(checked)` — controlled or uncontrolled. `onClick` still fires; `preventDefault()` cancels the toggle.
- `size`: `sm` track 32×18 · `md` 40×24 (default). `name`, `value` (default `"on"`), `required`.
- `label`, `description` (`aria-describedby`), `labelPosition` `end` (default) · `start` (row-reverse, space-between), `fieldClassName` (row); `className` goes to the button; `id` is used for the `<label for>` (generated otherwise).

### Visual rules
- Track radius full; unchecked `--ui-control-track`, checked `--ui-control-on`. Thumb 20px (sm 14px), 2px inset, `--ui-control-thumb`, `--ui-shadow-sm`.
- Thumb x when on = track width − thumb − 2×2px. Pressed: thumb width + 4px (sm 3px); when on it also shifts left by that amount so the right edge stays put.
- Hover (fine pointers): track tints 12%. Disabled: opacity .5, `cursor: not-allowed`; the row dims its text.
- Coarse pointers: a `::after` grows the tap area to 44px without changing the visible size.
- Row: gap 12px; the switch aligns to the first text line; label 14px/500; description 13px muted.

### Motion
- Thumb `transform` on `--ui-spring-smooth` (540ms, no overshoot — the state report never flickers past its end); thumb `width` 150ms `--ui-ease-out`; track colour 220ms `--ui-ease-standard`.
- Reduced motion: thumb jumps, colour changes.

### Accessibility
- WAI-ARIA switch: Space and Enter toggle; `aria-checked` is `true|false`. Name via the label, `aria-label` or `aria-labelledby`.
- Focus ring on `:focus-visible`: `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)`.

### Acceptance checks
- Click, tap, Space and Enter toggle; clicking the label text toggles.
- `aria-checked` flips immediately; thumb travel equals the measured track width − thumb − 4px.
- Hidden input appears only while on and named; disabled switches ignore input.
- Light, dark, every accent.
