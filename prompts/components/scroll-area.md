## Component: Scroll area

Native overflow scrolling with slim overlay thumbs and edge fades that appear only where content continues. The browser does the scrolling; the thumbs are a draggable view of its position.

### Anatomy
```
<ScrollArea>   <div class="ui-scroll-area" data-orientation data-scrollbar>      (position: relative; give it a height / max-height)
                 <div class="ui-scroll-area-viewport" role="region" aria-label tabindex="0">   (overflow auto, native bars hidden, masked)
                   <div class="ui-scroll-area-content">children</div>
                 <div class="ui-scroll-area-track" data-orientation="vertical" aria-hidden><div class="ui-scroll-area-thumb"/></div>
                 <div class="ui-scroll-area-track" data-orientation="horizontal" aria-hidden>…</div>
```
Only the tracks for the chosen orientation render.

### Props
- `orientation`: `vertical` (default) · `horizontal` · `both`.
- `label`: region name (default "Scrollable content").
- `fade` (default true), `scrollbar`: `hover` (default) | `always`.
- `viewportClassName`, `viewportRef`; `className` styles the root.
- CSS knob: `--ui-scroll-fade-size` (1.5rem).

### Behaviour
- A hook reads `scrollTop/Left`, `clientHeight/Width`, `scrollHeight/Width` and writes straight to the DOM (no re-render per scroll): thumb size `max(28px, track * client / scroll)` and `translate3d` offset `scroll / (scroll range) * (track - thumb)`.
- Root attributes: `data-overflow-x|y` (content overflows that axis), `data-fade-top|bottom|left|right` (content continues beyond that edge; only while overflowing, and only with `fade`), `data-scrolling` (set while scrolling and 900ms after), `data-dragging`.
- Metrics refresh on `scroll`, window resize, and `ResizeObserver` (viewport and its children) plus `MutationObserver` (child list).
- Thumb drag uses pointer capture: scroll = start scroll + pointer delta * (scroll range / (track - thumb)).
- Pressing the empty track pages 90% of the viewport toward the press (smooth).
- Tracks of an axis with no overflow are hidden (`data-hidden`); with both axes the vertical track leaves a .625rem corner.

### Visual rules
- Viewport: `height: 100%`, `max-height: inherit`, native scrollbars hidden; radius inherited.
- Fades: a CSS mask (two gradients, intersected) on the viewport sized by registered `<length>` properties `--ui-sa-fade-t|b|l|r`, animated 220ms; mask applies only while overflowing.
- Track: 10px wide (2px padding), thumb 6px, `color-mix(foreground 26%, transparent)`, 40% on hover, 48% dragging. Tracks are visible on root hover (fine pointers), focus-visible, scrolling, dragging, or always.
- Focus ring: 2px inset outline in `--ui-ring` on `:focus-visible`.
- Horizontal: content wrapper is `width: max-content; min-width: 100%`.

### Motion
- Track opacity and fade size animate with `--ui-duration` and `--ui-ease-out`. Reduced motion: no animation.

### Accessibility
- Viewport is `role="region"`, `tabindex="0"`, `aria-label`: keyboard users Tab to it and scroll with arrows, Page Up/Down, Home/End, Space.
- Thumbs are `aria-hidden` and optional; native scrolling is always available.

### Acceptance checks
- With overflowing content: the viewport scrolls natively, the thumb has a non-zero size, and moves when scrolled.
- At scroll position 0 there is no top fade; after scrolling there is.
- Content that fits has no track and no fade.
- Dragging the thumb changes `scrollTop`.
- No serious axe violations in light and dark.
