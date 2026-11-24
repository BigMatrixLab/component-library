## Component: Avatar

A person or account: an image with an initials fallback, optional presence dot, and overlapping groups. `Avatar`, `AvatarFallback`, `AvatarGroup` are Server Component–safe; `AvatarImage` is a client component (load errors).

### Anatomy
- `<span class="ui-avatar [ui-avatar-<size>] [ui-avatar-rounded]">` containing `<img class="ui-avatar-image" data-state="loading|loaded">`, `<span class="ui-avatar-fallback">` and an optional `<span class="ui-avatar-status" data-status role="img" aria-label>`.
- `AvatarGroup`: `<div role="group" class="ui-avatar-group [ui-avatar-group-<size>]">`; `max` shows N avatars then a "+N" avatar.
- `getInitials(name)` returns up to two uppercase initials.

### Props
- `Avatar`: `size` `xs` 24 · `sm` 32 · `md` 40 (default, inherited from a group) · `lg` 48 · `xl` 64; `shape` `circle` | `rounded` (radius = size × .28); `status` `online|away|busy|offline`; `statusLabel`.
- `AvatarImage`: `src`, required `alt`. Renders nothing on error (or if `src` is empty); also handles images that failed before hydration.

### Visual rules
- Size is `--ui-avatar-size`; font-size `max(12px, size × .36)`, weight 500, uppercase.
- Image and fallback share one grid cell (image on top); the fallback is hidden once the image has loaded (`:has(> .ui-avatar-image[data-state="loaded"])`).
- Fallback fill `--ui-secondary`, text `--ui-secondary-foreground`. A 1px inset hairline (`foreground` 10%) is drawn over the picture.
- Status dot: `max(8px, size × .27)`, bottom-right, fill online `--ui-success`, away `--ui-warning`, busy `--ui-destructive`, offline `--ui-muted-foreground`, ring `0 0 0 2px var(--ui-avatar-ring, var(--ui-background))`.
- Group: avatars overlap by size × .28, each ringed with `--ui-avatar-ring`.

### Accessibility
- `alt` is the person's name (`""` only if the name is printed beside it). The status dot has an accessible name. The group has `role="group"`; give it an `aria-label`.

### Acceptance checks
- A broken image shows the initials. Sizes measure 24/32/40/48/64. The group "+N" counts the hidden avatars.
