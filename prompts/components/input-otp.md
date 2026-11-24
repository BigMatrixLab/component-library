## Component: Input OTP

A one-time-code field: one box per character, a single real `<input>` underneath. Paste, SMS autofill, password managers and forms keep working because the browser only sees one text input.

### Anatomy
```
<InputOTP>                     div.ui-otp (position: relative, inline-flex, data-size|invalid|disabled)
  div.ui-otp-group             aria-hidden, one per group
    div.ui-otp-slot          x N: data-active, data-filled; holds the character
      span.ui-otp-caret        blinking caret in the active EMPTY slot
  span.ui-otp-separator        between groups (default: a short dash)
  input.ui-otp-input           the real input, stretched over everything, transparent
```

### Props
- `length` (6), `groups` (e.g. `[3, 3]`, overrides length), `separator`, `pattern` (`digits` | `alphanumeric`), `value` / `defaultValue` / `onValueChange`, `onComplete`, `invalid`, `size` (`sm` 32×40 | `md` 40×48 | `lg` 48×56), plus native input props (`name`, `disabled`, `autoFocus`, `aria-label` default "One-time code").

### Behaviour
- The input has `autocomplete="one-time-code"`, `inputMode="numeric"` (`text` for alphanumeric), `pattern`, `autocapitalize="off"`, font-size 16px (no iOS zoom). Text and caret are transparent.
- Typing filters characters by the pattern and cuts to the length. The active slot is the caret position: empty slot at the end of the value, otherwise the selected character (typing overwrites it).
- Left/Right/Home/End move the active slot; Backspace deletes. Clicking a slot places the caret there (the pointer's x is matched to the slot rectangles).
- Paste replaces the whole value with the cleaned clipboard text (non-allowed characters and spaces dropped) and fills every slot.
- `onComplete(value)` runs once when the value reaches full length.

### Visual rules
- Slot: `--ui-background` (5% foreground tint in dark), 1px `--ui-border-strong`, `--radius-md`, `--ui-shadow-xs` (none in dark), 20px/500 tabular numbers; gap 6px inside a group, 8px between groups.
- Active slot: border `--ui-ring` + 3px ring `color-mix(in oklch, var(--ui-ring) 45%, transparent)`. Invalid: border `--ui-destructive`, ring 30% destructive. Disabled: opacity .5, muted fill.
- Caret: 1px × 20px `--ui-foreground`, blinks 1.1s steps(1).

### Motion
- Border and ring cross-fade 150ms. The caret blink ends visible under reduced motion.

### Accessibility
- One labelled text input; boxes are `aria-hidden`. `aria-invalid` when `invalid`.

### Acceptance checks
- Typing 6 digits fills six boxes, fires `onComplete` once; letters are rejected under `digits`.
- Pasting `482-913` fills all six boxes; Backspace removes the last digit; arrows move the active box.
- Clicking the third box makes it active. Invalid shows red boxes. No axe violations in light and dark.
