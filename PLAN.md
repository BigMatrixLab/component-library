# ui-kit — Plan

Status: **approved 2026-11-24** — Phase 0 built, in review (see §9)
Scope: our own long-lived component library for **React and Next.js**, independent of any company project, published to npm later.

---

## 1. Goal

A component library we own end to end: modern, calm, professional, with a recognisable but subtle motion signature, built for React and Next.js. No Radix, no MUI, no chart library, no animation library: React is the only peer dependency.

Success looks like:

- Every everyday component a product needs (forms, overlays, navigation, data, feedback) plus charts, dashboard and page blocks.
- One look and one motion language across all of it, in light and dark, with switchable themes.
- Each component typed, documented, keyboard-accessible, tested in real browsers, and shipped with an AI prompt that reproduces it.
- Stable enough that apps can depend on it for years.

---

## 2. Research — what the references do

Researched in Chrome on 2026-11-24: UI Arc, Astryx (Meta), Sonner, shadcn/ui, Basecoat.

| Reference | What it is | What we take | What we leave |
|---|---|---|---|
| **UI Arc** (uiarc.dev) | React library, 254 animated components, 144 blocks, shadcn registry, MCP server | Calm motion with named presets (snappy / smooth / morph); per-component docs with *when to use / when not / keyboard / accessibility / motion / responsive / performance*; `llms.txt` + per-component markdown for AI agents; design rules (semantic tokens only, accent used sparingly, shadows only on floating layers, concentric radii, tabular numbers that roll) | The `motion` dependency; banning 600/700 weights outright |
| **Astryx** (astryx.atmeta.com) | Meta's open design system, 150–190 components, React + StyleX, beta | **Graduated customisation**: as-is → tokens → classes → own CSS → eject source; full **theme packs** (Neutral, Stone, Gothic, Matcha, Y2K…) that change type, radius and colour; prebuilt stylesheet *or* source build; one showcase page rendering every theme; CLI for docs and upgrades | StyleX; huge scope on day one |
| **Sonner** (sonner.emilkowal.ski) | The reference toast | Stacked toasts that expand on hover, swipe direction per position, `visibleToasts`, rich colours, close button, promise and action toasts, headless mode | — (we build our own to the same bar) |
| **shadcn/ui** | De-facto standard component set + charts + blocks | The baseline **component inventory** (~70); token names (`--background`, `--primary`, `--muted-foreground`…); chart catalogue (area, bar, line, pie, radar, radial + tooltip); blocks (dashboard, sidebar, login, signup); registry so `npx shadcn add` can install items | Radix and Recharts dependencies; copy-paste as the only distribution |
| **Basecoat** (basecoatui.com) | shadcn look without React | Per-component CSS imports; style packs (vega, nova, maia…); RTL support | Inline-positioned popovers; Chart.js dependency |

**Where we stand apart:** zero-dependency React components including charts and toasts, top-layer overlays, a consistent motion signature, Arc-level "delight" components, blocks, and verified AI prompts for every piece.

---

## 3. Decisions

| # | Decision | Choice |
|---|---|---|
| — | Prefix | `ui`: CSS classes `.ui-btn`, variables `--ui-primary` |
| — | Styling | Tailwind v4. Component classes live in `@layer components`, so any utility in `className` overrides them (no `tailwind-merge` needed) |
| — | Charts / motion / toasts | Our own, zero dependencies |
| D1 | Markup style | Explicit part classes (`.ui-card-title`) |
| D2 | Visual rules | Softer Arc rules: no gradients inside components, shadows only on floating layers; 600 allowed for headings; subtle gradients only in marketing blocks |
| D3 | Fonts | **System font stack** (chosen 2026-11-24): zero download, native feel; overridable via `--ui-font-sans` / `--ui-font-display` |
| D4 | Themes | Accent presets now; full theme packs in Phase 4 (token layer designed for packs from day one) |
| D5 | Framework | **React and Next.js only**: native React components |
| D5a | Language | **TypeScript** |
| D6 | Browser tests | Chromium + WebKit + Firefox |
| D7 | Git | `git init`; first commit after Phase 0 is approved |
| D8 | npm name | Decided in Phase 6 |
| D9 | AI prompts | Tool-agnostic, verified with Claude |

---

## 4. Architecture

npm workspaces monorepo:

```
packages/ui/                 the library (published)
  src/styles/
    tokens/                  palette (raw) → semantic roles → theme packs
    base.css  motion.css
    components/*.css         one file per component, ui-* classes
    kit.css                  everything except Tailwind (for apps already on Tailwind)
    styles.css               Tailwind + kit (prebuilt for apps without Tailwind setup)
  src/components/<name>/     <Name>.tsx, index.ts (one component per file, < 500 lines)
  src/hooks/                 our own primitives (see below)
  src/charts/                SVG chart engine
  src/icons/                 built-in stroke icon set as React components
  src/lib/                   cn(), Slot (asChild), types
apps/docs/                   Next.js (App Router) documentation site
prompts/                     system.md, components/*.md, blocks/*.md
tests/                       Playwright (interaction, axe, visual) + Vitest unit tests
```

