## Component: Select

A styled single choice. The trigger looks like an `Input`; options open in a floating listbox in the top layer. WAI-ARIA select-only combobox: DOM focus stays on the trigger, the highlight is `aria-activedescendant`.

### Anatomy
```
<Select>                         context: value, open, registry, active option; hidden <input name> for forms
  <SelectTrigger>                <button role="combobox" class="ui-select-trigger">
    <SelectValue />              .ui-select-value (label of the selected option, or the placeholder)
    chevrons-up-down icon        .ui-select-icon
  <SelectContent>                .ui-floating.ui-listbox (popover="manual")
    <div role="listbox">         .ui-listbox-scroll (the scroller)
      <SelectGroup label>        role="group", .ui-listbox-group
        <SelectLabel />          .ui-listbox-label
        <SelectItem value />     .ui-option role="option" (+ .ui-option-check on the right)
      <SelectSeparator />        .ui-listbox-separator (decorative)
```
Shared listbox logic lives in `components/select/listbox.tsx` (Combobox and Multi-select import it).

### Props
- `Select`: `value`, `defaultValue` (`''` = none), `onValueChange`, `open`, `defaultOpen`, `onOpenChange`, `name`, `form`, `disabled`.
- `SelectTrigger`: `size` (`sm` 32 · `md` 36 · `lg` 44), `placeholder`, native button props. Inside a `Field` it takes the id, `aria-describedby`, `aria-invalid`, `aria-required` and disabled state from `useFieldControl`.
- `SelectItem`: `value` (unique, non-empty), `disabled`, `textValue`.
- `SelectGroup`: `label`.

### Behaviour
- Click opens the list (selected option highlighted); clicking again, Esc, Tab, blur or an outside press closes it. Focus stays on the trigger, also in Safari and Firefox (focus is set explicitly).
- Keyboard closed: Enter, Space, ArrowDown open on the selected option (else the first); ArrowUp opens on the selected (else the last); Home / End open on the first / last; a printable character opens and jumps to the first option starting with it.
- Keyboard open: ArrowDown / ArrowUp move (no wrap), Home / End, PageUp / PageDown (10), typeahead (500ms buffer, same letter repeated cycles), Enter or Space chooses and closes, Esc closes without change.
- Disabled options are skipped by the keyboard and ignore pointer input.
- The highlight follows the pointer (not touch). Keyboard movement scrolls the list, never the page.
- Pressing inside the list never moves focus (mousedown is prevented).
- While closed the options render in a hidden node so the trigger can show the selected label.
- `name` renders `<input type="hidden" name value>`.

### Visual rules
- Trigger: same surface as `.ui-input` (border `--ui-border-strong`, `--radius-md`, `--ui-shadow-xs`, dark tint), height 32/36/44, padding-inline 10/12/16px, hover darkens the border (fine pointer only), focus-visible or open: border `--ui-ring` and a 3px ring at 25%. Invalid: `--ui-destructive` border. Disabled: opacity .5.
- Value text 14px, ellipsis; placeholder `--ui-muted-foreground`; chevrons icon 16px muted.
- Panel: `--ui-surface-raised`, 1px `--ui-border`, `--radius-lg`, padding 4px, `--ui-shadow-lg`, max-height `min(20rem, 100dvh - 1rem)`, min-width = trigger width, 6px below the trigger (flips above when there is no room).
- Option: min-height 32px, padding 4px 8px, `--radius-md`; highlighted `--ui-accent`; selected shows a 16px check on the right; disabled opacity .5.
- Group label 12px/500 muted; separator 1px `--ui-border`, full width.

### Motion
- Open `ui-pop-in` 150ms `--ui-ease-out`, from 4px toward the trigger, scale .96, blur 2px. Close `ui-pop-out` 160ms `--ui-ease-in`, pointer events off.
- Check mark: opacity 150ms and scale .8 → 1 on `--ui-spring-snappy`.

### Accessibility
- Trigger: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (while open), `aria-activedescendant`, named by the Field label or `aria-label`.
- List: `role="listbox"` named by the trigger; options `role="option"` + `aria-selected`; disabled `aria-disabled`.

### Acceptance checks
- Opens below the trigger at least as wide as it; selected option highlighted and visible.
- Every key above works; focus never leaves the trigger; Esc keeps the value.
- Value shows its label before first open (`defaultValue`) and after choosing.
- Hidden input carries the value; the Field label focuses the trigger.
- axe clean in light and dark.
