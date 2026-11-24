## Component: NumberInput

A numeric field: a text input with `role="spinbutton"`, − / + buttons, min / max / step, formatted display (number, currency, percent) in a locale, and parsing on blur. Value is `number | null`.

### Anatomy
```
<div class="ui-input-group ui-number-input [ui-number-input-attached]" data-controls="inside|attached|none">
  <button type="button" tabindex="-1" class="ui-number-input-step ui-input-action | ui-number-input-step-attached"
          data-direction="down" aria-label="Decrease">minus icon</button>
  <input type="text" role="spinbutton" class="ui-input ui-number-input-field" inputmode="decimal|numeric">
  <button … data-direction="up" aria-label="Increase">plus icon</button>
</div>
<input type="hidden" name>          only when `name` is set; carries the raw number
```
Built on `InputGroup` (reuses the surface, ring, sizes, invalid and disabled styles of the Input spec). In `inside` mode the buttons are `InputAction`s; in `attached` mode they are full-height segments.

### Props
- `value` / `defaultValue` (`number | null`, default `null`), `onValueChange(value)` via `useControllableState`. Fires on commit (step, key, wheel, blur, Enter), never per keystroke.
- `min`, `max`, `step` (default 1), `largeStep` (default `step * 10`).
- `format` `number | currency | percent`, `locale`, `currency` (default "USD"), `minimumFractionDigits`, `maximumFractionDigits`. Percent values are fractions (0.15 shows "15%"). Default max fraction digits: number `max(3, step decimals)`, percent `max(0, step decimals − 2)`.
- `controls` `inside` (default) | `attached` | `none`; `allowWheel` (default false); `holdToRepeat` (default true); `size` `sm|md|lg` (32 / 36 / 44px); `incrementLabel`, `decrementLabel`; `name`; `groupClassName`; native input props go to the input; `ref` is the input.
- Inside a Field it uses `useFieldControl` (id, `aria-describedby`, `aria-invalid`, `required`, `disabled`).
- Parsing (`parseNumber`): locale decimal and group symbols (de-DE "1.234,5"), locale numerals, leading minus or parentheses, currency symbols and "%" ignored; a "." or "," that is not the locale's group separator counts as the decimal point. Empty text commits `null`; unreadable text is dropped and the previous value returns. Committed values are rounded to `max(step decimals, displayed fraction digits)` (percent +2) and clamped.

### Behaviour
- Display is `draft ?? format(value)`: while typing the draft shows; blur or Enter commits it.
- Keys: Up/Down ± step (Shift ×10), PageUp/PageDown ± largeStep (default ×10), Home/End → min/max only when defined (otherwise the caret moves). From an empty field a step starts at the step itself, clamped.
- Buttons: press steps once; holding repeats after 400ms at 110ms intervals shrinking to 35ms, with a multiplier 1 → 2 (after 12 ticks) → 5 (24) → 10 (40). A button is `disabled` at its bound (value ≥ max for +, ≤ min for −) and a repeat stops when nothing changes. Buttons prevent default on pointer/mouse down so focus stays where it is, are not tab stops, and a click with `detail === 0` (assistive tech) steps once.
- Wheel (opt-in): non-passive `wheel` listener, only while the input is focused; deltaY < 0 increases.
- ARIA: `aria-valuenow` = value, `aria-valuemin/max`, `aria-valuetext` = the formatted text; omitted when empty.

### Visual rules
- Text centred, `font-variant-numeric: tabular-nums`. Inside mode: − at the start and + at the end, each 4px from the border (28px square at md, from `.ui-input-action`). Attached mode: segments `--ui-input-h` wide, bg `--ui-surface-muted`, muted icon, 1px divider in `--ui-input-border`, outer corners follow the group radius − 1px, hover (fine pointer) `--ui-accent`, `:active` a darker accent, focus-visible an inset 2px ring.
- Disabled step button: opacity .4.
- Buttons: no text selection, no iOS callout, `touch-action: manipulation`. Touch: 16px text.

### Motion
- As Input: border / ring 150ms. Inside buttons press to .94 on `--ui-spring-snappy`. The number itself is not animated.

### Accessibility
- WAI-ARIA spinbutton on the input; the buttons are conveniences. Icons `aria-hidden`.

### Acceptance checks
- Heights 32 / 36 / 44px; ring on the group when the input is focused.
- Arrow keys, PageUp/Down, Home/End change `aria-valuenow`; Home/End do nothing special without min/max.
- + disabled at max and − at min; clicking them does not change the value.
- Typing "1,249.5" in a EUR field and blurring shows "€1,249.50" and reports 1249.5; "abc" restores the old value; clearing reports `null`.
- Percent: 0.15 shows "15%"; typing "20" gives 0.2.
- Holding + increases the value repeatedly and accelerates; releasing stops.
- Wheel changes the value only with `allowWheel` and focus.
- No axe violations in light and dark.
