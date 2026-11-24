## Block: Error pages (404 and 500)

Calm full-page error states: what happened, whose fault it is and two ways forward. Built only from ui-kit components, Tailwind utilities and an inline SVG illustration; each variant is one self-contained client component file.

### Anatomy
```
root                          @container, rounded-xl, 1px border, bg-background, px 20, py 48 → 64 (@2xl)
  column (centred, max 36rem, gap 24, text-center)
    illustration              inline SVG 240×168 (w 208 → 240 @md), aria-hidden, built from shapes:
                              muted disc r70 + dashed ring r80 (stroke = border colour, dash 3 7) + a scene
    code line                 mono 13px/500: “404 · Page not found” (primary-text) / “500 · Server error” (warning-text)
    h1                        display 28px → 34px (@2xl), 600, tracking-tight
    lead                      15px muted

404 scene: a tilted page card (fill card, border stroke, grey text bars) and a magnifier in the primary colour with a “?”.
  The lead names the failed path in a mono chip (bg-muted, 13px).
  search: <form role="search"> max 28rem — Field( InputGroup( InputIcon search + Input aria-label “Search Lumen” ) + secondary Button “Search” ) + FieldError
  actions: primary “Back to home” (home icon, link) + outline “Contact support” (mailto link)
  below (max 48rem, mt 48): h2 13px muted, aria-live polite — “Popular pages” | “Results for “q”” | “No pages match “q”…”
    list: 2 columns from @xl; each a bordered bg-card link row: 36px muted icon tile, title 500 + truncated description, chevron-right

500 scene: three server units (rounded rects, card fill, border stroke) with two status lights each; the middle unit’s first light is warning.
  actions: primary “Try again” (refresh-cw, loading while retrying) + outline “Go to dashboard” (home icon, link)
  status line: role="status", tabIndex -1, min-height 20px — empty | “Still not loading…” | circle-check + “We’re back. Reloading your page…” (success-text)
  details box (max 28rem, bordered, bg-muted/60, p-16, left-aligned): <dl> Error ID (mono, truncate) + CopyButton (aria-label “Copy error ID”) · Time (mono)
    + sentence asking to include the ID + “System status” link with external-link icon
```

### Behaviour
- 404 search validates on submit: empty → “Type what you were looking for.” under the field and focus back in it. A query filters the popular pages by title and description (case-insensitive); with no match, show the full list under the “No pages match” heading.
- 500 retry: the button shows `loading` for ~1.4s. In the demo the first retry fails (status text) and the second recovers (success text, focus moves to the status line, Try again disabled). In an app, call Next.js `reset()` instead.

### Visual rules
- Semantic tokens only, including inside the SVG (fill-muted, fill-card, stroke-border, stroke-primary, fill-warning, fill-muted-foreground/20–40). No gradients, no shadows, no animation on the illustration.
- Copy is plain and calm; no jokes.

### Responsive
- One centred column at every width; the actions wrap; the popular pages go to one column below @xl (36rem). Works from 360px.

### Accessibility
- One h1 per page; illustrations aria-hidden; the search form is a search landmark with a named input; errors are announced.
- The popular-pages heading is a polite live region so filtering is announced.

### Acceptance checks
- 404: submitting an empty search shows the error; searching “invoice” leaves only “Invoices” and the heading reads “Results for “invoice””.
- 500: first Try again → “Still not loading…”; second → “We’re back…”. The copy button copies the error ID and says “Copied”.
- Both pages pass axe in light and dark.
