## Component: HoverCard

A rich preview of a link, shown on pointer hover or keyboard focus. Supplementary only: it never opens on touch and holds nothing the person has to reach.

### Anatomy
```
<HoverCard>                   context: open state, timers (useHoverIntent)
  <HoverCardTrigger />        <a> (or asChild) with data-state
  <HoverCardContent>          <div class="ui-floating ui-hover-card" popover="manual" data-state data-side>
    any content; helper classes .ui-hover-card-header .ui-hover-card-title .ui-hover-card-meta .ui-hover-card-text
```

### Props
- `HoverCard`: `open`, `defaultOpen`, `onOpenChange`, `openDelay` (700), `closeDelay` (300).
- `HoverCardTrigger`: anchor props, `asChild`.
- `HoverCardContent`: `placement` (default `bottom`), `align`, `offset` (8), `arrow`, native div props.

### Behaviour
- `pointerenter` (not touch) on the trigger starts a 700ms timer; leaving cancels it. Once open, leaving the trigger starts a 300ms close timer; entering the card cancels it; leaving the card restarts it.
- Keyboard focus (`:focus-visible`) on the trigger opens immediately. A mouse click focus does not.
- Focus moving from the trigger into the card (the card follows the trigger in the DOM) keeps it open; focus leaving both closes it after 300ms.
- Esc closes it, also while only hovering. Scrolling follows the trigger (useFloating).
- Positioning flips to the opposite side when there is no room and shifts into the viewport.

### Visual rules
- Width 20rem, max `100vw − 1rem`, padding 16px, 1px `--ui-border`, `--radius-lg`, `--ui-surface-raised`, `--ui-shadow-lg`, 14px text.
- Profile preview: avatar (lg) + name (600) + handle (muted, 13px) + action; bio 13px / 22px; meta line muted with a 16px icon.

### Motion
- Open: `ui-pop-in` 220ms ease-out, 6px travel from the trigger side, scale .96, blur 2px. Close: `ui-pop-out` 160ms, pointer events off while closing.

### Accessibility
- The trigger is a real link that works without the card; the card has no role and is not announced on hover.
- Interactive content inside is reachable by Tab.

### Acceptance checks
- Not open at 350ms of hover, open by ~1.5s; card is 8px below the trigger.
- Moving the pointer to the card keeps it open; leaving closes it after about 300ms.
- Tab to the link opens it at once; Esc closes it; Tab into the card focuses its button.
- A touch `pointerenter` never opens it.
- No serious axe violations while open.
