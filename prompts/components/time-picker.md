## Component: TimePicker

A segmented time field that behaves like a native `<input type="time">` (hour, minute, optional seconds, AM/PM), with an optional popover list of times at a fixed step. The value is a 24-hour string `"HH:mm"` (`"HH:mm:ss"` with seconds), or `null` while any segment is empty.

### Anatomy
```
<TimePicker>                      <div class="ui-picker-field ui-timepicker" role="group">
  <svg.ui-picker-icon>            clock; shown only when there is no list
  .ui-timepicker-segments
    <input.ui-timepicker-segment role="spinbutton" data-segment="hour">      "09"
    <span.ui-timepicker-sep>:</span>
    <input … data-segment="minute">
    <input … data-segment="second">                                        only with `seconds`
    <input … data-segment="period">                                        AM / PM, only on a 12-hour clock
  <button.ui-input-action>        clear (x), while anything is filled in
  <button.ui-input-action>        clock, opens the list; only with `step`
  <input type="hidden">           name → "HH:mm"
  <PickerPanel.ui-timepicker-panel>   popover="manual", role="dialog"
    <div.ui-timepicker-list role="listbox"> <div.ui-timepicker-option role="option" aria-selected>
```

### Props
- `value` / `defaultValue` (`string | null`), `onValueChange(string | null)`.
- `locale` (default `en-US`) decides 12 or 24 hours and the AM/PM words; `hour12` forces one; `seconds` adds a seconds segment.
- `step` (minutes): adds the popover list; `min` / `max` (`"HH:mm"`) limit the list and flag a value outside them as invalid. `open` / `defaultOpen` / `onOpenChange`.
- `clearable` (default true), `disabled`, `required`, `name`, `id` (on the hour segment, which the `<Label>` targets), `size` (`sm` 32 · `md` 36 · `lg` 44), `labels` (`hour`, `minute`, `second`, `period`, `clear`, `open`, `list`).
- Inside a `<Field>` it picks up the id, `aria-describedby`, invalid, required and disabled state.

### Behaviour
- Focus selects a segment. Arrow Up / Down step it with wrap-around (hours do not change AM/PM); an empty segment starts at its minimum going up and its maximum going down. Home / End jump to the minimum / maximum. Arrow Left / Right move between segments.
- Digits fill the segment and move on automatically: the first digit waits for a second only when one could follow (24-hour hour: 0–2 wait, 3–9 complete as 03–09; 12-hour hour: 0–1 wait; minutes and seconds: 0–5 wait). A second digit that would overshoot starts a new number ("2" then "5" in 24-hour gives 05). On a 12-hour clock "00" becomes 12.
- On the AM/PM segment, `a` and `p` (or the first letter of the locale's words) choose; Up / Down toggle.
- Backspace or Delete empties the segment; Backspace on an empty one moves to the previous. `:` `.` `,` `-` `/` and Space move to the next segment.
- The value is emitted as soon as every shown segment is filled, and as `null` when one is cleared afterwards. A value set from outside replaces the segments.
- Soft keyboards that send no key codes are handled from the input event (the last typed character counts).
- List (`step`): the clock button opens a listbox of times at that step, counting from midnight (15 → :00 :15 :30 :45). Focus moves to the selected time, or to the last step before the current value (marked `data-current`), scrolled to the middle of the list. Arrow keys / Home / End move, Enter / Space or a click picks, which fills the segments, closes the list and returns focus to the clock button. Alt + Arrow Down in a segment opens the list.
- Esc and an outside click close the list without a change; tabbing out closes it.

### Visual rules
- The field matches Input and DatePicker (1px `--ui-border-strong`, `--radius-md`, tinted background in dark, hover and ring as Input); the ring shows while any segment has focus.
- Segments: `tabular-nums`, centred, `2ch + 8px` wide, height field − 12px, `--radius-sm`; empty ones show a muted "––". The focused segment fills with `--ui-accent`. Separators are muted.
- List panel: shared picker panel chrome, min width 136px, list max height 240px, 4px padding, options 32px tall (44px on touch), `--radius-md`; hover and current use `--ui-accent`; selected uses `--ui-primary` with `--ui-primary-foreground`.

### Motion
- Panel enters with `ui-pop-in` and leaves with `ui-pop-out` like every popover; segment highlight changes in `--ui-duration-fast`. No scale on the list button (it opens a popup). Reduced motion: the panel only fades.

### Accessibility
- The field is a `role="group"` (give it `aria-label`); each segment is a `role="spinbutton"` with `aria-label` ("Hour", "Minute", "Second", "AM or PM"), `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext` ("Empty" while blank).
- The list button has `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`; the list is a `listbox` of `option`s with `aria-selected`.
- Keyboard: see Behaviour; every action works without a pointer.

### Acceptance checks
- Typing `0` `9` `3` `0` `p` in an en-US field gives "09:30 PM" and value `21:30`.
- Arrow Up on the hour of 12 AM shows 01; Arrow Down on minute 00 shows 59; the value updates each time.
- Backspace clears one segment and the value becomes `null`.
- With `step={15}` the list holds 96 times, opens on the current one scrolled into view, and picking one fills the field and closes the list.
- `locale="de-DE"` shows no AM/PM segment and hours 00–23.
- The hidden input holds `HH:mm`; a disabled picker submits nothing.
- 390px wide: nothing overflows; touch targets in the list are 44px.
