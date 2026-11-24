## Component: Tooltip

Short supporting text for a control. Opens on hover after a delay and on keyboard focus; never from touch. The bubble is a `popover="manual"` element in the top layer, positioned by `useFloating` through the shared `FloatingContent`.

### Anatomy
```
<TooltipProvider>               shared delay + "skip delay" window (optional; defaults apply without it)
  <Tooltip>                     context: open state, ids, timers
    <TooltipTrigger />          button (or asChild): aria-describedby while open
    <TooltipContent>            <div class="ui-floating ui-tooltip" role="tooltip" popover="manual" data-state data-side>
      text
      <kbd class="ui-tooltip-kbd">   optional, from the `shortcut` prop
```

### Props
- `TooltipProvider`: `delayDuration` (700ms), `skipDelayDuration` (300ms).
- `Tooltip`: `open`, `defaultOpen`, `onOpenChange`, `delayDuration` (per-tooltip override).
- `TooltipContent`: `placement` (default `top`), `align`, `offset` (6), `shortcut`, native div props.
- `TooltipTrigger`: `asChild`.

### Behaviour
- Pointer (mouse/pen, never touch): `pointerenter` starts the delay timer; `pointerleave` closes after a 100ms grace so the pointer can reach the bubble (hoverable content, WCAG 1.4.13). `pointerdown` closes it.
- Skip window: when another tooltip of the provider is open, or one closed less than `skipDelayDuration` ago, the next one opens with no delay. Opening a tooltip closes the other one.
- Keyboard: focus opens it immediately only when the focus is `:focus-visible` (keyboard), not after a pointer click; blur closes it.
- Esc closes it (also when only hovering); the trigger handles Esc first so an enclosing popover stays open. Scrolling closes it (ignored for 200ms after opening, because focusing can scroll the trigger into view).
- Flips to the opposite side when there is no room; shifts to stay inside the viewport.

### Visual rules
- Inverted bubble: `--ui-foreground` fill, `--ui-background` text, `--radius-md`, padding 6px 10px, 12px/500 text, `--ui-shadow-md`, max width 20rem.
- Shortcut: small mono key chip, `color-mix(--ui-background 18%, transparent)` fill.

### Motion
- Open: `ui-pop-in` 150ms `--ui-ease-out` from the trigger side, 3px travel, scale .96.
- Close: `ui-pop-out` 100ms `--ui-ease-in`.

### Accessibility
- `role="tooltip"`; trigger `aria-describedby` points at it only while it is rendered.
- Not the only way to learn something essential; never opens from touch.

### Acceptance checks
- Hover opens after ~700ms, not before; Tab opens at once; a mouse click on the button does not open it.
- Moving between toolbar buttons quickly opens the next tooltip with no delay.
- Esc, pointer leave and scroll close it; the bubble sits next to the trigger and flips near the edge.
- No axe violations in light and dark.
