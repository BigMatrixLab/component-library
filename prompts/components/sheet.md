## Component: Sheet

A panel that slides in from an edge while the page stays visible behind it. Built on the native `<dialog>` element (`showModal()`) exactly like Dialog: top layer, focus containment and an inert page come from the browser.

### Anatomy
```
<Sheet>                       context: open state, ids
  <SheetTrigger />            button, aria-haspopup="dialog", aria-expanded
  <SheetContent>              <dialog class="ui-sheet" data-side data-state> fills the viewport
    (overlay)                 .ui-sheet::before — fades on its own
    .ui-sheet-panel           the sliding surface (mounted only after showModal())
      .ui-sheet-handle        bottom sheets only, aria-hidden, drag surface
      (close ×)               .ui-sheet-close, aria-label="Close"
      <SheetHeader>           .ui-sheet-header
        <SheetTitle />        <h2> → aria-labelledby
        <SheetDescription />  <p>  → aria-describedby
      <SheetBody />           .ui-sheet-body — flex 1, scrolls
      <SheetFooter />         .ui-sheet-footer — column-reverse on phones, row end ≥ 640px
      <SheetClose />
```

### Props
- `Sheet`: `open`, `defaultOpen`, `onOpenChange`.
- `SheetContent`: `side` (`right` default | `left` | `top` | `bottom`), `size` (`sm` 320 · `md` 400 · `lg` 520 · `xl` 640 · `full`; for top/bottom it is the max width: size + 224px), `dismissible` (default true), `showClose` (default true), `showHandle` (bottom, default true), `mobileFull` (left/right fill the width below 640px), `panelClassName`.
- `SheetTrigger` / `SheetClose`: buttons; `asChild`.

### Behaviour
- Same lifecycle as Dialog: `showModal()`, then mount the panel (so `autoFocus` works), scroll lock, focus to `[autofocus]` else the panel, focus returns to the trigger after the exit animation.
- Esc (`cancel`) is intercepted so closing animates; ignored when not dismissible. A press and release on the overlay (the `<dialog>` itself) closes.
- Bottom sheet drag (pointer events on `.ui-sheet-handle`, `touch-action: none`): the panel follows the pointer downward (never upward); `data-dragging` is set on the dialog and `--ui-sheet-progress` (0–1) fades the overlay. On release: dismiss when the offset exceeds 35% of the panel height or the release velocity (last 100ms) exceeds 0.6px/ms (and offset > 8px); the panel keeps its position so the exit animation continues from there. Otherwise it springs back on `--ui-spring-smooth`.

### Visual rules
- Overlay: `--ui-overlay` + `backdrop-filter: blur(4px)`, drawn by `::before`.
- Panel: `--ui-surface-raised`, `--ui-shadow-lg`, 1px `--ui-border` on the inner edge. Side sheets: full height, width `min(size, 100vw − 48px)`, square corners. Bottom: `--radius-xl` top corners, max height 90dvh, bottom padding for the safe area. Top: mirror.
- Header padding 20/56/16/24px, title 17px/600, description 14px muted. Body padding 4/24/16px, gap 16px. Footer padding 16/24px, 1px `--ui-border-subtle` top border.
- Handle: 40×5px pill `--ui-border-strong`, in a 10/6px padded drag surface.

### Motion
- Open: panel `ui-slide-in-<side>` for `--ui-spring-smooth-duration` (540ms) with `--ui-spring-smooth` (no overshoot); overlay `ui-fade-in` 380ms.
- Close: panel `ui-slide-out-<side>` 200ms `--ui-ease-in`, overlay fade 160ms; pointer events off.
- Reduced motion: state changes, no movement (global rule).

### Accessibility
- WAI-ARIA modal dialog pattern. Title/description ids only when rendered. Dragging is an enhancement; Esc and the close button always work.

### Acceptance checks
- Slides from the chosen edge without overshoot; overlay fades separately from the panel.
- Esc and overlay click close it; focus returns to the trigger; page does not scroll behind.
- Bottom sheet: small drag springs back, long drag or flick dismisses.
- Phones: `mobileFull` fills the width; otherwise a strip of overlay stays visible.
