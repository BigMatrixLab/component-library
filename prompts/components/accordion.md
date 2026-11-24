## Component: Accordion (and Collapsible)

A stack of headings that each reveal a region, plus `Collapsible` for a single region. Both share one animated region (`Collapse`).

### Anatomy
```
<Accordion type="single|multiple" variant>      div.ui-accordion data-variant
  <AccordionItem value disabled>                div.ui-accordion-item data-state
    <AccordionTrigger headingLevel=3>           h3.ui-accordion-header > button.ui-accordion-trigger[data-accordion-trigger]
                                                  children + chevron-down icon (.ui-accordion-chevron)
    <AccordionContent>                          div.ui-collapse.ui-accordion-content role="region"
                                                  > div.ui-collapse-inner > div.ui-accordion-body
<Collapsible open|defaultOpen onOpenChange disabled>   div.ui-collapsible
  <CollapsibleTrigger asChild?>                 button, aria-expanded, aria-controls
  <CollapsibleContent>                          div.ui-collapse.ui-collapsible-content
```

### Props
- `Accordion` is a union: `type="single"` (`value?: string`, `defaultValue`, `onValueChange(value: string)`, `collapsible` default false) or `type="multiple"` (`string[]` equivalents). Also `variant` (`default` divided | `cards` | `flush`) and `disabled`. State is held as `string[]` internally via `useControllableState`; single without `collapsible` ignores a click on the open item.
- `AccordionItem`: `value`, `disabled`. `AccordionTrigger`: `headingLevel` 2–6.
- `Collapsible`: `open`, `defaultOpen`, `onOpenChange`, `disabled`.

### Behaviour
- Trigger `aria-expanded`, `aria-controls` = region id; region `aria-labelledby` = trigger id. Ids from `useId()` + sanitised value.
- Keyboard (APG): ArrowUp/ArrowDown/Home/End move focus between triggers (wrapping), only when the key is pressed on a trigger (fields inside panels keep their keys). Enter/Space toggles (native button).
- Closed content stays in the DOM with `hidden="until-found"` (set only after the closing animation finishes, via `animationsFinished`), so Ctrl+F can reveal it; the `beforematch` event opens the item. Browsers without support treat it as plain `hidden`. An item that starts open does not animate on mount (`data-animate` is added after the first commit).

### Visual rules
- Region: `display: grid; grid-template-rows: 0fr` (open: `1fr`); inner `min-height: 0; overflow: hidden`.
- Trigger: flex, space-between, 15px/500, padding 16px 0, chevron 16px muted that rotates 180° when expanded.
- default: `border-bottom: 1px solid --ui-border` per item. cards: gap 8px, 1px border, `--radius-lg`, `--ui-surface`, open item border `--ui-border-strong`, trigger padding 14/16px. flush: no lines, trigger padding 10px 0.
- Body: 14px `--ui-muted-foreground`, bottom padding 16px (cards: 0 16px 16px).

### Motion
- Open: keyframes `ui-collapse-open` (`grid-template-rows` 0fr→1fr + opacity) for `--ui-spring-smooth-duration` on `--ui-spring-smooth` (no overshoot). Close: 260ms `--ui-ease-in-out`. Chevron: `transform` 220ms `--ui-ease-out`. Reduced motion: no movement.

### Accessibility
- WAI-ARIA accordion pattern. Disabled items are disabled buttons (skipped by arrows).

### Acceptance checks
- Height ends at the content height (open) or 0 (closed, then hidden); no jump at the end.
- Single: opening one closes the other; collapsible lets the open one close.
- Arrow/Home/End move focus; Ctrl+F in Chromium opens a closed item containing the match.
