## Component: Dialog

A modal surface for decisions that need attention, built on the native `<dialog>` element (`showModal()`): the browser provides the top layer, focus containment and an inert page.

### Anatomy
```
<Dialog>                      context: open state, ids
  <DialogTrigger />           button with aria-haspopup="dialog", aria-expanded
  <DialogContent>             <dialog class="ui-dialog"> fills the viewport + overlay
    (close ×)                 .ui-dialog-close, top-right, aria-label="Close"
    <DialogHeader>            .ui-dialog-header
      <DialogTitle />         <h2 class="ui-dialog-title">  → aria-labelledby
      <DialogDescription />   <p class="ui-dialog-description"> → aria-describedby
    <DialogBody />            .ui-dialog-body
    <DialogFooter />          .ui-dialog-footer (column-reverse on phones, row end ≥ 640px)
      <DialogClose />
```
The visible card is `.ui-dialog-panel` inside the `<dialog>`.

### Props
- `Dialog`: `open`, `defaultOpen`, `onOpenChange` (controlled or uncontrolled).
- `DialogContent`: `size` (`sm` 384 · `md` 512 default · `lg` 672 · `xl` 896 · `full`), `dismissible` (Esc + backdrop close, default true), `showClose` (default true), `centered` (keep centred on phones), `panelClassName`, `role` (`dialog` | `alertdialog`).
- `DialogTrigger` / `DialogClose`: buttons; `asChild` to use your own `<Button>`.

### Behaviour
- Opening calls `showModal()`, locks page scroll (keeping the scrollbar gap), and focuses the first `[autofocus]` element, otherwise the panel itself.
- Esc (`cancel` event) is intercepted so closing always animates; it is ignored when `dismissible={false}`.
- A click that starts **and** ends on the overlay (the `<dialog>` itself, not the panel) closes it.
- Closing sets `data-state="closed"`, waits for the exit animations to finish, then unmounts; focus returns to the element that opened it.
- `aria-labelledby` / `aria-describedby` are only set when a title / description is rendered.

### Visual rules
- Overlay: `--ui-overlay` with `backdrop-filter: blur(4px)`; padding 16px.
- Panel: `--ui-surface-raised`, 1px `--ui-border`, `--radius-xl`, padding 24px, gap 16px, `--ui-shadow-lg`.
- Title 17px/600, tracking −0.01em; description 14px muted.
- Phones (< 640px): docks to the bottom edge with 8px padding unless `centered`.

### Motion
- Open: overlay `ui-fade-in` 220ms; panel `ui-pop-in` 380ms `--ui-ease-out` from 8px below (24px on phones), scale .96, blur 2px.
- Close: overlay `ui-fade-out` and panel `ui-pop-out` 160ms `--ui-ease-in`; pointer events off while closing.

### Accessibility
- WAI-ARIA dialog (modal) pattern. `role="alertdialog"` for confirmations, usually with `dismissible={false}`.
- Tab stays inside the dialog (native). Esc closes when dismissible.

### Acceptance checks
- Opens with the soft rise, closes with a quick fade, never jumps.
- Esc and backdrop close it (unless `dismissible={false}`); a drag that starts inside the panel and ends outside does not.
- Focus moves in on open and returns to the trigger on close.
- Page behind does not scroll while open.
