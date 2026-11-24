## Component: Checkbox

A native `<input type="checkbox">` with a custom box. The mark draws in; an indeterminate (mixed) state shows a dash; a "card" variant makes a whole bordered card the target.

### Anatomy
```
<label class="ui-checkbox [ui-checkbox-card] [ui-checkbox-sm|ui-checkbox-lg]" data-state data-disabled data-invalid>
  <span class="ui-checkbox-control">
    <input type="checkbox" class="ui-checkbox-input">      invisible, covers the box (native click, focus, forms)
    <span class="ui-checkbox-box" aria-hidden>
      <svg viewBox="0 0 16 16"> <path class="ui-checkbox-check"> <path class="ui-checkbox-dash"> </svg>
  </span>
  <span class="ui-checkbox-text">                          only when label or description is given
    <span class="ui-checkbox-label"> <span class="ui-checkbox-description" id>
```
- `ref` and native props go to the `<input>`; `className` goes to the `<label>`.
- Check path `M4 8.5l2.5 2.5L12 5.5`, dash path `M4.5 8h7`, both `pathLength=1`, stroke 2, round caps.

### Props
- `checked` / `defaultChecked` / `onCheckedChange(checked)` — controlled or uncontrolled (`useControllableState`). Native `onChange` still fires.
- `indeterminate` — sets the DOM property in an effect on every render and re-applies it after a click, so the prop (not the click) decides. `data-state="indeterminate"`.
- `size`: `sm` 16px · `md` 20px (default) · `lg` 24px. `variant`: `default` · `card`.
- `label`, `description` (linked with `aria-describedby`), `invalid` (`aria-invalid`, `data-invalid`), `disabled`, `name`, `value`, `required`.

### Visual rules
- Box: 1px `--ui-border-strong`, `--radius-sm`, `--ui-surface` fill, `--ui-shadow-xs`. Checked/indeterminate: `--ui-control-on` fill and border, mark in `--ui-control-glyph`, no shadow.
- Invalid: border `--ui-destructive`; checked+invalid fills `--ui-destructive` with `--ui-destructive-foreground`.
- Label 14px/500 (sm 13px, lg 15px); description 13px `--ui-muted-foreground`. Gap 10px (sm 8, lg 12). The control is as tall as the first text line, so the box centres on it.
- Disabled: box and text opacity .5, `cursor: not-allowed`.
- Card: padding 14px 16px, 1px `--ui-border`, `--radius-lg`. Checked: border `--ui-control-on`, inset 1px ring of the same colour, background `--ui-control-on` 6% over `--ui-surface`. Hover (fine pointers, unchecked): `--ui-accent`.

### Motion
- Mark: `stroke-dashoffset` 1 → 0, 220ms `--ui-ease-out`, 40ms delay while the box fills (colours 150ms `--ui-ease-standard`).
- Press: box `scale(.92)` on `--ui-spring-snappy`.
- Reduced motion: state changes, nothing moves.

### Accessibility
- WAI-ARIA checkbox via the native input. Space toggles. Indeterminate exposes `aria-checked="mixed"` natively.
- Focus ring on `:focus-visible`: `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)` around the box (around the card for the card variant).
- Without a visible label the consumer must pass `aria-label`.

### Acceptance checks
- Clicking the label text toggles the box; `getByLabel` finds the input.
- Controlled and uncontrolled both work; `onCheckedChange` receives booleans.
- Indeterminate shows the dash and stays until the prop changes; the next click checks it.
- Mark draws (dashoffset animates) on check; card variant tints and rings when checked.
- Light, dark and every accent; keyboard focus shows a ring, pointer focus does not.
