## Component: Pagination

Move through a long collection. Compose page links, Previous / Next and ellipses; `usePagination` supplies the page list.

### Anatomy
```
<Pagination>                      nav.ui-pagination aria-label="Pagination"
  <PaginationContent>             ul.ui-pagination-content
    <PaginationItem>              li.ui-pagination-item
      <PaginationPrevious />      a|button.ui-pagination-link.ui-pagination-link-wide  chevron + label
      <PaginationLink isActive>   a|button.ui-pagination-link   32px square, aria-current="page" + data-active
      <PaginationEllipsis />      span.ui-pagination-ellipsis  (sr-only "More pages")
      <PaginationNext />
      <PaginationStatus page total />   span.ui-pagination-status  "Page 3 of 12", aria-live="polite"
```

### API
- `usePagination({ page, total, siblings = 1, boundaries = 1 })` → `(number | 'ellipsis-start' | 'ellipsis-end')[]`. `getPaginationRange` is the same function without the hook (server-safe).
- Algorithm: if `total <= siblings*2 + boundaries*2 + 3` list every page. Otherwise `left = max(page - siblings, boundaries + 1)`, `right = min(page + siblings, total - boundaries)`; show an ellipsis on a side only when it hides at least one page (`left > boundaries + 2`, `right < total - boundaries - 1`). A side without an ellipsis is padded to `siblings*2 + boundaries + 2` pages, so the list always has the same length (7 with the defaults). Example: `page 6, total 12` → `[1, e, 5, 6, 7, e, 12]`; `page 2` → `[1, 2, 3, 4, 5, e, 12]`.
- `PaginationLink`: `isActive`, `disabled`, `size` (`icon` | `default`), `href` (anchor, else button), `asChild`.
- Disabled: buttons use `disabled`; anchors use `aria-disabled`, `tabIndex=-1` and swallow clicks. It keeps its place in the layout.

### Visual rules
- Link: min 32px square, `--radius-md`, 14px/500, tabular numbers, transparent border. Wide links have 10px padding (8px on the icon side).
- Active: `--ui-surface-raised`, 1px `--ui-border-strong`, `--ui-shadow-xs`. Hover (fine pointer, not active/disabled): `--ui-accent`. Disabled: opacity .45.
- Ellipsis: 32px square, muted. Status: 14px muted with the numbers in `--ui-foreground` 500.
- Under 480px the Previous / Next labels hide and the links become 32px squares.
- Focus ring `0 0 0 3px` of `--ui-ring` at 45%.

### Motion
- Press scale .97 on `--ui-spring-snappy`; colours 150ms. Reduced motion drops the scale.

### Accessibility
- nav landmark + list; `aria-current="page"` on the active link; Previous / Next have `aria-label`s; page numbers should get `aria-label="Page N"`.

### Acceptance checks
- The list length is constant while paging; ellipses appear and disappear at the right pages.
- Previous is disabled on page 1 and Next on the last page, and neither is clickable.
- The active page is the only `aria-current="page"` link.
- Works as `<a href>` and with `asChild` around a Next.js `Link`.
