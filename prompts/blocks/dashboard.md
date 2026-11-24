## Block: Dashboard

A product dashboard page built only from library components: KPIs, charts, a table and a feed in bordered cards. Calm and professional: neutral surfaces, one accent per chart, numbers that line up. Each variant is one self-contained file with its own deterministic sample data (no `Math.random`, so server and browser render the same numbers).

### Variants
- **Analytics overview** (`analytics`): page header with a 7 / 30 / 90 day `SegmentedControl` and an Export button; a shared `StatGroup` of four KPIs (revenue, orders, visitors, conversion) each with a `StatDelta` against the previous period and a `Sparkline`; an `AreaChart` of daily revenue vs the previous period; a horizontal `BarChart` of revenue by channel; a `DataTable` of recent orders (5 per page, no column menu); an activity `Timeline`. The range drives every number.
- **Sales and operations** (`sales`): region `SegmentedControl` (All, Americas, EMEA, APAC) that rescales every figure; a separate `StatGroup` with help text; a semicircle `RadialChart` for quota attainment with Closed / Commit / Best case under it; a `DonutChart` of ARR by plan; four `UsageMeter`s (one in warning, one destructive); a stacked `BarChart` of bookings by month; a rep leaderboard of `Avatar` + `Progress`.
- **Compact cards** (`compact`): four small KPI cards (16px padding, icon in `CardAction`, value + coloured delta text + area sparkline); an error-budget ring (`RadialChart`); busiest endpoints with `Progress` bars; latest deploys with status `Badge`s. No state and no function props, so it renders as a Server Component.

### Anatomy
```
div.@container.w-full
  div.grid.gap-4 (@2xl:gap-6)
    header row        flex wrap, items-end, justify-between: h2 (20px/600) + muted 14px context | controls
    StatGroup         KPIs, wraps by width (min 13rem per stat)
    chart row         grid → @4xl:grid-cols-3 (wide chart col-span-2)
    detail row        grid → @4xl:grid-cols-5 (table col-span-3, feed col-span-2)
      Card.min-w-0 > CardHeader (CardTitle, CardDescription, CardAction?) + CardContent
```

### Visual rules
- Cards: `Card` defaults (1px `--ui-border`, `--radius-xl`, 20px padding, no shadow). Compact variant: `[--ui-card-padding:1rem]`, gap 8–12px.
- Gaps: 16px, 24px from a 42rem container up.
- Colour: the series that matters is `series-1`; the previous period uses `var(--ui-muted-foreground)`; status colours only for status (badges, deltas, usage thresholds).
- Numbers: `tabular-nums`, formatted with `Intl.NumberFormat('en-US', …)` (currency without cents for totals, compact for large figures); dates with `Intl.DateTimeFormat` in UTC.
- Deltas always carry a comparison ("vs previous period", "vs Q3"); set `tone` when down is good.
- Chart heights: 260px main charts, 240px donut, 170px semicircle, 32–40px sparklines.

### Responsive
- Container queries (`@container` on the block root), never viewport breakpoints: the block sits next to a sidebar.
- Every grid child has `min-w-0` so tables and charts can shrink; `DataTable` scrolls sideways inside its card.
- No horizontal page overflow at 360px; header controls wrap under the title.

### Accessibility
- Page title is an `h2` (the app owns the `h1`); card titles are `h3`.
- Every `Sparkline` has an `aria-label` describing the series; charts render their own screen-reader table.
- `SegmentedControl` is a radio group with an `aria-label` ("Date range", "Region").
- Lists (reps, endpoints, deploys) are `ul` with an `aria-label`; each `Progress` names what it measures.

### Acceptance checks
- Changing the range / region updates KPIs, deltas, sparklines and charts together, with the charts' smooth transition.
- At 360px nothing overflows the page; at 1024px+ the chart row shows two cards side by side.
- Light and dark both read calmly: no colour except data and status.
