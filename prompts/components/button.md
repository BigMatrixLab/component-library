## Component: Button

A native `<button>` for a single action, with press feedback, variants, sizes and a loading state.

### Anatomy
- `<button class="ui-btn [ui-btn-<variant>] [ui-btn-<size>] [ui-btn-icon]">` — content: optional icon(s) + label.
- Loading adds `<span class="ui-btn-spinner" aria-hidden="true">` as the first child.
- `ButtonGroup`: `<div role="group" class="ui-btn-group">` joining adjacent buttons.

### Props
- `variant`: `primary` (default) · `secondary` · `outline` · `ghost` · `soft` · `destructive` · `link`.
- `size`: `xs` 28px · `sm` 32px · `md` 36px (default) · `lg` 44px.
- `icon`: square icon-only button (requires `aria-label`).
- `loading`: shows the spinner, sets `aria-busy="true"` and `aria-disabled="true"`, swallows clicks, keeps focus and width (does **not** set `disabled`).
- `asChild`: render the child (e.g. a link) with the button classes.
- `type` defaults to `"button"`.

### Visual rules
- Text 14px/500, gap 8px, padding-inline 16px, radius `--radius-md`, 1px transparent border.
- Foreground lives in `--ui-btn-fg` per variant so the loading state can hide the label with `color: transparent` while the spinner keeps the variant colour.
- Hover tints only on `(hover: hover) and (pointer: fine)` devices.
- Outline: `--ui-border-strong` border + `--ui-shadow-xs`. Ghost/outline hover: `--ui-accent`.
- Disabled: opacity .5; disabled outline/secondary keep their shape with a muted fill.

### Motion
- Press: `scale(.97)` with `--ui-spring-snappy` (icon buttons `.94`); none when `aria-haspopup` is set.
- Colours transition with `--ui-duration-fast` + `--ui-ease-standard`.
- Spinner: 16px ring, 2px border, right side transparent, `ui-spin .7s linear infinite`.

### Accessibility
- Native button: Enter and Space activate it.
- Icon-only buttons need `aria-label`. Loading uses `aria-busy`; focus is never lost.
- Focus ring: `box-shadow: 0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)` on `:focus-visible`.

### Acceptance checks
- All variants and sizes render at the listed heights; icon buttons are square.
- Clicking a loading button does nothing; it stays focusable and keeps its width.
- Works in light and dark mode and with every `data-accent`.
