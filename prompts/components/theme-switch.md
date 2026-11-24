## Component: ThemeSwitch

A light / dark / system control: three icons in a pill-shaped segmented group with one gliding highlight. Uses `useTheme()`. Optionally reveals the new theme as a circle growing from the clicked option (View Transitions API).

### Anatomy
```
<div class="ui-theme-switch [ui-theme-switch-sm]" role="radiogroup" aria-label="Theme" data-ready data-animate>
  <span class="ui-theme-switch-pill" aria-hidden></span>
  <button class="ui-theme-switch-item" role="radio" aria-checked aria-label="Light"  title="Light"  tabindex>sun</button>
  <button class="ui-theme-switch-item" role="radio" aria-checked aria-label="Dark"   title="Dark"   tabindex>moon</button>
  <button class="ui-theme-switch-item" role="radio" aria-checked aria-label="System" title="System" tabindex>monitor</button>
</div>
```

### Props
- `reveal` — circular reveal, default **true**; instant swap where unsupported or under reduced motion.
- `size` — `md` (28px options, default) or `sm` (24px). On coarse pointers options are 36px.
- `label` — group name, default "Theme". Plus `HTMLAttributes<HTMLDivElement>` and ref.
- Reads `mode` and calls `setMode` from `useTheme()`; options in order Light, Dark, System.

### Visual rules
- Group: `inline-flex`, padding 2px, gap 2px, 1px `--ui-border`, fully rounded, `--ui-surface-muted`.
- Pill: `--ui-background` with `--ui-shadow-sm` (dark: `color-mix(in oklch, var(--ui-foreground) 14%, var(--ui-surface-muted))`, no shadow). Selected icon `--ui-foreground`, others `--ui-muted-foreground`. Icons 16px (14px at `sm`).
- Before the pill is measured (SSR) the selected option carries the highlight itself.

### Behaviour
- Radio group with a roving tabindex (selected option = the one tab stop). Arrow keys / Home / End select (selection follows focus); click selects.
- Selecting the current mode does nothing.
- **Reveal**: if `reveal`, `document.startViewTransition` exists and reduced motion is off: set `<html data-ui-reveal>`, start the transition with `setMode(next)` as the update, then on `ready` animate `html` with `{ clipPath: [circle(0px at x y), circle(R at x y)] }, { duration: 520, easing: cubic-bezier(0.22, 1, 0.36, 1), pseudoElement: '::view-transition-new(root)' }`. `R` = distance from (x, y) to the farthest viewport corner. (x, y) = pointer position, or the option's centre for keyboard activation. Remove `data-ui-reveal` when the transition finishes.
- CSS while `data-ui-reveal`: `::view-transition-old(root)` and `::view-transition-new(root)` have `animation: none; mix-blend-mode: normal`; old z-index 1, new z-index 2.

### Motion
- Pill: `useIndicator` writes `--ui-tab-x/y/w/h` on the group; the pill moves with `transform` + width/height on `--ui-spring-morph` (550ms). `data-ready` after the first measurement, `data-animate` two frames later so the first placement is not animated.
- Item press `scale(.92)` on `--ui-spring-snappy`; colour 150ms.
- **Reduced motion**: no view transition (instant swap), pill jumps, no press scale.

### Accessibility
- WAI-ARIA radio group: `role="radiogroup"`, `role="radio"`, `aria-checked`, roving tabindex. Icon-only options have `aria-label` and `title`. Focus ring `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)`.

### Acceptance checks
- Clicking Dark adds `dark` to `<html>` and `aria-checked="true"` moves; the pill's x offset changes.
- Arrow keys move the selection; only the selected option has `tabindex="0"`.
- With reduced motion no `data-ui-reveal` attribute is ever set.
- Works with every `data-accent`, light and dark.
