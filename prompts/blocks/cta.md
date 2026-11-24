## Block: Call to action

The closing pitch near the bottom of a landing page: one sentence of value, one primary action, an optional secondary one. A marketing block: `Button` and `Icon` plus Tailwind utilities.

### Variants
```
banner   a filled bg-primary band: h2 + lead on the left, Start free trial (secondary button) + Talk to sales link on the right
card     a bordered card with a subtle gradient: eyebrow, h2, lead, 2 buttons | an "Included in your trial" checklist panel
```

### Anatomy (banner)
```
<section>                         outer frame: rounded-2xl border bg-background, px 16 → 32px, py 40 → 64px
  <div ref>                       relative isolate overflow-hidden rounded-2xl bg-primary text-primary-foreground, px 24 → 48px
    glows                         absolute inset-0 -z-10, aria-hidden, two radial gradients
    <div> h2 · p (primary-foreground/90)
    <div> <Button size="lg" variant="secondary" asChild><a/></Button> · text link (h-11, underline on hover)
```
Card: `rounded-2xl border bg-card p-6 sm:p-10 lg:p-12` with `linear-gradient(135deg, series-1 8%, transparent 45%)` + `radial-gradient(60% 80% at 100% 100%, series-5 9%, transparent 70%)`; inside, `grid lg:grid-cols-[1.2fr_1fr]`; the checklist panel is `rounded-xl border bg-background p-5` with 20px `bg-success` check discs.

### Visual rules
- h2 `font-display` 28 → 34px, 600, `tracking-tight`. Lead 15 → 17px. Left-aligned; never balanced.
- Banner glows: `series-1` 32% (top right) and `series-2` 22% (bottom right) mixed into transparent; they tint the band, they never sit under the copy at full strength.
- The band follows the theme: dark on light pages, light on dark pages, the accent colour when one is set.
- The secondary link on the band keeps `text-primary-foreground` and shows a 2px outline in the same colour on keyboard focus.

### Motion
- Banner: the band gets `.ui-animate-rise` when it first scrolls 10% into view. Card: its two columns use `.ui-stagger`.
- Until revealed, `motion-safe:opacity-0`; with reduced motion it is always visible.

### Accessibility
- `<h2>` for the pitch. Actions are links styled as buttons (`asChild`), 44px tall.
- Text on the band: `--ui-primary-foreground` on `--ui-primary` (measured ≥ 4.5:1 in every accent); the lead at 90% opacity.

### Responsive
- 360px: everything stacks; buttons go full width (banner) or stack (card).
- `lg`: banner copy and actions side by side; card goes two columns.

### Acceptance checks
- No horizontal overflow at 360px; axe reports no serious violations.
- Works in light, dark and every accent (the band recolours with the accent).
