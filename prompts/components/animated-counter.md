## Component: Animated counter

Numbers whose digits roll to their new value (NumberFlow-like), plus a count-up hook. No dependencies: Intl does the formatting, CSS does the motion.

### Anatomy
```
<AnimatedNumber value format locale prefix suffix animateOnView>
  <span class="ui-number">
    <span class="ui-number-sr">$1,234.50</span>               plain text for assistive tech
    <span class="ui-number-visual" aria-hidden="true">
      <span class="ui-number-symbol">$</span>                 currency, separators, signs, % , K
      <span class="ui-number-digit">                          one line tall, clips its reel
        <span class="ui-number-reel" style="--ui-digit: 4">   10 spans "0".."9"
```

### Props
- `AnimatedNumber`: `value` (number), `format` (`Intl.NumberFormatOptions`), `locale` (default `en-US`, fixed so SSR matches), `prefix` / `suffix` (static text), `animateOnView` (digits start at 0 and roll when first scrolled into view); all `<span>` props.
- `useCountUp({ end, start = 0, duration = 1400, delay = 0, threshold = 0.4, once = true, disabled })` → `{ ref, value, inView }`. Attach `ref` to the element showing the number; `value` is a float to format yourself.

### Behaviour
- `Intl.NumberFormat(locale, format).formatToParts(value)` → cells. Digits are keyed by place value (`int-3`, `frac-0`), so growing from 999 to 1,000 rolls the existing digits and only the new thousands digit and separator mount (with a short rise-in).
- Each digit column translates its reel to the new digit: `transform: translateY(calc(var(--ui-digit) * -10%))`.
- Width is stable: tabular figures, one fixed cell per character; symbols come straight from Intl (any locale and currency, including non-Latin digits).
- Reduced motion: digits change instantly (global rule makes the transition 1ms). `useCountUp` jumps straight to `end`.

### Visual rules
- Inherits font, size and colour from its parent; `line-height: 1.15` per digit line, `font-variant-numeric: tabular-nums`.

### Motion
- Roll: `transform` on `--ui-spring-morph` over `--ui-spring-morph-duration` (550ms). Entering cells: `ui-number-in`, 220ms, rises 0.3em with a 2px blur that clears.
- Count-up: easeOutExpo, 1400ms.

### Accessibility
- Screen readers read the `ui-number-sr` text; the animated cells are `aria-hidden`. No live region by default — pass `aria-live="polite"` (and `aria-atomic`) only for numbers that should be announced.

### Acceptance checks
- Changing the value 1234.5 → 1240.75 rolls only the digits that changed; the text width does not jitter.
- Currency symbol and separators stay put; negative values and compact notation (1.2K) render.
- `animateOnView` rolls from 0 only once the number is on screen.
