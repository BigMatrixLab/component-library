## Block: Features

A landing-page section that explains what the product does: a short header, then the features themselves as a grid, a bento of illustrated tiles, or alternating text-and-visual rows. A marketing block: kit components plus Tailwind utilities, no new `ui-*` classes.

### Variants
```
icon-grid     eyebrow · h2 | lead (side by side on lg) · 6 features in 1/2/3 columns, each with a hairline top border
bento         eyebrow · h2 · lead · 5 tiles on a 6-column grid (one 4×2 hero tile), each with a decorative mini-visual
alternating   h2 · lead · 3 rows: copy (eyebrow, h3, body, checklist, link) beside a framed visual, sides swap per row
```

### Anatomy
```
<section>                       rounded-2xl border bg-background, px 20 → 32px, py 56 → 80px
  header                        <p> eyebrow (text-primary-text, 13px/500) · <h2> · <p> lead
  <ul ref> .ui-stagger          the one staggered group, revealed when scrolled into view
    <li>                        icon tile 40px (rounded-lg border bg-muted, 20px Icon) · <h3> · <p>
```
Bento tile: `<li class="flex flex-col rounded-2xl border bg-card p-5 sm:p-6">` → `<h3>` · `<p>` · `<div aria-hidden class="mt-auto pt-6">` visual. Spans: `sm:col-span-2 lg:col-span-4 lg:row-span-2` for the first tile, then `lg:col-span-2`, `lg:col-span-2`, `lg:col-span-3`, `lg:col-span-3`.
Alternating row: `grid lg:grid-cols-2 gap-8 lg:gap-16`; odd rows put the copy second with `lg:order-2`. The visual is a `role="img"` frame: `rounded-2xl border bg-muted/40 p-3 sm:p-6` with a radial series tint, holding a `rounded-xl border bg-card p-4` mock.

### Visual rules
- h2: `font-display` 28px → 40px from `sm`, 600, `tracking-tight`. h3: 17px/600 (grid, bento) or 24 → 28px (alternating).
- Body: 15px `text-muted-foreground`, left-aligned, never balanced.
- Grid gaps: icon grid `gap-x-8 gap-y-10`; bento `gap-3`, `gap-4` from `lg`.
- Mini-visuals use semantic fills only: `bg-series-1/2/5` for data, `bg-success`/`bg-warning`/`bg-destructive` for status, `bg-muted` tracks, `bg-primary` for an "on" toggle.
- Subtle gradients only: one tinted tile in the bento (`series-1` 12%), and the alternating frames (`series-n` 13%).
- Checklist icons: `check` 18px in `text-success-text`.

### Motion
- One orchestrated entrance per block: the list gets `.ui-stagger` the first time it is 10% inside the viewport (IntersectionObserver, then disconnect). Until then it carries `motion-safe:opacity-0`, so with reduced motion it is never hidden.
- Link arrows nudge 2px on hover.
- Reduced motion: no hiding, and the global rule makes the entrance instant.

### Accessibility
- Section heading is an `<h2>`; each feature is an `<h3>` inside a list item.
- Decorative visuals are `aria-hidden` (bento) or a single `role="img"` with a descriptive label (alternating).
- Icons beside text are decorative (`aria-hidden`, the kit's default).

### Responsive
- 360px: one column everywhere; bento tiles stack; alternating rows put the copy above the visual.
- `sm`: 2 columns (icon grid, bento). `lg`: 3 columns / 6-column bento / side-by-side rows.
- No horizontal overflow: long mono labels truncate.

### Acceptance checks
- The list is visible after scrolling into view, and immediately with reduced motion.
- No horizontal overflow at 360px; axe reports no serious violations.
