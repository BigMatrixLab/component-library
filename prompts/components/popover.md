## Component: Popover

A small, non-modal surface anchored to its trigger. The panel is a `popover="manual"` element in the browser top layer, positioned by `useFloating` (flip, shift, transform-origin from the anchor), so an `overflow: hidden` parent never clips it.

### Anatomy
```
<Popover>                       context: open state, ids, trigger ref
  <PopoverTrigger />            button: aria-haspopup="dialog", aria-expanded, aria-controls (when open)
  <PopoverContent>              <div class="ui-floating ui-popover" role="dialog" popover="manual" data-state data-side>
    …content…                   (optional <span class="ui-floating-arrow">)
    <PopoverClose />            button that closes it
```
`FloatingContent` (shared with Tooltip and DropdownMenu) renders the panel: `usePresence` keeps it mounted for the exit animation, `useFloating` promotes it to the top layer and positions it.

### Props
- `Popover`: `open`, `defaultOpen`, `onOpenChange` (controlled or uncontrolled).
- `PopoverContent`: `placement` (`top|right|bottom|left`, optionally `-start|-end`; default `bottom`), `align` (overrides the alignment part), `offset` (default 6, 10 with arrow), `matchWidth`, `arrow`, `dismissible` (default true), `className`, native div props (e.g. `aria-label`).
- `PopoverTrigger` / `PopoverClose`: buttons; `asChild` to use your own element.

### Behaviour
- Trigger click toggles. The trigger is part of the "inside" for outside-click detection, so clicking it while open closes it once.
- On open focus moves into the panel: first `[autofocus]`/`[data-autofocus]` element, else the first tabbable element, else the panel (`tabIndex=-1`).
- Esc and a pointerdown outside (`useDismiss`) close it; Tab moving focus out of the panel closes it too.
- On close focus returns to the trigger (kept in a ref, because Safari and Firefox do not focus buttons on click) unless focus already moved elsewhere or the close was an outside click.
- The panel follows the trigger on scroll, resize and size changes; it flips to the other side when there is no room and shifts to stay 8px inside the viewport.
- `aria-labelledby` defaults to the trigger when no `aria-label`/`aria-labelledby` is given.

### Visual rules
- Panel: `--ui-surface-raised`, 1px `--ui-border`, `--radius-lg`, padding 16px, `--ui-shadow-lg`, width 18rem (max `100vw − 16px`), 14px text.
- Arrow: 10px rotated square, same fill, 1px border on the two outer sides, centred on the trigger (clamped 16px from the panel corners).

### Motion
- Open: `ui-pop-in` 220ms `--ui-ease-out` from the anchor side (`--ui-origin`), 4px travel (`--ui-pop-y`), scale .96, 2px blur.
- Close: `ui-pop-out` 160ms `--ui-ease-in`, pointer events off; unmounts after the animation.

### Accessibility
- Non-modal dialog: trigger `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`; content `role="dialog"` with an accessible name.
- Keyboard: Enter/Space toggle on the trigger, Tab through content, Esc closes.

### Acceptance checks
- Panel sits next to the trigger (gap = offset) and flips near the viewport edge.
- Focus goes in on open and back to the trigger on Esc / Close; an outside click does not steal focus.
- Esc and outside click close it; clicking inside does not.
- No axe violations in light and dark with the panel open.
