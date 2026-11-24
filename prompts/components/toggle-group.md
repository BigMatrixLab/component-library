## Component: Toggle, ToggleGroup, SegmentedControl

Three related controls in one family: a pressable `Toggle`, a `ToggleGroup` (formatting-toolbar style) and a `SegmentedControl` (radio-like with one gliding highlight).

### Anatomy
```
<Toggle>                       button.ui-toggle [-outline] [-sm|-lg] [-icon], aria-pressed, data-state="on|off"
<ToggleGroup>                  div.ui-toggle-group role="group", data-variant, data-orientation
  <ToggleGroupItem />          button.ui-toggle (same classes), aria-pressed
<SegmentedControl>             div.ui-seg role="radiogroup", data-size, data-full, data-has-pill, data-ready
  span.ui-seg-pill             aria-hidden highlight, positioned with --ui-seg-x/-y/-w/-h
  <SegmentedControlItem />     button.ui-seg-item role="radio", aria-checked
```

### Props
- `Toggle`: `pressed` / `defaultPressed` / `onPressedChange`, `variant` (`ghost` default | `outline`), `size` (`sm` 32 | `md` 36 | `lg` 44), `icon`.
- `ToggleGroup`: `type` (`single` default | `multiple`), `value` / `defaultValue` / `onValueChange` (`string` / `string[]`; `''` = none), `variant`, `size`, `disabled`, `orientation`. Items: `value`, `icon`, `disabled`.
- `SegmentedControl`: `value` / `defaultValue` / `onValueChange` (string), `size`, `fullWidth`, `disabled`, `name` (hidden input). Items: `value`, `disabled`.

### Behaviour
- Toggle click flips `aria-pressed`. In a `single` group pressing the pressed item clears it.
- Roving tabindex: one tab stop per group (pressed/checked item, else first enabled). `ToggleGroup` arrows/Home/End move focus (useRovingFocus, loops). `SegmentedControl` arrows (all four) and Home/End move focus AND select.
- Segmented pill: measured from the checked item (`offsetLeft/Top/Width/Height`) into CSS variables; re-measured on every render and by a ResizeObserver. Not shown if nothing is selected. First render has no transition: `data-ready` is added one frame after mount.

### Visual rules
- Toggle: 36px high, padding 12px, radius `--radius-md`, 14px/500. Pressed: `color-mix(in oklch, var(--ui-primary) 12%, transparent)` fill with `--ui-primary-text`. Hover (fine pointer): `--ui-accent`. Outline: 1px `--ui-border-strong`, `--ui-shadow-xs`; pressed border tinted toward primary.
- Outline group joins items (shared 1px borders, outer corners rounded); ghost group gap 2px.
- Segmented: well `--ui-surface-muted`, padding 3px, radius `--radius-lg`; item height 32 (sm 26, lg 40; 40/32/44 on touch), padding 14px, 14px/500, text 68% foreground → full foreground when checked; pill `--ui-surface-raised`, `--ui-shadow-sm` + 1px `--ui-border-subtle`, radius `--radius-lg − 3px`.

### Motion
- Pill: `transform`, `width`, `height` over `--ui-spring-morph-duration` with `--ui-spring-morph`. Toggle press scale .97 (icon .94) on `--ui-spring-snappy`; colours 150ms. Reduced motion: pill jumps.

### Accessibility
- Toggle / ToggleGroup: buttons with `aria-pressed`, group labelled via `aria-label`. SegmentedControl: WAI-ARIA radio group (`role="radiogroup"` / `radio`, `aria-checked`), icon-only items need `aria-label`.

### Acceptance checks
- The pill's bounding box matches the active item's, and glides (does not jump) after a click, except on first render.
- Arrow keys in the segmented control change the selection; in a toggle group they only move focus.
- Multiple toggle group keeps several items pressed; tab order has one stop per group. No axe violations in light and dark.
