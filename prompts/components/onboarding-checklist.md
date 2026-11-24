## Component: Onboarding checklist

A card of setup steps with a progress ring (or bar). Steps tick off with a check that draws itself; the list collapses under the header; finishing the last step celebrates once, subtly. Completed steps are controlled or uncontrolled. A client component.

### Anatomy
- `<section class="ui-onboarding-checklist" aria-labelledby="<title id>" data-state="open|closed" data-progress="ring|bar" [data-complete] [data-celebrate]>`.
- `.ui-onboarding-checklist-header`:
  - ring layout: `.ui-onboarding-checklist-ring` > `ProgressCircle size="sm"` (40px) showing `<span class="ui-onboarding-checklist-ring-count">2/5</span>`, or when complete `svg.ui-onboarding-checklist-ring-check` (path `M6 12.5l4 4L18 8.5`, `pathLength=1`).
  - `.ui-onboarding-checklist-heading` > `h3.ui-onboarding-checklist-title` + `p.ui-onboarding-checklist-description`.
  - complete + `onDismiss`: ghost sm `Button.ui-onboarding-checklist-dismiss`.
  - collapsible: `button.ui-onboarding-checklist-toggle` (`aria-expanded`, `aria-controls` = list, `aria-labelledby` = title) > chevron-down `.ui-onboarding-checklist-chevron`.
- bar layout: `.ui-onboarding-checklist-bar` > `Progress size="sm"` + `.ui-onboarding-checklist-count` ("2/5", aria-hidden).
- `Collapse.ui-onboarding-checklist-body` (shared with Accordion: grid row 0fr ↔ 1fr, `hidden="until-found"` when closed) > `ol.ui-onboarding-checklist-steps`.
- Step `li.ui-onboarding-checklist-step[data-state="complete|incomplete"][data-current][data-disabled]`:
  - `.ui-onboarding-checklist-check` > `input[type=checkbox].ui-onboarding-checklist-input` (invisible, covers the indicator, 8px larger) + `.ui-onboarding-checklist-indicator` (aria-hidden; svg path `M4 8.5l2.5 2.5L12 5.5`, `pathLength=1`).
  - `.ui-onboarding-checklist-step-body` > `label.ui-onboarding-checklist-step-title` (for the input) + `.ui-onboarding-checklist-step-description`.
  - `.ui-onboarding-checklist-step-action` while not done.
- `span.ui-onboarding-checklist-sr[role=status]` announces "All steps complete".

### Props
- `title`, `description`, `steps: { id, title, description?, action?, disabled?, checkable? }[]`.
- `value` / `defaultValue` / `onValueChange` (completed ids, kept in step order); `onComplete` (once, on becoming complete, never on mount).
- `checkable` (true; `false` = the app marks steps done, indicators only, done steps get an sr-only "(Completed)").
- `collapsible` (true), `open` / `defaultOpen` (true) / `onOpenChange`.
- `progress`: `ring` (default) | `bar`. `completeTitle`, `completeDescription`, `onDismiss`, `headingLevel` (3), `labels` (`progress`, `count(done,total)`, `allComplete`, `completed`, `dismiss`).

### Behaviour
- Current step = first step not done and not disabled → `data-current` (soft highlight).
- Progress: `value=done`, `max=total`, `aria-valuetext` "2 of 5 steps complete", tone `success` when complete.
- Celebration state is derived during render when `complete` flips to true; `data-celebrate` stays 1200ms. Un-ticking a step returns to the normal state.

### Visual rules
- Card: 1px `--ui-border`, `--radius-xl`, `--ui-surface`, no shadow. Header padding 16px 12px 16px 20px, gap 14px. Title 15px/600 −0.01em; description 13px muted.
- Toggle 32px square, radius md, muted; hover `--ui-accent`. Chevron rotates 180° when open (snappy spring).
- List: padding 8px, top border `--ui-border-subtle`, 2px gap. Step: grid `20px 1fr auto`, gap 12px, padding 10px 12px, radius = card radius − 8px. Current: foreground 4% wash.
- Indicator: 20px circle, 1.5px `--ui-border-strong`; done: `--ui-control-on` disc, `--ui-control-glyph` check 14px stroke 2. Hover (fine pointer): border `--ui-ring`.
- Done title: muted colour, line-through in muted 70% (always present, transparent when not done, so it fades).
- ≤ 480px: action wraps under the text.

### Motion
- Tick: disc `scale(0 → 1)` on `--ui-spring-morph`, check `stroke-dashoffset 1 → 0` 320ms `--ui-ease-out` after 90ms. Un-tick reverses faster (`--ui-duration-fast`, ease-in). Transitions, so nothing replays on mount. Press: indicator `scale(.92)`.
- Finish (once): ring pops 1 → 1.08 → 1 (520ms), a success halo spreads 0 → 14px and fades (900ms, 120ms delay), the ring check draws (360ms, 160ms delay), title and description rise 6px with a 2px blur (380ms, stagger 35ms).
- Collapse: Accordion's grid-row animation (smooth spring open, 260ms close).
- Reduced motion: every celebration animation off; states change instantly.

### Accessibility
- `<section>` named by the title; steps are an ordered list. Each checkable step is a native checkbox labelled by its title (clicking the title toggles it) and described by its description.
- Collapse button: disclosure pattern (`aria-expanded`, `aria-controls`), named by the title.
- Completion is announced through a polite `role="status"` region.

### Acceptance checks
- Ticking a step updates `aria-valuenow` and the "n/total" count; the check draws; the title fades to muted with a strike.
- Ticking the last step sets `data-complete`, swaps the title to `completeTitle`, turns the ring success, announces "All steps complete" and calls `onComplete` once.
- The toggle collapses the list (hidden after the animation) and `aria-expanded` follows.
- Controlled `value` drives the steps; uncontrolled `defaultValue` seeds them.
