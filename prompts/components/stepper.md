## Component: Stepper

Progress through a multi-step flow. Steps before `value` are complete, `value` is current, the rest are upcoming.

### Anatomy
```
<Stepper value defaultValue onValueChange orientation clickable>   ol.ui-stepper data-orientation
  <StepperItem step state? disabled?>                             li.ui-stepper-item data-state="complete|current|upcoming"
    <StepperTrigger>                                              button.ui-stepper-trigger (clickable) | div.ui-stepper-trigger — aria-current="step" on the current one
      <StepperIndicator />                                        span.ui-stepper-indicator aria-hidden — step number, or an SVG check when complete
      <StepperContent>                                            div.ui-stepper-text
        <StepperTitle />  <StepperDescription />                  span.ui-stepper-title / span.ui-stepper-description
    <StepperSeparator />                                          div.ui-stepper-separator data-state="complete|incomplete" (omit on the last step)
```

### Props
- `Stepper`: `value` / `defaultValue` (1-based, default 1) / `onValueChange`; `orientation` (`horizontal` | `vertical`); `clickable` (default: true when `onValueChange` is set).
- `StepperItem`: `step` (required), `state` (override), `disabled`.
- State = `complete` if `step < value`, `current` if equal, else `upcoming`. The separator is `complete` when its item is.

### Behaviour
- Clickable: triggers are buttons; click calls `onValueChange(step)`. `disabled` items cannot be chosen. Roving arrow keys (←→ horizontal, ↑↓ vertical), Home / End, over the enabled buttons; no typeahead.
- Not clickable: triggers are plain `div`s (not focusable).
- A complete title has a hidden " (completed)" suffix (`sr-only`).

### Visual rules
- Indicator: 28px circle, 1.5px `--ui-border-strong` border, `--ui-surface`, number 13px/500 tabular, muted.
- Current: border `--ui-primary`, number `--ui-foreground`, 4px ring of `--ui-primary` at 14%. Complete: fill `--ui-primary`, check in `--ui-primary-foreground`.
- Title 14px/500 (muted when upcoming), description 13px muted. Trigger gap 10px.
- Separator: 2px line `--ui-border` (flex-1, min 24px); fill `--ui-primary`. Vertical: 2px × 28px line, left-aligned under the indicator's centre; items stack with 6px gap.
- Under 640px (horizontal) only the current step keeps its text.
- Focus ring `0 0 0 3px` of `--ui-ring` at 45%.

### Motion
- Check: stroke draws in (`ui-draw`, `pathLength=1`) over 320ms after 60ms. Indicator colours 220ms.
- Separator fill: `scaleX(0 → 1)` (`scaleY` vertical) on `--ui-spring-smooth` / `--ui-spring-smooth-duration`, origin at the start. Reduced motion jumps.

### Accessibility
- Ordered list; the current step `aria-current="step"`. Indicators are decorative.

### Acceptance checks
- Going forward turns the number into a check and fills the line; going back reverses it.
- Disabled upcoming steps cannot be clicked or reached with arrow keys.
- Exactly one element has `aria-current="step"`.
- At 390px the horizontal stepper fits without scrolling.
