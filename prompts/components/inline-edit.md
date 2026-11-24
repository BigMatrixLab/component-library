## Component: InlineEdit

Text that becomes an input without moving. Same font metrics, padding compensated by a negative margin; Enter or blur saves, Esc cancels, validation and pending states built in.

### Anatomy
```
<span class="ui-inline-edit" data-state="view|edit" [data-pending] [data-invalid] [data-disabled]>
  <span class="ui-inline-edit-sizer" aria-hidden>text (invisible, sets the cell width)</span>
  <button class="ui-inline-edit-display">text | <span class="ui-inline-edit-placeholder"></span></button>     view
  <input class="ui-inline-edit-input" type="text">                                                           edit
  <span class="ui-inline-edit-affix" aria-hidden>pencil | spinner | check</span>
  <span class="ui-inline-edit-error" role="alert">message</span>
  <span class="ui-inline-edit-live" role="status">Saved</span>
</span>
```

### Props
- `value` / `defaultValue` / `onValueChange` (fires on successful save).
- `onSave?: (next: string) => unknown | Promise<unknown>` — a returned promise shows pending; a thrown `Error` keeps the field open with its message (fallback "Couldn’t save. Try again.").
- `validate?: (next: string) => string | null | undefined` — blocks saving with a message; runs before `onSave`.
- `label` (default "Value", the accessible name), `placeholder` ("Add a value"), `allowEmpty` (false), `emptyMessage` ("Can’t be empty"), `saveOnBlur` (true), `selectOnEdit` (true), `maxLength`, `disabled`, `onEditingChange`, `inputClassName`.

### Visual rules
- Sizer, button and input share **one grid cell** (`grid-area: 1/1`), `box-sizing: border-box`, `font: inherit`, `letter-spacing: inherit`, `line-height: inherit`, padding `2px 8px` (`--ui-ie-py`, `--ui-ie-px`) and a 1px border.
- The root's negative margin is `-(padding + 1px)` on every side, so the text sits exactly where plain text would. The swap changes colour and border, never position.
- Display: transparent; hover (fine pointer) `--ui-accent` fill + `--ui-border`. Input: `--ui-background`, `--ui-border-strong`, `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)`. Invalid: `--ui-destructive` border and 30% ring. Pending: opacity .7, `cursor: progress`.
- Affix sits outside the text (`left: 100%`), pencil only on hover / `:focus-visible`. Error: 12px, `--ui-destructive-text`, absolutely positioned 4px below (never shifts layout). Radius `--radius-sm`.

### Behaviour
- Click or Enter / Space on the text starts editing: input focused, all text selected.
- Enter saves; Esc cancels and restores (stops propagation); blur saves (or cancels when `saveOnBlur={false}`). Enter is ignored during IME composition. Unchanged text exits without calling `onSave`. Empty → `emptyMessage` unless `allowEmpty`.
- Pending: input read-only, `aria-busy`, spinner in the affix; Esc and blur are ignored until it settles.
- After a keyboard save or cancel, focus returns to the text; after a blur it does not.
- Success flashes a check for 1.4s and announces "Saved".

### Motion
- Display ↔ input: background, border and shadow transition 150ms `--ui-duration-fast` `--ui-ease-standard`. No position or size animation (the point of the component).
- Pencil hint fades 150ms. Check: `ui-pop-in` 220ms then `ui-fade-out` 300ms after 1.1s. Error: `ui-rise-in` 220ms.
- **Reduced motion**: error appears with a 1ms fade; check has no pop; colours still change.

### Accessibility
- View: real `<button>` named "Edit {label}: {value}". Edit: text input with `aria-label={label}`, `aria-invalid`, `aria-describedby` → the error, `aria-busy` while pending. Errors use `role="alert"`.

### Acceptance checks
- Bounding box of the text (view) and of the input's text (edit) differ by ≤ 1px; the font-size and line-height computed values are identical.
- Enter saves and shows the new value; Esc restores; blur saves.
- `validate` returning a message keeps the input open with `aria-invalid="true"`.
- A rejecting `onSave` keeps it open with the message; a resolving one closes it with a check.
