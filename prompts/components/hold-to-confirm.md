## Component: HoldToConfirm

Press and hold (pointer, or Space / Enter) to confirm a destructive action. A fill sweeps across while you hold, drains back if you release early, and a check pops on completion. A plain click never confirms.

### Anatomy
```
<Button class="ui-btn ui-btn-outline ui-hold" data-state="idle|holding|done" aria-describedby=desc>
  <span class="ui-hold-layer ui-hold-leaving" aria-hidden>previous label</span>   (mid-morph only)
  <span class="ui-hold-layer" data-enter>icon + label</span>                      destructive text on the surface
  <span class="ui-hold-fill" aria-hidden>                                         destructive fill, clip-path revealed
    <span class="ui-hold-layer">icon + label</span>                               same content, destructive-foreground text
  </span>
</Button>
<span id=desc class="ui-hold-sr">Press and hold for 1.2 seconds to confirm. Release early to cancel.</span>
<span class="ui-hold-sr" role="status" aria-live="polite">doneLabel (when done)</span>
```

### Props
- `onConfirm: () => void` — called once when the hold completes.
- `duration` — ms to hold, default **1200**.
- `doneLabel` — default "Deleted". `leadingIcon`. `description` — overrides the accessible description (default derives from `duration`).
- `resetAfter` — ms before returning to idle after done, default **1600** (0 keeps it done).
- `onHoldStart`, `onHoldCancel`.
- Everything else is `ButtonProps` (`variant` default `outline`, `size`, `disabled`, ref…) except `loading`, `asChild`, `icon`, `onClick`.

### Behaviour
- Hold starts on primary-button `pointerdown` (pointer capture on) or on `keydown` Space / Enter (not `repeat`). Releasing (`pointerup`, `pointercancel`, `lostpointercapture`, `keyup`), moving the pointer outside the button's rect, or `blur` cancels.
- Space and Enter default actions are prevented on keydown and keyup so no native click fires; `contextmenu` is prevented (long-press on touch).
- A click with `detail === 0` and no recent key event (assistive-technology activation) starts one full timed hold.
- Completion sets `data-state="done"`, calls `onConfirm`, announces `doneLabel`, then returns to idle after `resetAfter`.
- Colours: idle text `--ui-destructive-text` on the variant surface; fill `--ui-destructive` with `--ui-destructive-foreground` text — each half is a measured ≥ 4.5:1 pair.

### Motion
- **Press**: `data-state="holding"` scales the button to `.97` on `--ui-spring-snappy` (Button's own `:active` does the same for pointers; this covers keyboard).
- **Fill**: Web Animations API on `.ui-hold-fill`, `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, `duration` ms, `linear`, `fill: forwards`. Clip-path (not scaleX) so the label is never squashed. `finish` = complete.
- **Release early**: current progress `p = currentTime / duration`; animate clip-path from `inset(0 (1-p)*100% 0 0)` back to empty over `160 + 260·p` ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Done**: button keyframes `ui-hold-pop` 360ms ease-out (`.97 → 1.035 at 45% → 1`); label morph = width spring `--ui-spring-morph` 550ms + 2px-blur crossfade (220ms in / 160ms out); check draws in 320ms (120ms delay).
- **Reduced motion**: the fill still tracks the hold (it is the state); no press scale, no pop, no drain, no width animation; labels swap with a 1ms fade.

### Accessibility
- Native `<button>` with `aria-describedby` pointing at the hold instructions (visually hidden).
- Keyboard: Space / Enter (hold). Focus ring: destructive-tinted `0 0 0 3px color-mix(in oklch, var(--ui-destructive) 35%, transparent)`.
- Completion is announced via a polite live region.

### Acceptance checks
- A click (down and up within ~100ms) does not call `onConfirm` and leaves the fill empty.
- Holding for `duration` calls `onConfirm` exactly once and shows the done label with a full fill.
- Releasing at ~50% drains the fill back; `onHoldCancel` fires.
- Holding Space for `duration` confirms; keyup earlier cancels; blur cancels.
- The accessible description mentions the duration.
