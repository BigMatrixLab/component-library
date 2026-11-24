## Block: Onboarding

First-run setup for a product: a short wizard, the "getting started" home that follows it, and an optional split welcome with questions. An app block: library components (`Stepper`, `Field`, `Input`, `TagInput`, `RadioGroup`, `Checkbox`, `OnboardingChecklist`, `Card`, `Empty`, `Progress`, `Button`, `Badge`, `Icon`) plus Tailwind utilities. No new CSS.

### Variants
```
wizard            Stepper (3 steps) + one form per step: workspace name and address · invite teammates · plan and accent → finish screen
getting-started   welcome card with trial meter | OnboardingChecklist + Deployments card (Empty state) | Quick links + help card
split-welcome     brand panel (bg-primary) | progress bar + one question at a time (radio cards, checkbox cards) → finish screen
```

### Anatomy (wizard)
```
<section data-accent?>            @container rounded-2xl border bg-background, px 16 → 32px, py 32 → 48px
  <div>                           mx-auto max-w-2xl grid gap-8
    <header>                      logo mark (32px bg-primary, rounded-lg) + name · "Step n of 3" (13px muted, tabular)
    <Stepper value onValueChange aria-label="Workspace setup">
      <StepperItem step disabled={step > current}> Trigger > Indicator + Content(Title, Description) · Separator
    <div key={step}>              ui-animate-rise, rounded-xl border bg-card p-5 → p-8
      <form noValidate>           grid gap-6
        <h2 tabIndex=-1>          20px/600 font-display, then a 15px muted lead (max-w-prose)
        fields…
        actions                   border-t pt-5, flex wrap justify-between: Back (outline, arrow-left) | [Skip (ghost)] Continue (primary, arrow-right)
```
Steps:
1. **Workspace**: `Field required` + `Input` name (autocomplete organization). `Field required` + `InputGroup` (`InputAddon` "halcyon.app/" + `Input`) address, with `FieldHint`. The address is the slugified name until edited by hand.
2. **Team**: `Field` + `TagInput` (email `validate`, `maxTags` 10, `inputMode="email"`), `FieldHint`, `FieldError` fed by `onTagRejected`. "Invite as": horizontal `RadioGroup` Member / Admin with descriptions. Primary label becomes "Send N invites"; "Skip for now" shows only while the list is empty.
3. **Plan**: `RadioGroup variant="card" orientation="horizontal"` (Hobby $0 · Pro $20 · Team $45, name left, price right, muted). Accent: horizontal `RadioGroup` whose labels carry a 14px dot `<span data-accent={id} class="bg-primary">`; the choice is written to the section's `data-accent`, so the whole block previews it.
4. **Finish** (step 4, all stepper steps complete): `ui-stagger` column: 48px `bg-success` disc with a check and `ring-8 ring-success/15`, h2 "{name} is ready" (24px), a one-line summary, a bordered `<dl>` (Address, Invites with a role Badge, Plan) that becomes two columns from 28rem, then "Open your dashboard" (link, primary) and "Change something" (outline).

### Anatomy (getting-started)
- Welcome `Card` (p-5 → p-8, grid, from 48rem `1fr 16rem`): eyebrow in `text-primary-text`, h2 24 → 28px, lead, Tour (primary, sparkles) + Read the docs (outline link). Trial panel: rounded-lg border bg-background p-4, "2 of 14 days", `Progress size="sm"` with `getValueText`.
- Below, from 48rem `1.6fr 1fr`. Left: controlled `OnboardingChecklist headingLevel={2}` (5 steps, each with an `xs` outline action that marks it done; `onDismiss` swaps it for a one-line "Setup finished" row with "Show checklist"), then a Deployments `Card` with `Empty variant="dashed"` whose two actions also tick checklist steps; once deployed it shows one row (icon tile, name, commit, `Badge variant="success"` Ready, "Just now"). Right: Quick links card (`<nav>` list: 32px bordered icon tile, title, one-line description, arrow-up-right) and a `Card variant="muted"` help card.

### Anatomy (split-welcome)
- `@container overflow-hidden rounded-2xl border`; from 48rem a `5fr 7fr` grid with min-height 36rem.
- Aside: `bg-primary text-primary-foreground p-6 → p-10`, logo (inverted), h2 24 → 28px, lead at 90% opacity; the perks list (check icons) shows only from 48rem.
- Main: "Question n of 3" + "Skip for now" (link button) over a `Progress size="sm"` whose value is the number answered. Then `<form key={question}>` (ui-animate-rise): h3 question (`tabIndex=-1`, names the group), the options, an inline error (`role="alert"`, destructive text, circle-alert icon), and the Back / Continue row.
- Questions: role (`RadioGroup variant="card"`, 4 with descriptions), team size (`variant="card" orientation="horizontal"`, 4 short labels), goals (`Checkbox variant="card"` ×4 in a `role="group"`, at least one).
- Finish: success disc with sparkles, h3, the answers as rounded-full chips, "Go to dashboard" + "Edit answers".

### Behaviour
- Validation runs on submit; after the first failed Continue, errors update as you type. Focus goes to the first invalid control.
- Workspace: name ≥ 2 characters; address `^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$`, and reserved names (`acme`, `halcyon`, `admin`) say "is taken".
- Invites: Enter, Tab or comma adds; an invalid address stays in the field, shows an error, and blocks Continue until fixed or cleared.
- Stepper: steps before the current one are buttons that go back (values are kept); later ones are disabled. On the finish screen all are disabled.
- When the step or question changes (not on first render), focus moves to its heading.

### Visual rules
- Body copy left-aligned, max-w-prose; never balanced or centred. Headings `font-display`, 600, `tracking-tight`.
- One primary action per step, on the right; Back always outline on the left.
- Semantic colours only; the accent dots get their colour from a scoped `data-accent`, never palette values.
- No shadows on in-flow cards and no gradients; the only large colour fill is the split-welcome panel (`bg-primary`).

### Motion
- Step panels and questions: `ui-animate-rise` keyed on the step. Finish screens: `ui-stagger`. Stepper line and check use the component's own spring.
- Reduced motion: content swaps in place.

### Accessibility
- Stepper `aria-label`, `aria-current="step"`, "(completed)" on done steps. Fields wired by `Field` (label, hint, `aria-invalid`, `role="alert"` error).
- Radio and checkbox groups are named by their visible label (`aria-labelledby`) and described by the error when present.
- Progress bars and the checklist ring carry `aria-label` and a text value.

### Responsive
- 360px: single column; the stepper shows only the current step's text; actions wrap; finish buttons stack.
- Container queries, not viewport: `@md` (28rem) summary grid and side-by-side buttons, `@2xl` (42rem) larger padding, `@3xl` (48rem) two columns.

### Acceptance checks
- Wizard: Continue on an empty name shows the error and focuses the name; a valid name and address advances; Back returns with values kept; finishing shows "{name} is ready" with all three steps complete.
- An invalid invite address blocks Continue with an error; a valid list changes the button to "Send N invites".
- Getting started: an action or the empty-state button raises the checklist count (`aria-valuenow`); all five done shows the complete title and Dismiss.
- Split welcome: Continue with nothing picked shows the error; three answers end on the summary chips.
- No horizontal overflow at 360px; axe reports no serious violations in light and dark.
