# Authoring components

How every ui-kit component is built. Follow it exactly so the library stays consistent.
Reference implementations: **Button** (simple) and **Dialog** (stateful overlay).

## 1. Files per component

| What | Where |
|---|---|
| Styles | `packages/ui/src/styles/components/<name>.css` — add an `@import` to `styles/kit.css` |
| Component | `packages/ui/src/components/<name>/<name>.tsx` + `index.ts` — add to `src/index.ts` |
| Unit tests | `packages/ui/src/components/<name>/<name>.test.tsx` (logic only) |
| Prompt spec | `prompts/components/<name>.md` |
| Docs examples | `apps/docs/examples/<name>/<example>.tsx` (default export) |
| Docs page | `apps/docs/app/docs/components/<name>/page.tsx` + entry in `apps/docs/lib/registry.ts` |
| Browser tests | `tests/<name>.spec.ts` |

One component family per file, no file over 500 lines (split helpers into `src/lib` or `src/hooks`).

## 2. Spec first

Before code, write `prompts/components/<name>.md`: anatomy, props, behaviour, visual rules (exact values),
motion, accessibility (the WAI-ARIA APG pattern), acceptance checks. The prompt, the docs and the tests are
all derived from it.

## 3. CSS rules

- Everything inside `@layer components { … }`; class names `ui-<component>` / `ui-<component>-<part>`.
- Plain CSS reading **semantic tokens only**: `var(--ui-surface-raised)`, `var(--ui-muted-foreground)`,
  `var(--ui-destructive-text)`… Never palette tokens (`--ui-gray-200`), hex, or Tailwind palette colours.
- Fill vs text: use `--ui-<status>` for fills (with `-foreground` on top) and `--ui-<status>-text` for text
  on surfaces. Every pair is measured ≥ 4.5:1 — don't invent new combinations without measuring.
- Radii `var(--radius-sm|md|lg|xl)`; shadows only on floating layers.
- State hooks: `[data-state="open|closed"]`, `[aria-*]`, `:disabled`. No `.is-*` classes.
- Motion: list exact properties in `transition` (never `all`). Tweens use `--ui-duration-*` +
  `--ui-ease-*`; physical movement uses a spring (`--ui-spring-snappy|smooth|morph` with its `-duration`).
  Entrances `ui-pop-in` / `ui-rise-in`, exits `ui-pop-out` / `ui-fade-out` (faster than entrances).
- Hover styles inside `@media (hover: hover) and (pointer: fine)`.
- Keyboard focus: `:focus-visible` ring `0 0 0 3px color-mix(in oklch, var(--ui-ring) 45%, transparent)`.

## 4. React rules

- `'use client'` at the top of any file with state, effects, refs used for behaviour, or event handlers.
  Purely presentational components stay Server Component–safe.
- `forwardRef`, spread native props, merge `className` with `cn()`. Never drop a consumer's prop.
- Stateful: controlled **and** uncontrolled via `useControllableState` (`open`/`defaultOpen`/`onOpenChange`,
  `value`/`defaultValue`/`onValueChange`).
- Exit animations: `usePresence(open)` keeps the node mounted until its CSS animation ends.
- Floating panels: render with `popover="manual"` + class `ui-floating`, position with `useFloating`,
  close with `useDismiss`. Keyboard lists: `useRovingFocus`.
- Triggers accept `asChild` (via `Slot`). Remember Safari/Firefox don't focus buttons on click — keep a ref
  to the trigger when focus has to return to it.
- Ids from `useId()`; ARIA wiring only when the referenced element is rendered.
- No `window`/`document` during render (SSR). Use effects or `useIsomorphicLayoutEffect`.
- Zero runtime dependencies besides React.

## 5. Docs page

- Use `DocPage`, `Section`, `P`, `List`, `Code`, `PropsTable`, `KeyTable` from `@/components/docs/doc`.
- Each example: a file in `examples/<name>/`, rendered through
  `<Example component="<name>" file="<name>/<example>" title="…"><ExampleComponent /></Example>`.
  The Code tab shows that file verbatim; the Prompt tab is generated from the spec + sources.
- Sections, in order: first example, When to use (and when not), variants/features, API, Keyboard,
  Accessibility, Motion.
- Realistic copy (names, amounts, dates), sentence case, no lorem ipsum.

## 6. Done means

1. `npm run build -w ui-kit` and `npx tsc -p apps/docs/tsconfig.json --noEmit` pass.
2. `npm test` (Vitest) passes.
3. `npx playwright test` passes in Chromium, WebKit, Firefox, iPhone and Pixel profiles, including axe in
   light and dark.
4. Prompt verified: export the Recreate prompt (`/prompts/<name>/<example>/recreate.txt`), give it to a
   fresh agent with no repo access, write its output to `apps/verify/output/`, run
   `node scripts/prompt-verify/compare.mjs <name>/<example>` → PASS.
5. Light, dark and at least one saturated accent checked by eye at 1440px and 390px.
