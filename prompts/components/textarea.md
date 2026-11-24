## Component: Textarea

A native multi-line `<textarea>` that grows with its content, with an optional character counter.

### Anatomy
```
<textarea class="ui-textarea [ui-textarea-sm|ui-textarea-lg]" data-autogrow style="--ui-textarea-rows:3">

<div class="ui-textarea-wrap">                         only with showCount
  <textarea class="ui-textarea" />
  <span class="ui-textarea-count" [data-state="near|limit"]>42 / 160</span>
</div>
```

### Props
- `size`: `sm` · `md` (default) · `lg`. `autoGrow` (default true). `rows` (minimum lines, default 3). `maxRows` (cap, then scroll). `showCount`. `wrapperClassName`. All native textarea props, `ref` forwarded.
- Inside a Field it takes id, `aria-describedby`, `aria-invalid`, `required`, `disabled` via `useFieldControl` (from `../field/field-context`); the counter id is appended to `aria-describedby`.

### Behaviour
- Auto-grow: CSS `field-sizing: content` with `data-autogrow`. Where `CSS.supports('field-sizing', 'content')` is false, a layout effect sets `style.height = auto`, then `scrollHeight + border` on mount, on value change and on every input.
- `rows` sets `--ui-textarea-rows` (and the native `rows`); `maxRows` sets `--ui-textarea-max: calc(N * --ui-textarea-lh + 2 * --ui-textarea-py + 2px)`; above it the box scrolls (`overflow-y: auto`).
- Counter: length of `value` (controlled) or tracked from `onChange` (uncontrolled, seeded from `defaultValue`). With `maxLength` it reads `count / max`; `data-state="near"` at ≥ 90%, `"limit"` at 100%. Not a live region; it is in `aria-describedby`.

### Visual rules
- Same surface as Input: 1px `--ui-border-strong`, `--radius-md`, bg `--ui-background` (dark: `--ui-foreground` 5% mix), `--ui-shadow-xs` (none in dark), text 14px with line-height 22px (`--ui-textarea-lh`), padding 8px 12px.
- Min height = rows × lh + 2 × py + 2px. `resize: none` while auto-growing, `vertical` otherwise.
- Sizes: sm 13px / lh 20px / py 6px / px 10px; lg 15px / lh 24px / py 10px / px 16px / `--radius-lg`.
- Hover (fine pointer), focus (border `--ui-ring` + 3px 25% ring), invalid (destructive), disabled (.5), read-only (muted fill) as Input.
- Counter: 12px, `tabular-nums`, right aligned, 6px below; `--ui-muted-foreground`, near `--ui-warning-text`, limit `--ui-destructive-text`.
- Touch: font-size 16px.

### Motion
- Border, ring, background and counter colour transition 150ms `--ui-ease-standard`. The height is never animated (typing must not lag).

### Accessibility
- Native textarea semantics; `maxLength` is enforced natively.

### Acceptance checks
- A 3-line textarea is 84px tall (md); typing more lines makes it taller, and it stops at `maxRows` and scrolls.
- The counter updates as you type and its colour changes at 90% and 100%.
- Works inside a Field (label click focuses, hint / error / counter in `aria-describedby`).
- No axe violations in light and dark.
