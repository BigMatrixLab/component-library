## Component: Input

A native single-line `<input>` with sizes, states and an input group for icons, addons and inline actions, plus a password input with a reveal toggle.

### Anatomy
```
<input class="ui-input [ui-input-sm|ui-input-lg]">

<div class="ui-input-group [ui-input-group-sm|ui-input-group-lg]">     one bordered surface
  <span class="ui-input-icon" aria-hidden>…svg…</span>                   leading or trailing icon
  <span class="ui-input-addon">https://</span>                           attached text, divider towards the input
  <input class="ui-input">
  <span class="ui-input-addon">.com</span>
  <button type="button" class="ui-input-action" aria-label="Clear">…svg…</button>
</div>
```
`PasswordInput` = `InputGroup` + `Input` (type toggles `password` / `text`) + `InputAction` with `Icon eye / eye-off`.

### Props
- `Input`: `size` `sm` 32px · `md` 36px (default) · `lg` 44px; all native input props; `ref` forwarded. Inside a Field it takes id, `aria-describedby`, `aria-invalid`, `required`, `disabled` from `useFieldControl` (from `../field/field-context`).
- `InputGroup`: `size`; clicking any non-interactive part focuses the input (ignored for `button, a, input, select, textarea`).
- `InputIcon`, `InputAddon`: spans. `InputAction`: button, `type="button"` default; needs `aria-label`.
- `PasswordInput`: Input props (minus `type`) + `visible` / `defaultVisible` / `onVisibleChange` (controlled or uncontrolled via `useControllableState`), `toggleLabel` (default "Show password"), `groupClassName`. The toggle has a constant label, `aria-pressed`, and is disabled when the field is.

### Visual rules
- Variables on `.ui-input` / `.ui-input-group` (inherited by a group's input): `--ui-input-h` 2.25rem (sm 2rem, lg 2.75rem), `--ui-input-fs` 14px (sm 13, lg 15), `--ui-input-px` .75rem (sm .625, lg 1rem), `--ui-input-r` `--radius-md` (lg `--radius-lg`).
- Surface: 1px `--ui-border-strong`, bg `--ui-background`, `--ui-shadow-xs`. Dark: bg `color-mix(in oklch, --ui-foreground 5%, transparent)`, no shadow. Text `--ui-foreground`, placeholder `--ui-muted-foreground`.
- Hover (fine pointer only): border `color-mix(in oklch, --ui-border-strong 55%, --ui-foreground)`.
- Focus: border `--ui-ring` + `0 0 0 3px color-mix(in oklch, --ui-ring 25%, transparent)`. For a group the ring is drawn on the group when its input is focused; the input itself is borderless.
- Invalid (`aria-invalid="true"`): border `--ui-destructive`, focus ring destructive 25%.
- Disabled: opacity .5, `not-allowed`. Read-only: bg `--ui-surface-muted` 60%, stays focusable.
- Group: flex, items centred. Icon: padding-inline-start = `--ui-input-px`, 16px, `--ui-muted-foreground`, `pointer-events: none`; the input after a leading icon has padding-inline-start 8px. Addon: `--ui-surface-muted` bg, muted text, padding-inline `--ui-input-px`, 1px divider in the border colour on the side facing the input; outer corners follow the group radius − 1px. Action: square `(--ui-input-h − 8px − 2px)` (28px at md), margin-inline-end 4px, radius = group radius − 2px, muted icon, hover (fine pointer) `--ui-accent`, `aria-pressed="true"` uses `--ui-foreground`, `[hidden]` hides it.
- Touch (`pointer: coarse`): font-size 16px, so iOS Safari does not zoom on focus.
- Type `file`: button styled as `--ui-secondary`; `search`: native cancel button hidden.

### Motion
- Border, box-shadow and background transition 150ms `--ui-ease-standard` (explicit properties, never `all`).
- Action press: `scale(.94)` with `--ui-spring-snappy`.

### Accessibility
- Native input semantics; label via `Field` + `Label` or `aria-label`.
- Reveal toggle: button with fixed `aria-label`, `aria-pressed`; icons are `aria-hidden`.
- Keyboard focus on an action shows the 3px ring (`:focus-visible`).

### Acceptance checks
- Heights are 32 / 36 / 44px for inputs and for groups.
- Focus draws the ring on the group, not twice; invalid groups show the destructive border.
- Clicking an icon or addon focuses the input; clicking the action does not steal focus into the input.
- PasswordInput toggles the input type and `aria-pressed`; the value is kept.
- No axe violations in light and dark.
