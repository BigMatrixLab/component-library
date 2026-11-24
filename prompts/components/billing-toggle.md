## Component: Billing toggle

A monthly ↔ yearly segmented switch with a savings badge, and a price whose digits roll to the new value.
Two exports: `BillingToggle` (the switch) and `BillingPrice` (the rolling price). They share no state: the
app holds the cycle and passes the right amount to each price.

### Anatomy
- `BillingToggle` is a `SegmentedControl` (see toggle-group) with class `ui-billing-toggle`:
  `<div class="ui-seg ui-billing-toggle" role="radiogroup" aria-label="Billing period">`
  - `<span class="ui-seg-pill" aria-hidden="true">` — the gliding highlight.
  - `<button role="radio" class="ui-seg-item ui-billing-toggle-item" aria-checked>Monthly</button>`
  - `<button role="radio" class="ui-seg-item ui-billing-toggle-item" aria-checked>Yearly <span class="ui-badge ui-badge-success ui-badge-sm ui-billing-toggle-save">Save 20%</span></button>`
- `BillingPrice`: `<span class="ui-billing-price [ui-billing-price-sm|-lg]" aria-live="polite" aria-atomic="true">`
  - `<span class="ui-number ui-billing-price-amount">` — `AnimatedNumber` (sr text + aria-hidden digit reels).
  - `<span class="ui-billing-price-period">/ month</span>` when `period` is given.

### Props
- `BillingToggle`: `value` / `defaultValue` (`'monthly' | 'yearly'`, default `monthly`) / `onValueChange`;
  `savings` (ReactNode, badge in the yearly option; omitted = no badge); `monthlyLabel` / `yearlyLabel`
  (default "Monthly" / "Yearly"); plus every `SegmentedControl` prop: `size` (`sm | md | lg`), `fullWidth`,
  `disabled`, `name`. `aria-label` defaults to "Billing period" unless `aria-labelledby` is given.
- `BillingPrice`: `amount` (number); `currency` (default `USD`); `locale` (default `en-US`); `format`
  (Intl options merged over `{ style: 'currency', currency, min/max fraction digits }`); `period`;
  `size` (`sm` 24px · `md` 34px · `lg` 40px amount); `announce` (default `true`).
- Whole amounts format with 0 decimals, any other amount with exactly 2.

### Visual rules
- The control is the segmented control: muted well (`--ui-surface-muted`), 3px padding, `--radius-lg`,
  raised pill with `--ui-shadow-sm` + 1px `--ui-border-subtle` ring. Item gap 8px for the badge.
- Badge: success tint 10% (14% with a 32% border when yearly is checked) and `--ui-success-text`, 20px tall,
  pulled 4px towards the item edge (`margin-inline-end: -0.25rem`), tabular numbers.
- Price: amount 600 weight, line-height 1, letter-spacing −0.02em, tabular numbers (from AnimatedNumber);
  period `--ui-muted-foreground`, 14px/400 (15px for `lg`), 6px gap, baseline aligned, no wrapping.

### Motion
- Pill glides on `--ui-spring-morph` (550ms) between options; no animation on first render.
- Each changed digit's reel slides on `--ui-spring-morph`; new cells (e.g. a fourth digit) rise in with
  `ui-number-in` (0.3em, 2px blur, `--ui-duration`, `--ui-ease-out`).
- Pressing an option scales its badge to .96 on `--ui-spring-snappy`.
- Reduced motion: the global rule makes every transition instant; state still changes.

### Accessibility
- WAI-ARIA radio group: one tab stop on the checked radio; ←/→/↑/↓ move and select; Home/End jump.
- The badge text is part of the yearly radio's name ("Yearly Save 20%").
- `BillingPrice` is a polite, atomic live region; the visible digits are aria-hidden and one plain text node
  ("$24") is read. When several prices change together, set `announce={false}` on them.

### Acceptance checks
- Clicking Yearly checks it, the pill rests on it, and the price text becomes the yearly amount.
- Arrow keys switch the cycle; focus follows; only one item has `tabindex="0"`.
- `.ui-billing-price` has `aria-live="polite"`; its sr text matches the formatted amount.
- The price's width does not jump while digits roll (tabular figures, fixed cells).
- Works in light and dark and with every `data-accent`; axe finds no serious violations.