**Our own primitives (replacing Radix):** `useControllableState` (controlled/uncontrolled), `usePresence` (keeps an element mounted for its exit animation), `useFloating` (top-layer positioning: flip, shift, origin), `useDismiss` (outside click, Esc), `useFocusTrap`, `useRovingFocus` + typeahead, `useId`, `Slot` for `asChild`, `Portal`.

**API conventions:**

- Flat named exports that compose: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`… (tree-shakeable).
- Controlled and uncontrolled: `open` / `defaultOpen` / `onOpenChange`, `value` / `defaultValue` / `onValueChange`.
- Every component accepts `className` and forwards `ref` and native props; `asChild` where it makes sense.
- State exposed as `data-state` / ARIA attributes so it can be styled.
- **Next.js:** presentational components (Card, Badge, Separator, Kbd, Table…) are Server Component–safe; interactive ones carry `'use client'`. No `window` access during render, so SSR and hydration are clean.

**Build & distribution:** `tsup` (esbuild) → ESM + `.d.ts`, `'use client'` banners preserved per file, per-component entry points (`ui-kit/button`), prebuilt `styles.css` and source `kit.css`. Dev-only dependencies: TypeScript, tsup, Tailwind, Vitest + Testing Library, Playwright, axe-core.

**Graduated customisation** (from Astryx): use as-is → change tokens → `className` utilities → own CSS on `ui-*` classes → copy the component source (registry, Phase 6).

---

## 5. Design language

- **Tone:** calm, neutral surfaces; colour spent on intent (active item, selection, primary action, the one chart series that matters).
- **Tokens:** two layers. Raw palette (`--ui-gray-50…950`, accent scales) → semantic roles (`--ui-background`, `--ui-surface`, `--ui-muted-foreground`, `--ui-border-subtle`, `--ui-control-*`, `--ui-series-1…6`). Components read only semantic roles; themes swap the map.
- **Type:** a defined scale (12/13/14/15/17/20/24/28/34/40), tabular numbers for anything that changes, tight tracking on large headings only.
- **Surfaces:** cards rest on a 1px border; shadows only on floating layers (menus, popovers, dialogs, toasts). Concentric radii (inner = outer − padding).
- **Spacing:** 4px grid. Control heights 32 / 36 / 44 (44 default touch target on phones).
- **Icons:** built-in stroke set (Lucide shapes, ISC), 16/20/24.
- **Motion signature — "soft rise":** entrances rise 4–8px with a light blur and scale ≥ .96, under 400ms; exits faster than entrances. Presets: `snappy` (press, small indicators), `smooth` (panels, height, never overshoots), `morph` (gliding highlights, width that follows content). Numbers roll, highlights glide between options, nothing resizes in one frame. CSS transitions/keyframes and the Web Animations API only. Reduced motion: the state changes, the movement doesn't.

---

## 5a. AI design prompts (every component and block)

Every docs example has three tabs: **Preview**, **Code**, **Prompt**. Copy the prompt, paste it into any AI tool and get the same component.

1. **System prompt** (shared, per library version): the design language in exact values — tokens, type, radii, spacing, motion presets, API conventions, accessibility rules. Paste once per chat or keep it in a project's `CLAUDE.md` / Cursor rules.
2. **Component prompt:** role, goal, anatomy, exact JSX/class contract, props, states, keyboard map, ARIA pattern, motion values, responsive rules, acceptance checks, expected output format.

| Mode | Contains | Result |
|---|---|---|
| **Recreate** | Spec + the exact reference code as the target | Identical to our output |
| **Adapt** | Spec only, with slots for your content/variant | Same design language and behaviour with your content; small layout differences are possible because AI output is not deterministic |

The output (preview + code) sits beside the prompt. Prompts live in `prompts/` (versioned with the code), render in the docs Prompt tab with a copy button, and are published in `llms.txt`.

**Verified, not assumed:** each prompt is run by a fresh AI agent with no access to our repo; its output is rendered with Playwright and compared with our reference (visual diff + the same interaction tests). A prompt ships only when it passes.

---

## 6. Phases

Each phase ends with a review gate: you look at the docs pages, I fix what you flag, then the next phase starts.

### Phase 0 — Foundation
Monorepo + build (tsup, Tailwind, per-component entries); tokens (2 layers) and typography; motion presets; base styles; primitives (`useControllableState`, `usePresence`, `useFloating`, `useDismiss`, `useFocusTrap`, `useRovingFocus`, `Slot`, `Portal`); icons; Next.js docs site (Preview / Code / Prompt tabs, sidebar, search, theme + accent switcher); **test harness** (Vitest + Playwright in 3 engines + axe + visual snapshots); **AI prompt system** (`prompts/system.md`, template, verification script); font decision (D3). Proven end to end on **Button** and **Dialog**. Port what is useful from the current vanilla draft (tokens, motion, CSS classes, positioning maths, icons).

### Phase 1 — Core primitives (≈ 30)
Button · Button group · Badge · Avatar (+ group) · Kbd · Separator · Card · Label / Field (hint, error, form layout) · Input · Input group · Textarea · Native select · Checkbox · Radio group · Switch · Slider · Progress (linear, circular) · Spinner · Skeleton · Alert · Tooltip · Popover · Dialog · Alert dialog · Sheet / Drawer · Dropdown menu · Tabs · Accordion / Collapsible · **Toast** (Sonner-grade)

### Phase 2 — Composite components (≈ 30)
Select · Combobox · Multi-select · Command palette · Context menu · Hover card · Menubar · Navigation menu · Calendar · Date picker · Date range picker · Time picker · Input OTP · Number input · Tag input · File dropzone · Rating · Toggle / Toggle group / Segmented control · Breadcrumb · Pagination · Navbar · Sidebar · Stepper · Timeline · Carousel · Scroll area · Resizable panels · Empty state · Item / List

### Phase 3 — Data & charts
Table · Data table (sort, filter, select, paginate, column visibility) · Description list · Copy button · Stat / Metric card · Animated counter · **Chart engine**: line, area, bar (grouped / stacked / horizontal), donut / pie, radial / gauge, sparkline, then radar, activity heatmap, funnel · tooltip, legend, accessible data table

### Phase 4 — Theming & blocks
Theme packs + a page that renders every pack · Blocks: dashboard, auth (sign in / up / reset), settings, pricing, onboarding, landing sections (hero, features, testimonials, CTA, footer), 404 / 500 · App shell templates for Next.js

### Phase 5 — Signature / delight components (Arc-inspired, ours)
Save → Saved morphing button · Hold to confirm · Confirm morph · Billing toggle with rolling prices · Rolling numbers / slot text · Text shimmer · Inline edit · Password strength · Usage meter · Expanding search · Theme switch transitions · Announcement bar · Onboarding checklist

### Phase 6 — Distribution
npm package (semver, changelog), per-component entry points, shadcn-compatible registry (`npx shadcn add` installs our source), `llms.txt` + per-component markdown, optional CLI.

---

## 7. Definition of done (every component)

1. Spec written first: anatomy, variants, states, props, keyboard map, ARIA pattern (WAI-ARIA APG), motion, responsive behaviour.
2. CSS uses semantic tokens only; works in light, dark and every accent.
3. TypeScript types for every prop; controlled + uncontrolled where stateful; `ref` and `className` forwarded; file < 500 lines.
4. SSR-safe; correct `'use client'` placement; no hydration warnings in Next.js.
5. Keyboard + screen-reader behaviour matches the APG pattern; axe passes.
6. Tests: Vitest unit tests for logic; Playwright interactions in Chromium, WebKit and Firefox; visual snapshots at 1440px and 390px, light and dark.
7. Docs page: when to use / when not to, examples, API (props, data attributes, events), keyboard, accessibility, motion notes.
8. Reduced-motion branch checked.
9. AI prompt (Recreate + Adapt) written, shown with its output, and verified by a fresh agent + visual diff (§5a).

---

## 8. Ways of working

- **Research → spec → build → test → review**, one phase at a time; nothing in a phase starts until the previous gate is approved.
- Within a phase, components are built in parallel by agents with disjoint file ownership, following `AUTHORING.md`; I review every result before showing it to you.
- Each phase ends with a short report: what was built, test results per browser, what was not verified.

---

## 9. Phase 0 status (2026-11-24)

Built:
- Monorepo: `packages/ui` (tsup unbundled ESM + types + CSS, `'use client'` kept per file), `apps/docs` (Next.js 16), `apps/verify` (prompt sandbox).
- Tokens (2 layers, fill vs text roles, contrast measured ≥ 4.5:1 for every fill/text pair in light and dark and every accent), type scale, motion (real spring curves as CSS `linear()`), base.
- Primitives: `cn`, `Slot` (RSC-safe), `useControllableState`, `usePresence`, `useFloating` + `computePosition`, `useDismiss`, `useRovingFocus`, `useScrollLock`; icons; `ThemeScript` + `useTheme`.
- Components: Button (+ ButtonGroup), Dialog (alertdialog, sizes, phone docking).
- Docs: 10 pages, Preview / Code / Prompt tabs, theme + accent switcher, plain-text prompt route.
- Tests: Vitest (12) + Playwright (60 tests × Chromium, WebKit, Firefox, iPhone 15 Pro, Pixel 7) incl. axe light/dark.
- Prompt verification: blind agent → isolated sandbox → element-by-element style + pixel comparison.

D3 decided: system font stack. Phase 0 accepted; phases continue back to back (user instruction: keep going, use parallel agents).

Notes:
- The vanilla-JS draft is kept in `_reference/vanilla-draft/` until Phase 0 is approved, then deleted.
- Its unreviewed partial CSS (`description-list`, `kbd`, `progress`, `separator`, `spinner`, `stat`, `table`) is reference only for later phases.
- Git initialised; first commit after Phase 0 approval (D7).
