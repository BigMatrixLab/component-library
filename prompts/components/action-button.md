## Component: ActionButton

A Button whose label morphs through idle → pending → success / error → idle. The width springs to the new label, labels crossfade with a 2px blur, and the icon swaps. It composes `Button`, so it shares its variants, sizes and look.

### Anatomy
```
<Button class="ui-btn … ui-action-btn" data-state="idle|pending|success|error" aria-busy (pending)>
  <span class="ui-action-btn-layer ui-action-btn-leaving" aria-hidden>previous label</span>   (only mid-morph)
  <span class="ui-action-btn-layer" data-enter>icon + label</span>                            (current, in flow)
</Button>
<span class="ui-action-btn-live" role="status" aria-live="polite" aria-atomic="true">announcement</span>
```
- Layers are `inline-flex`, gap 8px, `white-space: nowrap`. The button gets `overflow: hidden` so the outgoing label never spills while the width catches up.
- Icons: idle = optional `idleIcon`; pending = 14px ring spinner (`ui-glyph-spinner`, 2px border, right side transparent, `ui-spin .7s linear infinite`); success = check drawn with `stroke-dashoffset` (`pathLength=1`); error = cross.

### Props
- `onAction?: () => unknown | Promise<unknown>` — runs on click (after `onClick`, unless that calls `preventDefault`). A promise drives pending → success (resolved) / error (rejected).
- `state?: 'idle' | 'pending' | 'success' | 'error'` — controlled. `onStateChange?(state)` fires on every change, controlled or not.
- `pendingLabel` (default "Working…"), `successLabel` ("Done"), `errorLabel` ("Failed"): `ReactNode`.
- `resetAfter` — ms before success / error ask for idle (default **1600**; 0 keeps the result). Works controlled too, through `onStateChange('idle')`.
- `idleIcon` — icon before the idle label.
- Everything else is `ButtonProps` (`variant`, `size`, `disabled`, `className`, ref) except `loading`, `asChild`, `icon`.

### Behaviour
- Click while not idle is ignored (`preventDefault`); the button is never `disabled`, so keyboard focus stays on it.
- Pending sets `aria-busy="true"`; the label stays visible (CSS overrides Button's loading style).
- Success fill = `--ui-success` with `--ui-success-foreground`; error fill = `--ui-destructive` with `--ui-destructive-foreground` (both measured ≥ 4.5:1). The fill transitions with Button's `--ui-duration-fast`.
- A polite live region announces pendingLabel / successLabel / errorLabel and is empty in idle.

### Motion
- **Width**: measured before and after each state change (`useMorphWidth`), animated with the Web Animations API from the width on screen to the new natural width, `--ui-spring-morph` curve and `--ui-spring-morph-duration` (550ms), read from CSS. Interruptible: a change mid-flight starts from the current width. Never on first render.
- **Labels**: entering layer `ui-action-label-in` 220ms (`--ui-duration`) `--ui-ease-out`: from `opacity 0; translateY(4px); blur(2px)` to rest. Leaving layer `ui-action-label-out` 160ms (`--ui-duration-exit`) `--ui-ease-in`: to `opacity 0; translateY(-4px); blur(2px)`, absolutely positioned over the button, `pointer-events: none`. It is kept mounted 200ms (`useCrossfade`).
- **Check** draws in 320ms (`ui-draw`, 60ms delay); **cross** uses `ui-pop-in`.
- **Reduced motion**: no width animation, no leaving layer, no blur or movement; entering layer is a 1ms fade, check/cross appear static. State colours and the live region still change.

### Accessibility
- Native `<button>`; Enter and Space activate it. Focus ring per Button.
- State is conveyed by `aria-busy`, the live region, the label text and the icon — never colour alone.

### Acceptance checks
- Click "Save draft": label becomes "Saving…" with a spinner, then "Draft saved" with a check on a success fill, then back to "Save draft" after ~1.6s.
- The button's measured width differs between idle and success and settles within ~600ms; it is never `display: none` or disabled.
- A rejected `onAction` shows `errorLabel` and a destructive fill, then resets.
- Controlled `state="success"` renders the success label; `onStateChange('idle')` fires after `resetAfter`.
- Under `prefers-reduced-motion: reduce` the label swaps without any size or position animation.
