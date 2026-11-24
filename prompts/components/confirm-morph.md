## Component: ConfirmMorph

A destructive button that morphs, in place, into an inline confirmation ("Delete 3 files? Cancel / Delete"), then a spinner, then a result with Undo. One box changes width, colour and content; nothing opens elsewhere.

### Anatomy
```
<div class="ui-confirm [ui-confirm-lg]" data-phase="idle|confirm|pending|done|error" tabindex="-1">
  <span class="ui-confirm-layer ui-confirm-leaving" inert aria-hidden>previous phase</span>   (mid-morph only)
  <span class="ui-confirm-layer ui-confirm-current" data-enter>
    idle:    <button class="ui-confirm-trigger">icon + label</button>
    confirm: <span class="ui-confirm-row" role="group">question · Cancel (ghost) · Delete (destructive)</span>
    pending: <span class="ui-confirm-row ui-confirm-status">spinner · pendingLabel</span>
    done:    <span class="ui-confirm-row">check · resultLabel · Undo (ghost, if onUndo)</span>
    error:   <span class="ui-confirm-row">cross · errorLabel · Cancel · Retry</span>
  </span>
  <span class="ui-confirm-live" role="status" aria-live="polite">announcement</span>
</div>
```
Inner buttons are `Button` with size `xs` (box `md`, 36px) or `md` (box `lg`, 44px): box border 1px + 3px padding + inner height = box height; inner radius `--radius-sm`.

### Props
- `label`, `question` (`ReactNode`), `icon`.
- `onConfirm: () => unknown | Promise<unknown>` — a rejection shows the error phase. `onUndo?` adds Undo to the result.
- `undoWindow` — ms the result stays before returning to idle, default **6000** (1600 with no `onUndo`; 0 keeps it).
- Copy: `confirmLabel` ("Delete"), `cancelLabel` ("Cancel"), `pendingLabel` ("Deleting…"), `resultLabel` ("Deleted"), `errorLabel` ("Couldn’t delete"), `undoLabel` ("Undo"), `retryLabel` ("Retry").
- `phase` / `defaultPhase` / `onPhaseChange` (controlled or uncontrolled, default `idle`), `size` `'md' | 'lg'`, `disabled`, plus `HTMLAttributes<HTMLDivElement>` and ref.

### Behaviour
- Click the trigger → `confirm`; Cancel / Esc → `idle`; Delete → `pending` → `done` (or `error`); Undo → `onUndo()` → `idle`; Retry runs `onConfirm` again.
- Surface per phase (semantic tokens only): idle `--ui-destructive` / `--ui-destructive-foreground`; confirm and done `--ui-surface-raised` + `--ui-border-strong` + `--ui-foreground`; pending `--ui-surface-muted` + `--ui-border` + `--ui-muted-foreground`; error `--ui-surface-raised` + `--ui-destructive` border + `--ui-destructive-text`. Check = `--ui-success-text`.
- Text 14px / 500 (15px in `lg`). Box radius `--radius-md` (`--radius-lg` in `lg`), `overflow: hidden`.
- **Focus**: only moves when focus was already inside. confirm → Cancel (safe default); pending → the box itself (`tabindex=-1`); done → Undo if present, else the box; error → Retry; back to idle → the trigger. Esc (confirm / error) calls `preventDefault` + `stopPropagation` so a parent dialog is not closed.
- The leaving layer is `inert`, so duplicated controls cannot be focused.

### Motion
- **Width**: `useMorphWidth` — Web Animations API from the on-screen width to the new natural width, `--ui-spring-morph`, 550ms, interruptible, never on first render.
- **Content**: entering layer `ui-action-label-in` 220ms `--ui-ease-out` (4px rise, 2px blur clears); leaving layer `ui-action-label-out` 160ms `--ui-ease-in`, absolutely positioned at the start edge.
- **Colour**: background, border and text transition 220ms `--ui-ease-standard`.
- Trigger press: `scale(.97)` on `--ui-spring-snappy`.
- **Reduced motion**: width and content swap instantly (1ms fade); colours still change.

### Accessibility
- Real buttons throughout; the confirm row is `role="group"` labelled by the question when it is a string.
- A polite live region announces the question, pending label, result or error.

### Acceptance checks
- Idle shows only the destructive button; clicking it shows "Delete 3 files?" with Cancel and Delete, Cancel focused.
- Esc returns to idle with focus on the trigger. Delete → spinner → "3 files deleted" with Undo; Undo returns to idle.
- A rejecting `onConfirm` shows the error with Retry.
- The box width differs between idle and confirm and settles within ~600ms.
