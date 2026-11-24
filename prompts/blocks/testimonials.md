## Block: Testimonials

Social proof for a landing page: what real customers say, with their name, role and company. A marketing block: kit components (`Avatar`, `AnimatedNumber`, `Button`) plus Tailwind utilities.

### Variants
```
quote-grid   eyebrow · h2 · 6 quotes in CSS columns (1/2/3), the first one featured
single       eyebrow h2 · large quote mark · one big quote · author + link · 3 rolling stats
marquee      h2 · lead · Pause button | one row of quotes sliding left forever; reduced motion: a scrollable row
```

### Anatomy
```
<figure>                       rounded-2xl border p-5/p-6, gap 20–24px
  <blockquote><p>“…”</p></blockquote>
  <figcaption>                 <Avatar size="sm"><AvatarFallback>PN</AvatarFallback></Avatar> · name (500) · role, company (muted)
```
Single: the stats are a `<dl>`; each `<div class="flex flex-col-reverse">` holds `<dt>` (label, muted 13px) then `<dd>` with `<AnimatedNumber value suffix animateOnView />` at 34px, so the number reads first visually and the label first for screen readers.
Marquee: viewport `overflow-hidden` with an edge fade `mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent)` → track `flex w-max` → two identical copies `flex gap-4 pr-4`, the second `aria-hidden`.

### Visual rules
- Quote text 15px/1.625; the featured grid quote 17px/500 on `bg-card` with a 160° `series-1` 9% linear tint.
- Single quote: `font-display` 24 → 28 → 34px, 500, leading 1.3; quote mark 32×24 SVG in `text-border`.
- Marquee cards are 288px (320px from `sm`) wide, `bg-card`.
- Body and quotes are left-aligned; never `text-wrap: balance`.

### Motion
- Entrance: one `.ui-stagger` group, added when the block is 10% in view (`motion-safe:opacity-0` until then).
- Marquee: Web Animations API, `translateX(0 → -50%)` on the track, linear, infinite, 36px/s (duration = half the track width ÷ 36). Pointer hover pauses it; the Pause/Play button toggles it and stays until pressed again.
- Single: stats roll from 0 the first time they are half in view (`AnimatedNumber animateOnView`).
- Reduced motion (`matchMedia('(prefers-reduced-motion: reduce)')`, followed live): no marquee animation, no duplicate copy, no Pause button; the cards become a `snap-x` row that scrolls by hand, in a focusable `role="region" aria-label="Testimonials"`.

### Accessibility
- Moving content has a visible pause control (WCAG 2.2.2) and stops on hover.
- The duplicated marquee copy is `aria-hidden` and contains nothing focusable.
- `figure` / `blockquote` / `figcaption` give quotes and attribution their meaning; avatars are initials only.

### Responsive
- 360px: one column; the marquee header wraps the Pause button under the heading; the scroll row in reduced motion has 20px scroll padding.
- No horizontal page overflow: the marquee is clipped by its viewport.

### Acceptance checks
- Marquee loops without a visible jump; it pauses on hover and with the button.
- With reduced motion it does not move and every quote is reachable by scrolling or keyboard.
- No horizontal overflow at 360px; axe reports no serious violations.
