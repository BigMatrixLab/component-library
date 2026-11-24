## Component: Announcement bar

A dismissible strip at the top of a page or app for news, a launch or a maintenance window, with an optional link. Dismissing collapses its height so the page below glides up. A client component.

### Anatomy
- Wrapper `<div class="ui-announcement-bar-collapse" data-state="open|closed" [data-animate]>` > `.ui-announcement-bar-collapse-inner` (grid row 1fr → 0fr on close).
- Strip `<div class="ui-announcement-bar" role="region" aria-label="Announcement" data-variant="neutral|primary|gradient-subtle" [data-dismissible]>`:
  - `.ui-announcement-bar-content`: optional `.ui-announcement-bar-icon` (or `AnnouncementBarBadge` → `span.ui-announcement-bar-badge`), `p.ui-announcement-bar-message`, optional action.
  - `button.ui-announcement-bar-close` (`aria-label="Dismiss announcement"`, × icon 16px).
- `AnnouncementBarLink` → `a.ui-announcement-bar-link` > `.ui-announcement-bar-link-label` + arrow icon `.ui-announcement-bar-link-arrow` (`asChild` keeps that structure inside a Next.js `Link`).

### Props
- `variant`: `neutral` (default) · `primary` · `gradient-subtle`.
- `open` / `defaultOpen` (true) / `onOpenChange`; `dismissible` (true); `dismissLabel`.
- `storageKey`: remember dismissal in `localStorage` (value `"dismissed"`). Change the key for a new announcement.
- `icon` (ReactNode: an `Icon` or a badge), `action` (ReactNode: usually `AnnouncementBarLink`), `aria-label` (landmark name, default "Announcement").
- `AnnouncementBarLink`: anchor props, `asChild`, `arrow` (true).

### Behaviour
- The × sets open to false (writing the storage key first). `usePresence` keeps the bar mounted until the collapse animation ends, then unmounts.
- SSR: the server always renders the bar. After hydration, if the key is stored, the bar unmounts at once with no animation. Other tabs that dismiss it close it here too (`storage` event).
- Re-opening after the first render animates open (`data-animate`); the first render never animates.
- Storage errors (blocked storage) are swallowed: the bar still closes for this view.

### Visual rules
- Strip: min-height 40px, padding 8px 16px (48px each side when dismissible so centred text never runs under the ×), 13px text, centred content (max-width 72rem) with 10px gaps; bottom border.
- neutral: `--ui-surface-muted`, `--ui-foreground`, `--ui-border`. primary: `--ui-primary` / `--ui-primary-foreground`, no border, muted parts at 78% foreground. gradient-subtle: 90° wash of `--ui-series-1` 12% → `--ui-series-2` 10% → `--ui-series-4` 10% over `--ui-surface`, border tinted with series-1.
- Badge: 20px pill, 12px/500, primary fill (on primary: foreground 18% wash).
- Link: inherits colour, 500, underline at 40% (100% on hover), offset 3px; arrow 14px.
- ×: 28px square, radius md, muted colour, hover 10% foreground wash, `::before` grows the hit area to 44px.
- ≤ 640px: content starts at the inline start instead of centring.

### Motion
- Dismiss: wrapper `grid-template-rows 1fr → 0fr` + opacity over 280ms `--ui-ease-in-out`; the strip lifts 4px with a 2px blur over `--ui-duration-exit`.
- Re-open: rows 0fr → 1fr on `--ui-spring-smooth`.
- Link arrow nudges 2px on hover (snappy spring); × presses to .94.
- Reduced motion: collapse is instant; no lift.

### Accessibility
- `role="region"` with an `aria-label` makes it a findable landmark; give each bar on a page its own label.
- × is a real button with an accessible name; focus ring 3px (on primary: a 2px primary-foreground ring).
- No `role="alert"`: an announcement is page content, not an interruption.

### Acceptance checks
- Clicking × collapses the bar to height 0 and removes it; content below moves up.
- With `storageKey`, reload after dismissing: the bar is gone after hydration; clearing the key brings it back.
- Controlled: `open={false}` hides it; `onOpenChange(false)` fires on ×.
- Three variants render with ≥ 4.5:1 text contrast in light and dark.
