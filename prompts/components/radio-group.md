## Component: Radio group

Choose one option from a visible set. Native radios share one `name`, so arrow keys, the roving tab stop, form submission and screen-reader semantics are the browser's. A "card" variant adds a selection ring that glides between cards.

### Anatomy
```
<RadioGroup>        <div role="radiogroup" class="ui-radio-group [ui-radio-group-sm|-lg]" data-orientation data-variant>
  <RadioGroupItem>  <label class="ui-radio [ui-radio-card]" data-state="checked|unchecked" data-disabled>
                      <span class="ui-radio-control">
                        <input type="radio" class="ui-radio-input" name value>   invisible, covers the circle
                        <span class="ui-radio-circle" aria-hidden><span class="ui-radio-dot"></span></span>
                      </span>
                      <span class="ui-radio-text"><span class="ui-radio-label"> <span class="ui-radio-description" id>
  (card variant)    <span class="ui-radio-ring" aria-hidden>  last child of the group
```
- A context carries `name`, `value`, `setValue`, `disabled`, `required`, `invalid`, `variant` to the items. An item outside a group throws.

### Props
- `RadioGroup`: `value` / `defaultValue` / `onValueChange(value)` (controlled or uncontrolled), `name` (generated with `useId` if omitted), `orientation` `vertical` (default) · `horizontal`, `variant` `default` · `card`, `size` `sm` 16 · `md` 20 · `lg` 24, `disabled`, `required`, `invalid`, plus div props (`aria-label`, `className`).
- `RadioGroupItem`: `value` (required), `label`, `description`, `disabled`, plus input props; `ref` goes to the input, `className` to the label.

### Visual rules
- Circle: 1px `--ui-border-strong`, `--ui-surface`, `--ui-shadow-xs`. Checked: `--ui-control-on` fill/border and a dot (40% of the circle) in `--ui-control-glyph`.
- Vertical: grid gap 12px. Horizontal: flex wrap, gap 12px 24px. Label 14px/500, description 13px muted.
- Disabled item: circle + text opacity .5, `cursor: not-allowed`. Invalid: `--ui-destructive` border/fill.
- Cards: padding 14px 16px, 1px `--ui-border`, `--radius-lg`, gap 8px vertical; horizontal = grid `repeat(auto-fit, minmax(min(100%, 11rem), 1fr))`. Checked card background is `--ui-control-on` 6% over `--ui-surface`.
- Ring: 1px `--ui-control-on` border + inset 1px ring, `--radius-lg`, `pointer-events: none`, absolutely positioned in the (relative) group.

### Behaviour (ring)
- In a layout effect the checked card is measured (`offsetLeft/Top/Width/Height`) and the ring gets `transform: translate(x, y)`, `width`, `height`; no checked card → opacity 0.
- The group gets `data-glide` one frame after the first placement; only then do the ring transitions apply. A `ResizeObserver` removes `data-glide`, re-places the ring and restores it, so resizing never makes it swim. Before `data-glide` the checked card draws its own ring (SSR / first paint).

### Motion
- Dot: `scale(0 → 1)` on `--ui-spring-snappy`; press scales the circle to .92.
- Ring: `transform`, `width`, `height` on `--ui-spring-morph` (550ms); opacity 150ms.
- Reduced motion: the ring jumps; colours still change.

### Accessibility
- WAI-ARIA radio group: `role="radiogroup"` (needs `aria-label` / `aria-labelledby`), native radios. Tab enters on the selected radio (or the first); ↓/→ select next, ↑/← select previous (wrapping); Space selects. Disabled radios are skipped.
- Focus ring: 3px `--ui-ring` 45% on the circle (around the card for cards).

### Acceptance checks
- Arrow keys move focus and selection; only one radio is a tab stop; submits `name=value` in a form.
- Controlled and uncontrolled; `onValueChange` receives the string.
- Card ring is measured to the checked card (same box) and glides on change; no glide on first paint.
- Light, dark, every accent; 390px width (horizontal cards stack).
