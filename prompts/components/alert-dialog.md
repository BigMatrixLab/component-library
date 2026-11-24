## Pattern: Alert dialog

Not a component. An alert dialog is **Dialog + Button** configured for confirmations: use the existing `Dialog` family with `role="alertdialog"`, `dismissible={false}` and `showClose={false}`, and `Button` in the footer. No new component code is written.

### Anatomy
```
<Dialog>                                      (controlled when the confirm action is async)
  <DialogTrigger asChild><Button …/></DialogTrigger>
  <DialogContent role="alertdialog" size="sm" dismissible={false} showClose={false}>
    <DialogHeader>
      <DialogTitle />            the question, naming the thing: "Delete atlas-web?"
      <DialogDescription />      what is lost, whether it can be undone
    </DialogHeader>
    (<DialogBody /> optional: type-to-confirm field)
    (error line optional: <p role="alert" class="text-destructive-text">)
    <DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <Button variant="destructive">Action label</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Rules
- Esc and overlay clicks do nothing; the person must press a button.
- Title is a question about the specific object, never "Are you sure?". Buttons are labelled with the action, never Yes/No.
- The safe button (Cancel) comes first in DOM order; for the least reversible actions it takes `autoFocus`. The destructive button uses `variant="destructive"`.
- One destructive action per dialog.

### Patterns
1. **Destructive confirm** — two buttons. "Keep key" (outline, `autoFocus`) and "Revoke key" (destructive), both wrapped in `DialogClose asChild`.
2. **Type to confirm** — an `<input autoFocus>` in `DialogBody`; the destructive button is `disabled` until the value equals the project name exactly. Clear the value in `onOpenChange` when closing. Input: `autoComplete="off" autoCapitalize="off" spellCheck={false}`.
3. **Async confirm** — controlled `open`. On confirm: `loading` on the destructive button, Cancel `disabled`, `onOpenChange` ignores close requests while pending. On failure keep the dialog open, show the message in `role="alert"` and relabel the button "Try again". On success close the dialog and update the page.

### Accessibility
- WAI-ARIA alert dialog pattern: `role="alertdialog"`, labelled by the title, described by the description. Page behind inert, focus contained, focus returns to the trigger.

### Acceptance checks
- Esc and overlay click leave it open; Cancel closes it.
- Type-to-confirm: button disabled until the text matches; field empty when reopened.
- Async: spinner on the confirm button while pending, dialog cannot be closed, error shown then retry succeeds.
