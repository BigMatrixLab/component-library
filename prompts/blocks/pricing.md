## Block: Pricing

Marketing sections for a pricing page: three plan cards with a monthly/yearly switch, a feature comparison table and an FAQ. Built only from ui-kit components plus Tailwind utilities; each variant is one self-contained file.

### Anatomy
```
Three tiers (client)               <section aria-labelledby>, @container, rounded-xl border, bg-background, py 56, px 20 → 40 (@2xl)
  background                       ONE subtle wash: radial-gradient(60% 40% at 50% 0%, primary 9% → transparent)
  intro (centred, max 42rem)       outline Badge “Pricing” · h2 28px → 34px (@2xl) · 15px muted lead
    SegmentedControl               aria-label “Billing period”: Monthly | Yearly  + success Badge sm “Save 20% yearly”
  <ul aria-label="Plans">          3 columns from @3xl, stacked below; 16px gap; mt 48
    <li data-plan>                 rounded-xl, 1px border, bg-card, p-24, gap 24
      name (h3 17px/600) + solid Badge “Most popular” on the recommended plan
      description 13px muted
      price: AnimatedNumber (USD, no decimals) 34px/600 display + “/ seat”; billing note 13px muted
      Button full width: primary on the recommended plan, outline on the others
      feature list: top border, 10px gap, check icon (primary-text) + text
  footnote centred 13px muted with a link

Comparison (server-safe)           <section>, h2 24px + lead
  Table label="Plan comparison", table-fixed, min-width 38rem; first column 34%, sticky left with an opaque background
    header: plan name (13px/600) + “Popular” badge + price (12px muted); recommended column tinted primary/10
    one TableBody per group: a rowgroup header (12px, uppercase, wide tracking, muted, transparent background)
      rows: <th scope="row"> feature + 3 cells: check (aria name “Included”), minus (“Not included”) or text
      recommended column cells tinted primary/5
    TableFooter: a small button per plan (primary for the recommended plan), aria-label “<cta>: <plan>”

FAQ (server-safe)                  <section>, 2 columns from @3xl (1fr / 1.6fr, gap 64), stacked below
  left: h2 28px, 15px muted text, “Email support” (outline, mail icon) + “Talk to sales →” (ghost) as links
  right: Accordion type="single" collapsible, first item open, triggers at heading level 3
```

### Behaviour
- The switch is controlled; changing it rolls every price to the new value and rewrites the note: monthly “per seat / month, billed monthly”, yearly “per seat / month, billed yearly ($<12 × price>)”. Free stays “$0” with “Free forever, no card needed”.
- Prices: Starter 0/0, Pro 24/19, Business 49/39 (monthly/yearly per seat per month).
- Arrow keys move and select inside the segmented control (radiogroup); the pill glides on the morph spring.

### Visual rules
- Gradient only as the faint background wash of the tiers section (marketing block rule). No gradients on cards or buttons, no shadows.
- The recommended card: border and a 1px ring in the primary colour (a 2px outline in effect), not a lift.
- Tabular figures on prices; reduced motion changes the digits without rolling.

### Responsive
- Container queries. Cards stack below 48rem; the comparison table scrolls horizontally inside its focusable frame with the feature column pinned; the FAQ stacks below 48rem.

### Accessibility
- Sections are labelled by their headings; plan features are lists named “<Plan> features”.
- The price is read as plain text (AnimatedNumber exposes the formatted value to screen readers).
- Table features are row headers; group rows use scope="rowgroup"; check and minus icons have accessible names.

### Acceptance checks
- Clicking Yearly changes Pro to $19 and its note to “billed yearly ($228)”; Monthly brings back $24.
- Only one card has a primary button and the “Most popular” badge.
- At 390px the cards are one column, and the comparison table scrolls while “Seats” stays visible.
- The first FAQ answer is open on load; opening another closes it.
