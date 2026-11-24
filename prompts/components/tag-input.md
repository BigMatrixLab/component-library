## Component: TagInput

A field that turns text into removable chips. Looks like the Input; value is `string[]`.

### Anatomy
```
<div class="ui-tag-input [ui-tag-input-sm|lg]" data-disabled data-readonly>
  <span class="ui-badge ui-badge-secondary ui-tag" data-tag-value="design" data-highlighted data-shake>
    <span class="ui-tag-label">design</span>
    <button type="button" tabindex="-1" class="ui-badge-remove" aria-label="Remove design">× icon</button>
  </span>
  <input type="text" class="ui-tag-input-field">                      role="combobox" when suggestions exist
  <div class="ui-floating ui-tag-listbox" popover="manual" role="listbox" data-state>   FloatingContent, matchWidth, bottom-start
    <div class="ui-tag-option" role="option" aria-selected data-highlighted>…</div>
  </div>
  <input type="hidden" name>                                          joined by `separator`
  <span class="ui-tag-input-status" role="status" aria-live="polite">  visually hidden messages
</div>
```
Chips are the secondary `Badge` (size = the field size) with `BadgeRemove`.

### Props
- `value` / `defaultValue` (`string[]`), `onValueChange(tags)` via `useControllableState`.
- `maxTags`, `validate(tag, tags) → true | false | message`, `onTagRejected(tag, reason, message?)` (`duplicate | max | invalid`), `suggestions`, `delimiters` (default `[","]`), `allowDuplicates`, `caseSensitive` (both false), `addOnBlur` (true), `name`, `separator` (","), `size` `sm|md|lg`, `removeLabel(tag)`, `groupClassName`. Native input props go to the text input; `ref` is the text input. Inside a Field: `useFieldControl` on the text input.
- Pure helpers (`tag-utils.ts`): `splitTags`, `addTags`, `sameTag`.

### Behaviour
- Enter, Tab (without Shift) or a typed delimiter adds the trimmed text (Enter/Tab only when there is text; with suggestions open and one highlighted, that suggestion is added). A delimiter typed or inserted anywhere in the text commits everything before it and keeps the remainder (works with mobile keyboards). Tab and Enter `preventDefault` only when they added or tried to add.
- Paste containing a comma, a delimiter or a line break is split (`splitTags`) and added at once.
- Rejections: a duplicate (case-insensitive unless `caseSensitive`) shakes the existing chip (`data-shake`, 360ms, restartable) and keeps the typed text; `max` and `validate` refusals keep the text too. Each refusal calls `onTagRejected` and puts a message in the live region ("ada is already added", "Limit of 5 tags reached", or the validate message).
- Backspace on empty text: first press sets `data-highlighted` on the last chip, second removes it. Any other key, typing or blur clears the highlight.
- The × removes that chip and returns focus to the text input. Clicking empty space in the box focuses the input. Blur adds leftover text when `addOnBlur`.
- Suggestions: up to 8, filtered by text, hiding tags already added. Open on typing or ArrowDown (highlights the first); ArrowUp/Down wrap; Escape closes (and stops propagation so a surrounding dialog stays open); the list `mousedown` is `preventDefault` so the input keeps focus; pointer move highlights; click picks.
- `readOnly` hides the × buttons; `disabled` dims the box and blocks input.

### Visual rules
- Box: same border (`--ui-border-strong`), background, radius, shadow, hover and focus ring as `.ui-input`, drawn on the box with `:focus-within`; invalid via `:has(.ui-tag-input-field[aria-invalid="true"])` → `--ui-destructive`. Min height `--ui-input-h` (32 / 36 / 44px); padding-block `(h − 2px − chip height) / 2`; gap 4px; wraps.
- Chip height 20 / 24 / 28px. A chip's label truncates with an ellipsis. Highlighted chip: `--ui-accent` bg + 2px ring at 60%.
- Text field: borderless, transparent, flex `1 1 6rem`, min width 6rem, height = chip height; placeholder only while there are no chips.
- Listbox: `--ui-surface-raised`, 1px `--ui-border`, radius lg, `--ui-shadow-lg`, padding 4px, max height 14rem. Option: padding 6px 10px, radius sm, highlighted `--ui-accent`.
- Touch: 16px text.

### Motion
- New chip `ui-pop-in` (220ms, `--ui-ease-out`); shake: translateX −4, 4, −3, 2, 0 with a destructive ring fading out over 360ms. Listbox `ui-pop-in` / `ui-pop-out`. Reduced motion keeps messages, drops movement.

### Accessibility
- Native text input in the box; chip × buttons labelled "Remove {tag}" and out of the tab order (Backspace is the keyboard path). Live region announces added / removed / refused.
- Suggestions: `role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (only while open), `aria-activedescendant`.

### Acceptance checks
- Enter, comma and Tab each add a chip; a pasted "a@x.com, b@x.com" adds two.
- Adding an existing tag adds nothing and the chip gets `data-shake`.
- With `maxTags`, further tags are refused.
- Backspace twice removes the last chip; × removes the clicked chip.
- The hidden input holds the joined value.
- With suggestions: typing filters, ArrowDown + Enter adds, Escape closes.
- Single row height 32 / 36 / 44px. No axe violations in light and dark.
