## Component: Native select

The browser's own `<select>`, styled to match Input, with a chevron. All native behaviour is kept (mobile pickers, type-ahead, forms, autofill).

### Anatomy
```
<div class="ui-select-wrap [ui-select-wrap-sm|ui-select-wrap-lg]">
  <select class="ui-select">  <option value="">Placeholder</option> <optgroup/>… </select>
  <svg class="ui-select-icon" />      chevron-down, decorative
</div>
```

### Props
- `size`: `sm` 32px · `md` 36px (default) · `lg` 44px. `wrapperClassName`. All native select props; `ref` goes to the `<select>`, `className` too.
- Inside a Field it takes id, `aria-describedby`, `aria-invalid`, `required`, `disabled` via `useFieldControl` (from `../field/field-context`).

### Visual rules
- Variables on the wrapper: `--ui-select-h` 2.25rem (sm 2rem, lg 2.75rem), `--ui-select-fs` 14px (13 / 15), `--ui-select-px` .75rem (.625 / 1rem), `--ui-select-r`.
- Select: `appearance: none`, 1px `--ui-border-strong`, bg `--ui-background` (dark: `--ui-foreground` 5% mix), `--ui-shadow-xs` (none in dark), padding-inline-end `--ui-select-px + 1.5rem` for the chevron, pointer cursor, ellipsis for long text.
- Options and optgroups: `--ui-surface-raised` bg and foreground (dark lists stay dark).
- A selected option with `value=""` reads as placeholder (`--ui-muted-foreground`, via `:has(> option[value=""]:checked)`).
- Chevron: 16px, absolutely centred at inline-end, `--ui-muted-foreground`, `pointer-events: none`; goes to `--ui-foreground` on hover (fine pointer) and focus.
- Hover (fine pointer), focus (border `--ui-ring` + 3px 25% ring), invalid (destructive border), disabled (.5, not-allowed) as Input.
- `multiple` or `size > 1` is a list box: auto height, no chevron.
- Touch: font-size 16px.

### Motion
- Border, ring, background and chevron colour transition 150ms `--ui-ease-standard`.

### Accessibility
- Native select semantics. Needs a label (Field + Label, or `aria-label`).

### Acceptance checks
- Heights 32 / 36 / 44px; the chevron never blocks clicks.
- Changing the option updates the value; the placeholder option reads muted.
- Works inside a Field; no axe violations in light and dark.
