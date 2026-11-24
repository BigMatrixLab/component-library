## Block: Footer

The last section of a marketing site: brand, navigation to everything else, legal links and copyright. A marketing block: kit components (`Badge`, `Button`, `Input`, `Label`) plus Tailwind utilities.

### Variants
```
multi-column   brand + blurb + newsletter form | <nav> with 4 link columns · bottom bar: ©, live status badge, social links
minimal        one row: logo + © | <nav> with 6 links; wraps on phones; zero JS (Server Component)
```

### Anatomy (multi-column)
```
<footer>                           rounded-2xl border bg-background, px 20 → 32px, pt 56 → 64px, pb 32px
  <div ref> .ui-stagger            revealed on scroll
    grid lg:[1.1fr 2fr]
      brand column                 logo link · blurb · <form>
        <form onSubmit>            <Label htmlFor> · <Input type="email" required name="email"> + <Button type="submit">
          <p role="status">        hint, replaced by "Thanks! The next issue goes to …" after submit
      <nav aria-label="Footer">    grid 2 cols → 4 from sm; each column: <h2> 13px/500 + <ul> of 13px muted links, 12px apart
    bottom bar                     border-t, pt 24px: © 2026 · <a><Badge variant="success" size="sm" live>All systems normal</Badge></a> · social links
```

### Visual rules
- Links `text-sm text-muted-foreground`, `hover:text-foreground` (150ms colour transition only).
- Newsletter: input and button side by side from `sm`, stacked on phones; form `max-w-sm`.
- The rounded border is the docs frame; drop `rounded-2xl border` for a full-bleed footer (use `border-t`).
- Left-aligned text throughout.

### Motion
- Multi-column: one `.ui-stagger` group (the main grid, then the bottom bar), added when 10% in view; `motion-safe:opacity-0` before that.
- The status badge dot pulses (`live`); reduced motion stops the pulse.
- Minimal: no entrance; it is the last thing on the page.

### Accessibility
- `<footer>` is the page's contentinfo landmark when it is a direct child of `<body>`.
- Link columns live in one `<nav aria-label="Footer">`; column titles are headings so screen-reader users can jump between them.
- The email field has a visible label, `type="email"`, `autocomplete="email"` and `required`; the result is announced through `role="status"`.

### Responsive
- 360px: brand block, then a 2-column link grid, then the bottom bar stacked.
- `sm`: 4 link columns. `lg`: brand column beside the links. Minimal: one row from `md`.

### Acceptance checks
- Submitting a valid email shows the thank-you line without reloading the page.
- No horizontal overflow at 360px; axe reports no serious violations.
