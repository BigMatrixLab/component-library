## Component: Multi-select

Pick several values. Chips in the field, a search input, and a listbox of checkbox options that stays open while picking. WAI-ARIA combobox with `aria-multiselectable` listbox. Reuses `components/select/listbox.tsx`.

### Anatomy
```
<MultiSelect>                        context: values[], max, text, query, open, registry; hidden <input name> per value
  <MultiSelectInput>                 <InputGroup class="ui-multi-select-control">
    .ui-multi-select-chips
      .ui-multi-select-chip × n      label + remove button (aria-label "Remove <name>")
      .ui-multi-select-chip.ui-multi-select-more   "+n more"
      <input role="combobox" class="ui-multi-select-input">
    chevron button (.ui-input-action)
  <MultiSelectContent>               .ui-floating.ui-listbox anchored to the field
    .ui-multi-select-status          "n selected" (role=status) [of max] + "Clear all" button (outside the listbox)
    <div role="listbox" aria-multiselectable>
      <MultiSelectItem value />      .ui-option with .ui-option-box checkbox on the left
      <MultiSelectGroup> <MultiSelectEmpty> <MultiSelectLabel> <MultiSelectSeparator>
```

### Props
- `MultiSelect`: `value` / `defaultValue` (`string[]`), `onValueChange`, `max`, `open`, `defaultOpen`, `onOpenChange`, `name`, `form`, `disabled`.
- `MultiSelectInput`: `size`, `maxChips` (default 3), `placeholder`, `groupClassName`, input props.
- `MultiSelectItem`: `value`, `disabled`, `textValue`.

### Behaviour
- Choosing an option toggles it, clears the search text, keeps the list open and focus in the input.
- Values keep the order they were picked. Chips show up to `maxChips`; the rest collapse into a non-removable "+n more" pill.
- Backspace in an empty input removes the last value (including collapsed ones). A chip's x removes it; the input keeps focus.
- With `max`: once reached, unselected options become `aria-disabled` and are skipped by the keyboard; the status reads "n selected of max".
- Typing filters like Combobox (case and diacritic-insensitive, match highlighted, first match highlighted). Esc closes (and clears text); Esc closed clears text.
- Enter toggles the highlighted option and never submits the form while open. ArrowDown / ArrowUp open then move.
- "Clear all" empties the selection. The placeholder shows only while nothing is selected.
- `name` renders one `<input type="hidden" name value>` per value.

### Visual rules
- Field: `InputGroup` surface; min-height = control height (32/36/44) and grows as chips wrap; padding 4px; chips 24px tall, `--radius-sm`, `--ui-secondary` fill, 14px text, 12px x icon in an 18px hit area.
- Focus-within or open: border `--ui-ring` and 3px ring at 25%. Invalid: `--ui-destructive`.
- Checkbox: 16px, 4px radius, 1px `--ui-border-strong`; selected fills `--ui-control-on` with a `--ui-control-glyph` check.
- Status row: 12px muted, bottom border, padding 8px 12px; "Clear all" is a 12px/500 text button.

### Motion
- Chips `ui-pop-in` 150ms; list `ui-pop-in` / `ui-pop-out` 150 / 160ms; checkbox colour 150ms. Reduced motion keeps state changes.

### Accessibility
- Input `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`; listbox `aria-multiselectable`; options `aria-selected`.
- Chip remove buttons are labelled and outside the tab order (Backspace is the keyboard path).

### Acceptance checks
- Selecting three people shows three chips; a fourth with `maxChips=3` shows "+1 more".
- Backspace removes the last value; max disables the rest; Clear all works.
- Hidden inputs match the values; Field label focuses the input.
- axe clean in light and dark.
