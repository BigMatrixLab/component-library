## Component: Toast

Transient notifications: `<Toaster />` mounted once, plus an imperative `toast()` callable from anywhere (a tiny external store read with `useSyncExternalStore`).

### Anatomy
```
<Toaster>                         <section class="ui-toaster" aria-label="Notifications"> in a top-layer popover
  <ol class="ui-toaster-list">
    <li class="ui-toast-slot">    stack position (transform, height)
      <div class="ui-toast">      swipe + enter/exit, data-type
        <div class="ui-toast-card"><div class="ui-toast-inner">
          .ui-toast-icon  .ui-toast-content (.ui-toast-title .ui-toast-description)  .ui-toast-actions (.ui-toast-btn)
        </div></div>
        button.ui-toast-close
```
Files: `store.ts` (store + `toast`), `types.ts`, `toaster.tsx`, `toast-item.tsx`, `use-swipe.ts`, `use-toast-layer.ts`.

### API
- `toast(title, options?)`, `toast.success|error|warning|info|loading`, each returns the id.
- `toast.promise(promise | () => promise, { loading, success, error, description?, finally?, toasterId? })` morphs ONE toast; `success`/`error` may be a node or `(value) => node | { title, description, … }`. Returns `{ id, unwrap }`.
- `toast.dismiss(id?)` (all when omitted). Dismissed toasts stay in the store, marked `dismissed`, until their exit animation ends.
- Options: `description`, `duration` (default 4000, `Infinity` allowed; loading defaults to `Infinity`), `action` / `cancel` `{ label, onClick }` (click dismisses unless `preventDefault()`), `icon` (`false` for none), `id` (existing id updates in place, restarts the timer, revives a leaving toast), `dismissible` (default true), `important` (assertive), `closeButton`, `toasterId`, `className`, `onDismiss`, `onAutoClose`.
- `Toaster` props: `position` (`top|bottom`-`left|center|right`, default `bottom-right`), `visibleToasts` 3, `expand` false, `richColors` false, `closeButton` false, `gap` 14, `offset` (24px, 16px on phones), `duration` 4000, `label` "Notifications", `id`, `className`, `style`.

### Stacking (Sonner-like)
- Newest toast is index 0 (front). Collapsed: toast `i` is scaled `1 - .05·i`, translated 14px·i toward the inside of the screen, shrinks to the front toast's height and hides its content; `transform-origin` is the docked edge. Toasts at or beyond `visibleToasts` fade out (and are `inert`).
- Expanded (pointer hover, focus within, or `expand`): every toast is at its own measured height; offset = sum of the heights + `gap` of the toasts in front of it. A pseudo-element bridges the gap so the pointer never leaves the list.
- Heights are measured on the content wrapper (not the slot) in a layout effect and with a `ResizeObserver`, so the stack follows content changes (promise morph).
- Leaving toasts keep their last layout, so the others glide into place.

### Behaviour
- Timer per toast; pauses on hover, focus within, a pointer held down, and `document.hidden`; resumes with the time left. Any update restarts it.
- Swipe (pointer events, mouse/pen/touch): dismisses toward the docked edge (`right` for `*-right`, `left` for `*-left`, up/down for the vertical edge). Axis locks after 6px; pointer capture starts only then (so button clicks still work). Release past 45px or faster than .11px/ms dismisses, otherwise it springs back. Against the dismiss direction it resists (max 10px). `touch-action: none`.
- Exit: `data-removed` plays `ui-toast-out` (160ms), then the toast is removed from the store (fallback timeout 700ms). Swipe-out transitions instead.
- Keyboard: Alt+T or F8 focuses the region (remembering the previous focus); Esc on a toast dismisses it, Esc on the region restores focus.
- Top layer: the viewport is a `popover="manual"` element shown with `showPopover()`. While a modal `<dialog>` is open (found with a `MutationObserver`) the layer is moved inside it (a modal dialog makes everything else inert) and re-shown; it moves back to `<body>` when the dialog closes. Without the Popover API: fixed container, huge z-index.
- SSR: renders nothing until mounted.

### Visual rules
- Width 356px (full width between the offsets on phones). Card: `--ui-surface-raised`, 1px `--ui-border`, `--radius-lg`, `--ui-shadow-lg`; padding 14px 16px; icon 20px in the status `-text` colour; title 14px/500, description 13px muted.
- Rich colours: background 8% status colour over the surface, border 30%, text in `--ui-<status>-text`.
- Buttons: 28px, action = `--ui-primary`, cancel = `--ui-secondary`. Close: 22px disc on the corner; hidden until hover/focus on `(hover: hover) and (pointer: fine)`.

### Motion
- Entrance `ui-toast-in` 380ms `--ui-ease-out`: from the docked edge (up to 56px), scale .96, 2px blur. Stack transform/height on `--ui-spring-smooth`. Exit faster (160ms, `--ui-ease-in`). Icon pops (`ui-pop-in`) and content cross-fades when the type changes.

### Accessibility
- Region named "Notifications", `aria-live="polite"`, `aria-relevant="additions text"`. Error / `important` toasts: `role="alert"`, `aria-live="assertive"`.
- Never the only copy of important information; timers pause so toasts are readable.

### Acceptance checks
- Stack collapses to scaled layers and expands on hover with real heights; no layout jump.
- A promise toast stays one element and morphs loading to success or error.
- Swipe past the threshold dismisses; a short swipe springs back; works with touch.
- Toasts are visible and interactive above an open modal dialog.
- Timers pause on hover; Alt+T focuses the region.
