## Block: Hero

The opening section of a landing page: a header with the brand and a few links, one headline, one supporting sentence, the primary action, and proof that the product is real (a product mock, a visual or a customer list). A marketing block: it composes kit components with Tailwind utilities and adds no `ui-*` classes of its own.

### Variants
```
centered    header · announcement pill · h1 · lead · 2 actions · fine print · product mock (divs)
split       header · eyebrow · h1 · lead · 2 actions · rating row  |  visual (incident card + floating card)
minimal     header (brand + one link) · mono eyebrow · two-tone h1 · lead · CLI command + CopyButton · customer names
```

### Anatomy (centered)
```
<section>                         relative isolate overflow-hidden, rounded-2xl border bg-background
  gradient wash                   absolute, aria-hidden, -z-10, two radial gradients
  <header>                        logo link · <nav aria-label="Main"> (md+) · Sign in (sm+) + Start free
  .ui-stagger                     centred column, max-w-3xl
    pill link                     rounded-full border, <Badge size="sm">New</Badge> + text + arrow
    <h1>
    <p> lead
    actions                       <Button size="lg" asChild><a/></Button> ×2, full width on phones
    <p> fine print                "14 days free · No credit card · SOC 2 Type II"
  .ui-animate-rise (200ms delay)  product mock, bottom faded with mask-image
    <div role="img" aria-label>   browser bezel → sidebar (md+) · stats · bar chart · deploy list
```
The outer rounded border frames the block in the docs; drop `rounded-2xl border` for a full-bleed page section.

### Visual rules
- Container `max-w-6xl` (header), `max-w-3xl` (centred copy), `max-w-5xl` (mock); side padding 20px, 32px from `sm`.
- h1: `font-display`, 600, `tracking-tight`; 32px/1.1 on phones, 40px from `sm`, 56px/1.05 from `lg` (marketing display size, outside the app type scale). Never `text-wrap: balance`.
- Lead: 15px → 17px from `sm`, `text-muted-foreground`, `max-w-xl`.
- The centred variant centres its copy; every other text block in the kit's marketing blocks is left-aligned.
- Gradients: marketing blocks only, always subtle: `color-mix(in oklch, var(--ui-series-n) 9–14%, transparent)` in radial gradients that fade out by 70%. Never behind small body text at more than 14%.
- Product mock: semantic colours only (`bg-card`, `bg-muted`, `border-border`, `bg-series-1` bars, `bg-success`/`bg-warning` dots). No images. Bezel `bg-muted/60` with 6–8px padding; inner window `rounded-t-xl`.
- Logo: 28px `bg-primary` rounded-lg square with a two-wave stroke mark in `text-primary-foreground`.
- Split visual: incident card `rounded-2xl border bg-card`; the floating "Resolved" card sits under it on phones and overlaps the bottom-left corner from `sm` (`absolute -bottom-6 -left-4`, `shadow-md` because it floats).
- Minimal: the command box is 44px tall, `bg-card` border, mono text truncated, a ghost icon `CopyButton` with `aria-label="Copy install command"`.

### Motion
- Heroes animate on load (they are above the fold): the copy column uses `.ui-stagger` (soft rise, 35ms per child), the visual uses `.ui-animate-rise` with a 160–200ms delay so it lands last.
- Hover: nav links fade to `text-foreground` (150ms); the pill and "see how" arrows nudge 2px right.
- Reduced motion: the global rule collapses every entrance to 1ms; nothing moves.

### Accessibility
- One `<h1>` per page: the hero's headline.
- `<nav aria-label="Main">` for the header links; links are hidden below `md`, so a real site adds a menu button there.
- Mocks and visuals are `role="img"` with an `aria-label` that says what the picture shows; their inner text is decorative.
- The rating stars are `aria-hidden`; the text next to them carries the score.
- Every action is a real link (`<Button asChild><a href/></Button>`), 44px tall from `size="lg"`.

### Responsive
- 360px: single column, actions stacked full width, mock shows two stats and hides the sidebar and URL bar.
- `md`: header links appear. `lg`: split goes two columns (`1fr 1.05fr`).
- No horizontal scroll at any width; long text truncates inside the mock.

### Acceptance checks
- Renders with no layout shift and no horizontal overflow at 360px.
- Light and dark both read well; switching the accent recolours the logo, badge and primary buttons only.
- axe: no serious violations.
