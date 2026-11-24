## Component: ExpandingSearch

An icon button that grows into a search field. The width springs open, the input takes focus, and it folds back on blur when empty or on Esc. An optional results slot opens beneath it.

### Anatomy
```
<div class="ui-xsearch [ui-xsearch-sm|lg]" role="search" style="--ui-xsearch-w: 280px">
  <div class="ui-xsearch-field" data-state="closed|open">
    <button class="ui-xsearch-toggle" aria-label="Search" aria-expanded>search icon</button>
    <input class="ui-xsearch-input" type="search" aria-label="Search">
    <button class="ui-xsearch-clear" aria-label="Clear search">x</button>        (open and non-empty)
    <kbd class="ui-kbd ui-xsearch-hint" aria-hidden>⌘K</kbd>                       (open, empty, shortcut)
  </div>
  <div class="ui-xsearch-results" data-state="open|closed">…results…</div>          (open, non-empty, results given)
</div>
```

### Props
- `value` / `defaultValue` / `onValueChange`; `open` / `defaultOpen` (false) / `onOpenChange`.
- `placeholder` ("Search"), `label` ("Search"), `width` (number px or CSS length, default 280), `size` `sm | md | lg` (32 / 36 / 44px), `shortcut` (⌘K / Ctrl K, default false), `onSubmit(value)`, `results` (ReactNode), plus `HTMLAttributes<HTMLDivElement>` and ref.

### Visual rules
- Field: 1px `--ui-border-strong`, `--ui-background`, `--radius-md` (`--radius-lg` at `lg`), `--ui-shadow-xs` (none in dark), `overflow: hidden`, `box-sizing: border-box`.
- Closed width = height (square icon button, icon `--ui-foreground`); open width = `--ui-xsearch-w`, never wider than `100vw − 2rem`.
- Input: transparent, 14px, no native search chrome. Clear button 24px with `--ui-accent` hover. Open + focused: ring `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)`.
- Results panel: absolute under the field (`top: calc(100% + 6px)`, full width, `z-index: 30`), `--ui-surface-raised`, 1px `--ui-border`, `--radius-lg`, `--ui-shadow-md`, padding 4px, max-height 20rem scrolling.

### Behaviour
- Click the icon, or ⌘K / Ctrl K (`shortcut`), expands and focuses the input (focus is set in an effect after the open state renders).
- The input has `visibility: hidden` and `tabindex=-1` until open; the hide is delayed by the spring duration on collapse so it never pops.
- Blur collapses only if the query is empty and focus left the whole component (the results count as inside). A typed query keeps it open.
- Esc: clears the query, collapses, and returns focus to the icon. Enter → `onSubmit(value)`.
- While open, mousedown on the icon / clear button is `preventDefault`ed so the field keeps focus (no blur-collapse race in Safari).
- Results mount with `usePresence` and `data-state`.

### Motion
- **Width**: CSS transition `width var(--ui-spring-smooth-duration) var(--ui-spring-smooth)` (540ms, never overshoots) between the two fixed widths. Animating size is the information here.
- Input opacity 0 → 1 in 150ms starting 90ms after the field begins to grow; visibility switches at once on open and after 540ms on close.
- Closed press: field `scale(.94)` on `--ui-spring-snappy`. Clear button `ui-pop-in` 150ms.
- Results: `ui-pop-in` 380ms (4px rise, `--ui-pop-y: -4px`, blur clears) / `ui-pop-out` 160ms `--ui-ease-in`.
- **Reduced motion**: the field opens and closes instantly; focus, results and collapse rules are unchanged.

### Accessibility
- Wrapper is a `search` landmark. Icon button: accessible name + `aria-expanded`. Input: `type="search"`, `aria-label`, `aria-controls` → results while mounted.
- Esc and blur behaviour as above; the shortcut hint is `aria-hidden`.

### Acceptance checks
- Closed: field is 36×36 and the input is not focusable. Clicking the icon makes it ~280px wide with the input focused.
- Blurring while empty collapses it; blurring with text leaves it open.
- Esc clears and collapses with focus on the icon.
- Typing shows the results panel; clearing hides it.
