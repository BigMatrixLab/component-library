## Component: DatePicker and DateRangePicker

An input-like field that opens our `Calendar` in a popover. `DatePicker` picks one day; `DateRangePicker` picks a start and an end with presets. Both reuse `Calendar` and its date helpers (`startOfDay`, `addDays`, `dateKey`, `DateRange`…): plain `Date` objects at local midnight, no date library. Dates are formatted with `Intl.DateTimeFormat`.

### Anatomy
```
<DatePicker>                  <div class="ui-picker-field ui-datepicker"> looks like an Input; sizes sm 32 · md 36 · lg 44
  <button.ui-picker-trigger>  calendar icon + .ui-picker-value (formatted date, or the placeholder)
    -- or, with `typeable` --
  <input.ui-picker-input>     text, parsed on Enter / blur
  <button.ui-input-action>    clear (x), only while there is a value; with `typeable` also the calendar button
  <input type="hidden">       name → ISO yyyy-mm-dd
  <PickerPanel>               popover="manual", role="dialog", class ui-picker-panel
    <Calendar mode="single">

<DateRangePicker>             same field; trigger shows "Nov 3 – Nov 24, 2026"
  <PickerPanel.ui-daterange-panel>
    .ui-daterange
      .ui-daterange-presets   role="group", buttons .ui-daterange-preset[aria-pressed]
      .ui-daterange-main      <Calendar mode="range" numberOfMonths 2 | 1> + optional .ui-daterange-footer
  <input type="hidden">       startName / endName → ISO yyyy-mm-dd
```

### Props
- `DatePicker`: `value` / `defaultValue` (`Date | null`), `onValueChange(Date | null)`, `open` / `defaultOpen` / `onOpenChange`, `locale` (default `en-US`), `format` (Intl.DateTimeFormat options, default `{ month: 'short', day: 'numeric', year: 'numeric' }`), `placeholder` (default "Pick a date"), `clearable` (default true), `typeable`, `min`, `max`, `disabledDates` (list or predicate), `disabled`, `required`, `name`, `id`, `size`, `today`, `clearLabel`, `openLabel`, `panelLabel`, `calendarProps` (`weekStartsOn`, `previousLabel`, `nextLabel`, `showOutsideDays`, `numberOfMonths`). Native div props go to the field.
- `DateRangePicker`: `value` / `defaultValue` (`{ from: Date | null, to: Date | null }`), `onValueChange(range)`, `presets` (`DateRangePreset[] | false`; default Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, This year), `confirm` (Apply / Cancel footer), `startName`, `endName`, plus the same `locale`, `format`, `placeholder` ("Pick a date range"), `clearable`, `min`, `max`, `disabledDates`, `disabled`, `required`, `id`, `size`, `today`, labels, `calendarProps`.
- `DateRangePreset`: `{ label: string; range: (today: Date) => { from: Date; to: Date } }`.
- Inside a `<Field>` both pick up the id (the `<Label>` targets the trigger or the text input), `aria-describedby`, invalid, required and disabled state.

### Behaviour
- DatePicker: clicking the field (or ArrowDown on it) opens the popover and moves focus to the selected day (else today). Picking a day sets the value, closes the popover and returns focus to the field. Esc and an outside click close it without a change; tabbing out closes it. Clicking the clear button empties the value and keeps focus on the field.
- `typeable`: the text is parsed on Enter and on blur. Accepted: ISO (`2026-11-24`), numeric in the locale's day/month order (`11/24/2026`, `24.11.2026`, two-digit years mean 20xx), month names (`Nov 24`, `24 November 2026`, year optional). A parse that fails, or a date outside `min`/`max`/`disabledDates`, sets `aria-invalid` and keeps the text. An empty field clears the value. Esc with the popover closed reverts the text. ArrowDown opens the popover.
- DateRangePicker: the first pick starts a range, the second completes it (either order); the range commits and the popover closes on the second pick. With `confirm`, nothing commits until Apply; Cancel, Esc and an outside click discard the draft. Presets set the whole range at once (committing unless `confirm`) and jump the calendar to its start; a preset entirely outside `min`/`max` is disabled, others are clamped to them. The preset matching the current range has `aria-pressed="true"`. Apply stays disabled until both dates are picked.
- Two months show side by side from 640px, one month below. On phones the presets become a horizontally scrolling row above the calendar.
- Hidden inputs are disabled with the control, so a disabled picker submits nothing.

### Visual rules
- The field matches Input: 1px `--ui-border-strong`, `--radius-md`, `--ui-background` (5% foreground tint in dark), `--ui-shadow-xs`; hover darkens the border; open or keyboard-focused shows `--ui-ring` border and a 3px ring; invalid uses `--ui-destructive`; disabled 50% opacity.
- Calendar icon 16px `--ui-muted-foreground`; placeholder `--ui-muted-foreground`; value `tabular-nums`, single line with ellipsis.
- Panel: `--ui-surface-raised`, 1px `--ui-border`, `--radius-lg`, `--ui-shadow-lg`, no padding of its own (the Calendar pads), `width: max-content`, `max-width: calc(100vw - 1rem)`; opens 6px below the field, left-aligned, flips when there is no room.
- Presets column 152px min, 12px padding, 1px divider; presets 32px tall (44px on touch), `--radius-md`, hover and pressed use `--ui-accent`.
- Footer: top 1px `--ui-border`, 12px padding; the summary is 13px, muted until complete; Cancel is a ghost small Button, Apply a primary small Button.
- Below 360px the day cells shrink to `(100vw − 56px) / 7` so seven columns always fit.

### Motion
- Panel enters with `ui-pop-in` (220ms, `--ui-ease-out`, 4px rise from the field, scale .96, 2px blur) and leaves with `ui-pop-out` (160ms, `--ui-ease-in`).
- Field border and ring change in `--ui-duration-fast`; the trigger itself does not scale (it opens a popup).
- Reduced motion: the panel only fades.

### Accessibility
- The trigger is a `<button aria-haspopup="dialog" aria-expanded aria-controls>`; its visible value is referenced by `aria-describedby`, so a screen reader hears "Due date, button, Nov 24, 2026".
- The panel is a non-modal `role="dialog"` with `aria-label`; the Calendar inside follows the APG date-grid pattern (see Calendar).
- Typed input is a plain text input with `aria-invalid`.
- Clear and calendar buttons have `aria-label`s.

### Acceptance checks
- Click opens the panel under the field with focus on a day; Esc closes it and focus returns to the field.
- Picking a day shows it formatted in the field, writes `yyyy-mm-dd` to the hidden input and closes the panel.
- Typing `11/24/2026` then Enter selects Nov 24, 2026; typing `31/02/2026` sets `aria-invalid="true"`.
- Days outside `min`/`max` cannot be picked or typed.
- Range: two clicks produce "Nov 3 – Nov 24, 2026" and two hidden values; presets fill it in one click; with `confirm` Cancel changes nothing.
- 390px wide: one month, presets scroll sideways, nothing overflows the viewport.
- Works inside a `<Field>`: the label focuses the control; an error sets the invalid border.
