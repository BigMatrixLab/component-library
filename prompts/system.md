## Design system: ui-kit

Stack: React 18/19 + TypeScript + Tailwind CSS v4. No other runtime libraries (no Radix, no Motion, no clsx, no tailwind-merge, no icon packages).

### Visual language
- Calm, neutral surfaces. Colour is spent on intent only: the primary action, the active/selected item, focus, status, the one chart series that matters.
- Read colours **only** from the semantic tokens below (`var(--ui-primary)`, `bg-card`, `text-muted-foreground`…). Never hex, never Tailwind palette colours like `blue-500`.
- Cards rest on a 1px `--ui-border`. Shadows only on floating layers: menus, popovers, dialogs, toasts.
- Corners come from `--ui-radius` (`rounded-sm|md|lg|xl`). A nested corner = outer radius − padding.
- Type scale (px): 12 / 13 / 14 (body) / 15 / 17 / 20 / 24 / 28 / 34 / 40 → `text-xs` … `text-5xl`. Weights 400 and 500; 600 only for headings. Numbers that change use `tabular-nums`.
- Spacing on a 4px grid. Control heights: 28 (xs), 32 (sm), 36 (default), 44 (lg).
- Sentence case for all UI copy.

### Motion — "soft rise"
- Entrances rise 4–8px with `scale ≥ .96` and a 2–4px blur that clears, under 400ms, `var(--ui-ease-out)`.
- Exits are faster than entrances (`--ui-duration-exit`, `var(--ui-ease-in)`).
- Spring presets (CSS `linear()` curves, use with their `-duration` variable): `--ui-spring-snappy` (presses, small indicators), `--ui-spring-smooth` (panels, height, never overshoots), `--ui-spring-morph` (gliding highlights).
- Presses scale to .97 (icon buttons .94). A button that opens a popup does not scale.
- Animate only `transform`, `opacity`, `filter` (size only when the size change is the information).
- `prefers-reduced-motion: reduce` keeps the state change and drops the movement.

### Component conventions
- Styles are plain CSS classes named `ui-<component>` / `ui-<component>-<part>` inside `@layer components`, so any Tailwind utility in `className` overrides them.
- State is exposed as `data-state="open|closed"`, `aria-*` and `:disabled` — never `.is-active` classes.
- Every component forwards `ref`, `className` and native props. Stateful components are controlled **and** uncontrolled (`open`/`defaultOpen`/`onOpenChange`, `value`/`defaultValue`/`onValueChange`). `asChild` renders the child element instead.
- Interactive components start with `'use client'`; presentational ones stay Server Component–safe.
- Accessibility follows the WAI-ARIA Authoring Practices pattern for the component. Keyboard focus shows a ring (`:focus-visible`); pointer focus does not.
- Icons: 24×24 stroke icons (Lucide shapes), `stroke-width: 1.75`, `currentColor`, `aria-hidden` unless labelled.
