## Theme packs

A theme pack changes the whole look (colour map in light and dark, radius, shadows, display face) by overriding semantic tokens only. Components never change; keep reading `var(--ui-*)` / `bg-card` / `text-muted-foreground` and the pack follows.

### Applying a pack
- `data-theme="<pack>"` on `<html>` for the whole app, or on any element for a subtree. No attribute = `neutral`.
- Dark: `.dark` (or `data-theme-mode="dark"`) on the same element or an ancestor. To keep a subtree light on a dark page, put `data-theme-mode="light"` on the **same** element as `data-theme`.
- Accent: `data-accent="violet|blue|emerald|rose|amber|orange"` on the same element or an ancestor replaces the pack's primary, focus ring and checked controls.
- Persisted choice: `const { pack, setPack } = useTheme()`; `THEME_PACKS` lists the built-ins. `<ThemeScript />` in `<head>` applies the saved pack (localStorage `ui-theme-pack`) before paint.

### Built-in packs (exact values)
| Pack | Ramp hue / chroma | `--ui-radius` | Primary (light · dark) | Shadows | Notes |
|---|---|---|---|---|---|
| `neutral` | zinc 286 / ≤ 0.017 | 0.625rem | tone-900 · tone-200 | soft black | default |
| `stone` | warm 55–75 / ≤ 0.016 | 0.5rem | tone-900 · tone-200 | warm-tinted `oklch(0.3 0.02 60 / a)` | page `oklch(0.995 0.0015 75)` |
| `slate` | cool 248–266 / ≤ 0.044 | 0.375rem | tone-900 · tone-200 | tight, `oklch(0.25 0.04 260 / a)` | navy dark page `oklch(0.137 0.036 266)` |
| `soft` | lavender 285–290 / ≤ 0.06 | 0.875rem | `oklch(0.47 0.14 285)` · `oklch(0.8 0.09 285)` | wide, diffuse, tinted | tinted page (tone-50) under white cards |
| `mono` | achromatic | 0.25rem | tone-950 · tone-0 | none | borders tone-800 (light) / tone-400 (dark); headings use `--ui-font-mono` |

### Writing a custom pack
```css
[data-theme="forest"] {
  /* 14-step ramp, lightest → darkest: 0 50 100 150 200 300 400 500 700 800 850 900 925 950 */
  --ui-tone-0: oklch(1 0 0);
  /* … */
  --ui-tone-950: oklch(0.145 0.012 155);
  /* Only the knobs you change; add -dark for dark mode */
  --ui-pack-radius: 0.5rem;
  --ui-pack-primary: oklch(0.45 0.1 155);
  --ui-pack-primary-dark: oklch(0.8 0.12 155);
}
```
Knobs: `--ui-pack-{radius, background, foreground, surface, surface-raised, surface-muted, muted-foreground, primary, primary-foreground, primary-text, secondary, secondary-foreground, accent, border, border-subtle, border-strong, ring, control-track, sidebar, sidebar-border, sidebar-accent, shadow-xs|sm|md|lg, overlay}` and the same with `-dark`.

### Rules
- Never set `--ui-*` roles directly inside a pack and never edit component CSS for a theme — set the ramp and knobs.
- Every text pair stays ≥ 4.5:1 in both modes: foreground and muted text on background, surface, surface-raised, surface-muted and the hover fill; primary-foreground on primary; primary text on background and surface; status text on background and surface-muted.
- No shadow = `0 0 0 0 transparent`, not `none` (shadows are stacked with focus rings).
- Packs never change spacing, sizes, type scale or motion.
