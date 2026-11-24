## Component: Calendar

A month grid for picking one date, several dates or a range. Plain `Date` objects at local midnight; date maths lives in exported helpers (`date-utils.ts`) so a date picker can reuse it inside a popover.

### Anatomy
```
<Calendar>                         div.ui-calendar (data-mode)
  div.ui-calendar-months           flex, wraps, gap 20px / 32px
    div.ui-calendar-month          one per numberOfMonths
      div.ui-calendar-caption      prev button (first month) · title · next button (last month)
        button.ui-calendar-nav     32px square, chevron icon, aria-label "Previous month" / "Next month"
        div.ui-calendar-title      "November 2026", aria-live="polite"
      table.ui-calendar-grid       role="grid", aria-labelledby = title id
        thead th.ui-calendar-weekday  (scope=col, abbr = full weekday)
        tbody tr td.ui-calendar-cell (role=gridcell, aria-selected) > button.ui-calendar-day
```
Always 6 week rows so the height never jumps.

### Props
- `mode`: `single` (default) | `multiple` | `range`. `value` / `defaultValue` / `onValueChange` — `Date | null`, `Date[]`, `{ from: Date | null; to: Date | null }`.
- `month` / `defaultMonth` / `onMonthChange`, `numberOfMonths` (1), `weekStartsOn` (1 = Monday), `locale` (`en-US`), `min`, `max`, `disabled` (`Date[]` or `(d) => boolean`), `showOutsideDays` (true; single month only), `today`, `previousLabel`, `nextLabel`.
- Helpers exported: `startOfDay addDays addMonths addYears startOfMonth endOfMonth startOfWeek endOfWeek isSameDay isSameMonth isBefore isAfter isBetween compareDays clampDate getMonthWeeks getWeekdayLabels dateKey monthKey parseDateKey matchesDate formatMonthYear formatFullDate`, and `nextRange toggleDate orderDates`.

### Behaviour
- Weekday names and month title come from `Intl.DateTimeFormat(locale)`.
- `single`: a click selects (stays selected). `multiple`: click toggles. `range`: 1st click = start, 2nd = end (either direction, ordered), 3rd starts over.
- Range preview: while only the start is set, hovering a day (mouse) or moving keyboard focus shows the band to that day in a lighter tint; the preview end gets a 1px ring.
- Disabled dates (`min`/`max`/`disabled`) get `aria-disabled` and stay focusable; they cannot be selected. Prev/next use `aria-disabled` at the min/max month edge.
- Outside days are muted buttons; clicking one selects it and turns to that month. With `numberOfMonths > 1` they are hidden.
- Month change: grid and title are remounted with a slide + fade; no animation on first render.
- One tab stop (roving tabindex): selected day, else today, else the 1st of the month.

### Visual rules
- Cell 36px (44px on `pointer: coarse`); day button fills the cell, radius `--radius-md`; 14px, tabular numbers. Weekday row 12px/500 `--ui-muted-foreground`. Title 14px/600.
- Selected: `--ui-primary` fill, `--ui-primary-foreground` text. Today: 1px inset `--ui-border-strong` outline + weight 600 (no fill). Outside: muted. Disabled: muted, opacity .45, line-through.
- Range band: on the cell (td) so it is continuous: `color-mix(in oklch, var(--ui-primary) 12%, transparent)`; start/end cells carry a half band (gradient) behind the selected cap; band edges round at week boundaries. Preview band 7%.
- Hover (fine pointer only): `--ui-accent`. Focus: ring `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)`.

### Motion
- Month change: `ui-cal-in-next|prev` 220ms `--ui-ease-out`, translateX(±10px) + opacity 0 → 1. Press scales to .94 on `--ui-spring-snappy`. Reduced motion: no slide.

### Accessibility
- WAI-ARIA date grid. Each day button `aria-label` = full date (`dateStyle: full`), today `aria-current="date"`, selected td `aria-selected="true"`.
- Keys: arrows ±1 day / ±1 week; Home/End first/last day of the week; PageUp/PageDown ±1 month (day clamped); Shift+PageUp/PageDown ±1 year; Enter/Space select. Moving past a visible month changes month and keeps focus.

### Acceptance checks
- Arrow keys cross month edges and focus follows; Page keys change month and year.
- Range shows a continuous tinted band with capped ends and a hover preview; min/max/disabled days cannot be selected.
- Two months sit side by side on desktop and stack on a 390px screen without horizontal scroll.
- No axe violations in light and dark.
