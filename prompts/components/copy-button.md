## Component: Copy button

A button that copies a value and confirms it. Built on Button.

### Anatomy
```
<CopyButton value label?>
  <button class="ui-btn … ui-copy" data-state="idle | copied | error">
    <span class="ui-copy-icons">  copy · check · circle-alert  (stacked 16px icons)
    <span class="ui-copy-label">  idle · copied · error text   (stacked, width = widest)
  <span class="ui-copy-status" role="status" aria-live="polite">  "Copied" / "Copy failed"
```
`useCopy({ resetAfter, onCopy, onError })` → `{ copy(text), copied, error, status, reset }`. `copyText(text)` is the underlying helper.

### Props
- `CopyButton`: `value` (string or `() => string` read at click time), `label` (omit for icon-only; then pass `aria-label`, default "Copy"), `copiedLabel` ("Copied"), `errorLabel` ("Copy failed"), `resetAfter` (1500ms), `onCopy(text)`, `onCopyError()`, plus Button's `variant` and `size` (defaults: `outline` when labelled, `ghost` icon-only; size `sm`).

### Behaviour
- Click → `navigator.clipboard.writeText`. If the API is missing or rejects, falls back to a hidden textarea + `execCommand('copy')` (inside the open `<dialog>` when there is one, restoring focus). Success → `copied`, failure → `error`; both revert to `idle` after `resetAfter`.
- Clicking again while `copied` restarts the timer.
- A polite live region announces "Copied" or "Copy failed". The button's accessible name does not change.

### Visual rules
- Icons 16px, stacked in one grid cell. `copied`: check in `--ui-success-text`; `error`: alert icon in `--ui-destructive-text`. Labelled buttons keep one width (the three texts share a grid cell).

### Motion
- Idle icon shrinks to .5 with a 2px blur and fades; the check pops in (`ui-copy-pop`: .5 → 1.2 → 1 over the snappy duration). Error icon does a small shake. Label text slides 4px and cross-fades in 150–220ms. Reduced motion: icons swap without movement.

### Accessibility
- Native button; keyboard Enter / Space. Live region instead of changing the label. Icon-only needs a name.

### Acceptance checks
- Click copies the value (clipboard read in a permitted context), check appears, reverts after ~1.5s.
- Labelled width does not change between "Copy" and "Copied".
- Without the Clipboard API the fallback still copies; a refusal shows the error state.
