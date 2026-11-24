## Component: Rating

Star rating over native radio inputs (form-ready), with hover preview, optional half steps and a read-only mode that shows fractional values.

### Anatomy
```
<Rating>                       div.ui-rating role="radiogroup" (read-only: role="img"), data-size
  span.ui-rating-item x max    position: relative
    span.ui-rating-star        size box; data-pop while the pop animation runs
      Icon star.ui-rating-empty outline star
      span.ui-rating-fill      clipped to the filled share (width %)
        Icon star              filled amber
    input.ui-rating-input      radio, invisible, over the star (allowHalf: two inputs, left half = x.5)
```

### Props
- `value` / `defaultValue` (0) / `onValueChange`, `max` (5), `allowHalf`, `allowClear`, `readOnly`, `disabled`, `size` (`sm` 16 | `md` 24 | `lg` 32), `name`, `required`, `aria-label` ("Rating").

### Behaviour
- Hover (mouse) previews the value under the pointer; leaving restores the real value.
- Click chooses; with `allowClear`, clicking the chosen star again or Backspace/Delete resets to 0.
- Radios share one `name` (given, else generated); arrows move/select natively; each radio is labelled "3 stars" / "2.5 stars".
- `readOnly`: `role="img"`, `aria-label="<label>: 4.3 out of 5"`, no inputs (a hidden input when `name` is set). Each star fills `clamp(value − index, 0, 1)` of its width, so 4.3 fills 30% of the fifth.

### Visual rules
- Star icon 1.5 stroke. Empty: `--ui-muted-foreground` at 60%. Filled: fill `--ui-warning`, stroke `--ui-warning-text`. Gap 2px, item padding 2px (4px on touch).
- Keyboard focus: ring `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)` around the star. Disabled: opacity .5.

### Motion
- Fill width 150ms `--ui-ease-out`. The chosen star pops: `ui-rating-pop` scale .72 → 1 with `--ui-spring-snappy` over `--ui-spring-snappy-duration`. Reduced motion: no pop.

### Accessibility
- WAI-ARIA radio group of native radios; the read-only version is an image with a text alternative.

### Acceptance checks
- Hovering the 4th star fills four; moving away restores. Clicking sets the value and pops the star.
- Half mode: clicking the left half of star 3 gives 2.5. Read-only 4.3 shows a 30% fifth star.
- Arrow keys change the value; a form with `name` submits the value. No axe violations in light and dark.
