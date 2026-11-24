## Component: Combobox

An input that filters a list as you type and picks one value. WAI-ARIA combobox with list autocomplete: focus stays in the input; the highlighted option is `aria-activedescendant`. Reuses the Select listbox (`components/select/listbox.tsx`).

### Anatomy
```
<Combobox>                         context: value, inputValue, query, open, registry; hidden <input name>
  <ComboboxInput>                  <InputGroup> + <Input role="combobox"> + clear (x) + chevron buttons
  <ComboboxContent>                .ui-floating.ui-listbox anchored to the input group
    <ComboboxGroup label>          role="group"; hides itself when none of its options match
    <ComboboxItem value />         .ui-option; text children get the matching part in <mark class="ui-option-mark">
    <ComboboxCreate onCreate />    "Create “text”" row (.ui-combobox-create) when no exact match
    <ComboboxEmpty />              .ui-listbox-empty, only while no option is rendered
    <ComboboxLabel /> <ComboboxSeparator />
```

### Props
- `Combobox`: `value`, `defaultValue`, `onValueChange`, `inputValue`, `defaultInputValue`, `onInputValueChange`, `open`, `defaultOpen`, `onOpenChange`, `name`, `form`, `disabled`.
- `ComboboxInput`: `size`, `clearable`, `showTrigger` (default true), `groupClassName`, input props.
- `ComboboxItem`: `value`, `disabled`, `textValue`. `ComboboxCreate`: `onCreate(text)`, children (node or `(text) => node`).

### Behaviour
- Typing sets `inputValue`, opens the list and filters: case and diacritic-insensitive substring on the option text. The first match is highlighted so Enter picks it.
- Filtering uses only what was typed since the list opened, so reopening a combobox that shows "Ireland" lists everything.
- Choosing sets `value`, puts the option text in the input, closes, keeps focus in the input.
- Emptying the input clears the value. Blur, outside press or Esc (open) closes and restores the selected label (or empty).
- Esc while closed clears input and value. `clearable` adds an x button.
- ArrowDown / ArrowUp open (on the selected option, else first / last) then move; PageUp / PageDown; Home / End stay caret keys. Enter chooses the highlighted option and never submits the form while open.
- `ComboboxCreate` appears when the trimmed query is non-empty and equals no option text; choosing it calls `onCreate(text)` and sets the value to the text.
- The chevron and clear buttons prevent mousedown (focus stays in the input) and are `tabindex=-1`.

### Visual rules
- Field: `InputGroup` (see Input spec); chevron 16px, turns 180° while open (`--ui-spring-snappy`).
- List, options, groups: as Select (no check mark on the right unless selected; selected shows the check).
- Match highlight: `<mark>` with 12% foreground tint, weight 500, no padding.
- Empty text 14px muted, centred, padding 12px 8px.

### Motion
- List: `ui-pop-in` 150ms / `ui-pop-out` 160ms. Reduced motion keeps state changes.

### Accessibility
- Input: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` while open, `aria-activedescendant`, named by the Field label.
- List named by the input. With no options the `listbox` role is dropped and the empty message shows.

### Acceptance checks
- "ire" filters to Ireland with the match highlighted; "turk" finds Türkiye.
- Arrow keys move the highlight without moving focus; Enter selects; Esc restores.
- Group headings vanish when their options are filtered out.
- Create row shows only for unmatched text and adds the option.
- axe clean in light and dark.
