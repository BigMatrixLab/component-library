## Component: Resizable panels

Panels separated by draggable, keyboard-operable dividers; sizes are percentages of the group.

### Anatomy
```
<ResizablePanelGroup>   <div role="group" class="ui-resizable-group" data-direction data-dragging data-snapping>   (flex, 100% × 100%)
  <ResizablePanel />      <div id class="ui-resizable-panel" data-panel-id data-collapsed style="flex: <size> 1 0px">   (overflow hidden)
  <ResizableHandle />     <div role="separator" tabindex="0" class="ui-resizable-handle" data-direction>
                            optional <span class="ui-resizable-grip"> with a grip-vertical icon
  <ResizablePanel />
```
A handle must be the direct sibling between two panels (neighbours are read from the DOM).

### Props
- `ResizablePanelGroup`: `direction` (`horizontal` default | `vertical`), `id` (persist key), `onLayout(sizes: number[])`.
- `ResizablePanel`: `defaultSize` (%), `minSize` (0), `maxSize` (100), `collapsible` (false), `collapsedSize` (0), `onResize(size)`, `id`.
- `ResizableHandle`: `withHandle` (grip), `aria-label` (default "Resize panels").

### Behaviour
- Panels register with the group (lazily read constraints; registration only changes when panels are added/removed). Layout = saved layout if valid, else the default sizes (missing ones share the rest; everything is scaled to total 100). Before hydration, panels render `flex: <defaultSize> 1 0px`.
- Persistence: only when the group has an `id`. Key `ui-resizable:<id>`, value JSON array of sizes (document order). Restored on mount if it has the right length, finite numbers and sums to ~100. Saved when a drag or key press ends. All storage access is in try/catch.
- Pair resize: moving a divider changes only the two adjacent panels (their sum is constant) and respects both panels' min/max. A collapsible panel snaps to `collapsedSize` when its wanted size is below `collapsedSize + (min - collapsedSize) / 2`.
- Pointer: `pointerdown` captures the pointer and focuses the handle; each move recomputes from the start layout: `delta % = pixel delta / total pixel size of panels * 100`. `pointerup`/`cancel` ends the drag and saves. The group gets `data-dragging` (user-select none, col/row-resize cursor).
- Keyboard on the handle: arrows ±5% along the axis (Left/Right for horizontal groups, Up/Down for vertical), Home/End move to the lowest/highest size of the previous panel the neighbours allow, Enter toggles the collapsible neighbour (restoring its previous size, or its minimum).

### ARIA
- `role="separator"`, `aria-orientation` perpendicular to the group direction (`vertical` for side-by-side panels), `aria-valuenow` = previous panel's size in % (rounded to .01), `aria-valuemin` / `aria-valuemax` = limits that panel can reach given both panels' constraints, `aria-controls` = the previous panel's id.

### Visual rules
- Handle: 1px line in `--ui-border`; hover `--ui-border-strong`; focus-visible and dragging `--ui-ring` with a 1px ring so it reads as 3px. Invisible hit area 8px (24px on `(pointer: coarse)`). `touch-action: none`.
- Grip: 14×24px (swapped for vertical), `--ui-surface-raised`, 1px border, radius `--radius-sm`, muted icon, rotated 90° for vertical.
- Panels: `min-width/height: 0`, `overflow: hidden`. No shadows.

### Motion
- Dragging has no easing. While `data-snapping` (keyboard collapse/restore, 700ms) panels transition `flex-grow` on `--ui-spring-smooth`. Reduced motion: instant.

### Accessibility
- WAI-ARIA window splitter pattern (focusable separator, arrow keys, Home/End, Enter to collapse).
- Pointer capture keeps the drag alive outside the handle; touch hit area enlarged.

### Acceptance checks
- Default sizes render proportionally (e.g. 20/36/44).
- Dragging a handle by N px changes the neighbours by N / available px; limits are respected.
- ArrowRight on a horizontal handle raises `aria-valuenow` by 5; Home / End reach `aria-valuemin` / `aria-valuemax`.
- Enter collapses and restores a collapsible neighbour.
- With an `id`, a reload restores the layout.
- No serious axe violations in light and dark.
