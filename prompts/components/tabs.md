## Component: Tabs

Switch between views in place. One indicator element glides between the triggers.

### Anatomy
```
<Tabs variant orientation activationMode value|defaultValue onValueChange>   div.ui-tabs
  <TabsList>                       div.ui-tabs-list role="tablist" (position: relative, scrolls)
    <TabsTrigger value>            button.ui-tabs-trigger role="tab" data-value
    span.ui-tabs-indicator         ONE element, role="presentation" aria-hidden
  <TabsContent value forceMount?>  div.ui-tabs-content role="tabpanel" tabIndex 0
```

### Props
- `Tabs`: `value`, `defaultValue`, `onValueChange`; `variant` (`segmented` default | `underline` | `pills`); `orientation` (`horizontal` | `vertical`); `activationMode` (`automatic` default | `manual`).
- `TabsTrigger`: `value` (required), `disabled`. `TabsContent`: `value`, `forceMount` (keep hidden panel mounted).

### Behaviour
- Inactive panels are not rendered unless `forceMount`. Ids come from `useId()` + a sanitised value; `aria-controls` is set only on the selected trigger (its panel exists).
- Roving tabindex: selected trigger `0`, others `-1`; if none is selected the first enabled trigger is `0`.
- Keyboard (APG): arrows along the orientation (wrapping), Home/End, disabled triggers skipped. `automatic`: focus selects. `manual`: Enter/Space selects (native button click). No typeahead.
- Indicator (`useIndicator`): in a layout effect measure the selected trigger (`offsetLeft/Top/Width/Height`) and write `--ui-tab-x/y/w/h` on the list; set `data-ready` after the first measure and `data-animate` two animation frames later. Re-measure on value change and with a ResizeObserver on the list and its children. If the list overflows, scroll the selected trigger into view horizontally (never the page).
- Before `data-ready` (SSR, first paint) the selected trigger carries the highlight itself, so nothing jumps when the indicator appears.
- Panels animate in only after the first value change (`data-interacted` on the root).

### Visual rules
- List: no wrap, `overflow-x: auto`, scrollbar hidden. Trigger 14px/500, `--ui-muted-foreground`, selected `--ui-foreground`.
- Segmented: list padding 3px, gap 2px, `--radius-lg`, `--ui-surface-muted` track; trigger 30px high, 14px padding; indicator `--ui-surface-raised`, `--radius-md`, `--ui-shadow-sm` + 1px `--ui-border-subtle` ring (dark: foreground 14% over the track).
- Underline: gap 4px, 1px `--ui-border` line along the list (inset shadow), trigger 40px high 12px padding; indicator 2px `--ui-primary` at the bottom (vertical: at the inline end).
- Pills: gap 4px, trigger 32px, fully rounded; indicator `--ui-accent`; selected text `--ui-accent-foreground`.
- Vertical: list is a column (segmented 192px wide), panel to the right with 24px gap.
- Panel: no outline; focus ring `0 0 0 3px` ring 45%.

### Motion
- Indicator: `transform`, `width`, `height` on `--ui-spring-morph` / `--ui-spring-morph-duration`; none on first render; reduced motion jumps.
- Panel: `ui-rise-in` 220ms `--ui-ease-out` (only after interaction).

### Accessibility
- WAI-ARIA tabs pattern. `aria-orientation` on the tablist; give the list an `aria-label` when its purpose is unclear.

### Acceptance checks
- The indicator box matches the selected trigger box after every change (also after resize and when scrolled).
- Arrow/Home/End keys move and select; manual mode needs Enter/Space; disabled tabs are skipped.
- Narrow screen: the list scrolls and the selected tab is visible.
