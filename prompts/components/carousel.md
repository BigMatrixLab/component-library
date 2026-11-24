## Component: Carousel

A native scroll-snap track with previous/next buttons, dots and keyboard arrows. Swiping and trackpad scrolling are the browser's; the component reads and nudges the scroll position.

### Anatomy
```
<Carousel>                 <div role="region" aria-roledescription="carousel" class="ui-carousel" data-orientation>
  <CarouselContent>        <div class="ui-carousel-viewport" tabindex="0">   (overflow auto, scroll-snap-type x mandatory)
                             <div class="ui-carousel-content">               (flex track, position: relative)
    <CarouselItem />         <div role="group" aria-roledescription="slide" aria-label="n of m" class="ui-carousel-item">
  <CarouselPrevious />     <button class="ui-btn ui-btn-outline ui-btn-sm ui-btn-icon ui-carousel-nav ui-carousel-prev" aria-label="Previous slide">
  <CarouselNext />         … ui-carousel-next, aria-label="Next slide"
  <CarouselDots />         <div role="group" aria-label="Choose a slide" class="ui-carousel-dots"> <button class="ui-carousel-dot" aria-label="Go to slide n" aria-current="true">
```

### Props
- `Carousel`: `orientation` (`horizontal` default | `vertical`), `loop` (default false), `autoplay` (`boolean | number` ms; `true` = 5000), `onIndexChange(index)`, `aria-label`.
- `CarouselItem`: `basis` (CSS length) — or size with `className`.
- CSS knobs on the root: `--ui-carousel-gap` (1rem), `--ui-carousel-per-view` (1; set responsively with `sm:[--ui-carousel-per-view:2]`). Item `flex-basis = (100% - (per-view - 1) * gap) / per-view`.

### Behaviour
- Slides are direct children of the content track, `scroll-snap-align: start`, `scroll-snap-stop: always`.
- Stopping points: only slides that can be scrolled to the start position count (so with 2 per view and 5 slides there are 4 dots). One stop (everything fits): dots render nothing.
- Active position is derived from scroll position and refreshed by an `IntersectionObserver` on the slides (thresholds 0, .25, .5, .75, 1) plus resize, `scroll` (rAF) and `scrollend`. At the start it is 0, at the end the last stop, else the stop nearest the scroll position.
- Previous / Next scroll to the neighbouring stop (smooth; instant under reduced motion). At an end without `loop` the button is `aria-disabled="true"` (still focusable) and does nothing. With `loop` they never disable and wrap (a rewind).
- Dots scroll to their stop; the active dot has `aria-current="true"`.
- Keyboard: ArrowLeft/Right (ArrowUp/Down when vertical) anywhere inside the carousel (not in inputs, textareas, selects, contenteditable) moves one stop and prevents the default scroll.
- Autoplay: every interval, advance one stop (rewinding at the end). Skipped while the pointer is over the carousel, focus is inside it, the document is hidden, or reduced motion is on.
- Slides get `aria-label="n of m"` set after mount and when children change, unless the author passes `aria-label`.

### Visual rules
- Viewport radius `--radius-lg`, scrollbar hidden, focus ring on `:focus-visible`.
- Nav buttons: 32px round outline buttons floating over the track edges (left/right .75rem, vertically centred; nudged up by 1.25rem when dots exist), `--ui-shadow-md` (floating layer), no shadow when disabled. Vertical carousels place them top/bottom centred.
- Dots: 24px hit area, 8px dot in `--ui-border-strong`; active is a 20px pill in `--ui-primary`. Vertical: dots stack on the right.

### Motion
- Active dot width transitions on `--ui-spring-snappy`; colours on `--ui-duration-fast`.
- Scrolling is the browser's smooth scroll. Reduced motion: instant jumps, autoplay off.

### Accessibility
- WAI-ARIA carousel pattern: region + `aria-roledescription="carousel"`, slides `role="group"` + `aria-roledescription="slide"` + "n of m".
- The track is focusable (`tabindex=0`) so keyboard users can always scroll it.
- Dots are real buttons with names; buttons keep focus at the ends (`aria-disabled`).

### Acceptance checks
- N slides produce N labels "1 of N" … "N of N".
- Clicking Next scrolls the track and moves `aria-current` to the next dot; Previous is `aria-disabled` at the start and Next at the end.
- Arrow keys move the carousel; dots navigate directly.
- `loop`: Next on the last stop returns to the first.
- No serious axe violations in light and dark.
