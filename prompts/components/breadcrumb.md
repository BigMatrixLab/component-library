## Component: Breadcrumb

Where the current page sits in the hierarchy: a `<nav>` with an ordered list of links ending in the current page. Server Component–safe.

### Anatomy
```
<Breadcrumb separator="chevron|slash">   nav.ui-breadcrumb aria-label="Breadcrumb" data-separator
  <BreadcrumbList>                       ol.ui-breadcrumb-list
    <BreadcrumbItem>                     li.ui-breadcrumb-item
      <BreadcrumbLink asChild?>          a.ui-breadcrumb-link
      <BreadcrumbPage>                   span.ui-breadcrumb-page role="link" aria-disabled aria-current="page"
      <BreadcrumbEllipsis>               button.ui-breadcrumb-ellipsis aria-label="Show hidden pages" (can be a DropdownMenuTrigger asChild)
    <BreadcrumbSeparator>                li.ui-breadcrumb-separator role="presentation" aria-hidden — chevron svg + "/" span
```

### Props
- `Breadcrumb`: `separator` (`chevron` default | `slash`). Native nav props; `aria-label` overridable.
- `BreadcrumbLink`: `asChild` (e.g. Next.js `Link`). `BreadcrumbSeparator`: optional `children` replace the glyph.
- Everything forwards `ref`, `className` and native props.

### Behaviour
- Separators render both glyphs; CSS shows the chevron or the slash from the parent's `data-separator` (no context, so it stays server-safe).
- The last item is `BreadcrumbPage`, announced with `aria-current="page"`.

### Visual rules
- 14px / 20px line. List: flex, wrap, gap 4px 6px, `--ui-muted-foreground`, `overflow-wrap: anywhere`.
- Link: muted, hover (fine pointer only) `--ui-foreground`, 150ms colour. Page: `--ui-foreground`, weight 500.
- Separator: 14px chevron, muted at 70% opacity. Ellipsis: 24px square button, `--radius-sm`, hover/open `--ui-accent`.
- Focus ring `0 0 0 3px` of `--ui-ring` at 45%.

### Motion
- Colour changes only. No movement.

### Accessibility
- WAI-ARIA breadcrumb pattern. Separators are `aria-hidden`.

### Acceptance checks
- Exactly one `aria-current="page"`, on the last item.
- Chevron and slash separators swap by the `separator` prop.
- The ellipsis opens a dropdown menu holding the hidden levels.
- Long labels wrap and never overflow the container at 360px.
