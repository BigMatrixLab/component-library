# Backlog

Gaps and follow-ups found while building. Tick off as they land.

## Library gaps (found by block builders)

- [ ] Sidebar: container-width mode (switch to the sheet by its frame width, not the viewport)
- [ ] CommandDialog `hotkey`: scope it so two palettes on one page don't both answer ⌘K
- [ ] PageHeader component (title, description, actions): every block repeats this markup
- [ ] DataTable: hide columns by container width (today it only scrolls sideways)
- [ ] Kbd: platform-aware modifier (⌘ on Apple, Ctrl elsewhere)
- [ ] Tabs: orientation that switches by width (settings block uses its own ResizeObserver)
- [ ] Icons: help / life-buoy, git-branch, brand marks (Google)
- [ ] Marquee primitive (testimonials block rolls its own)
- [ ] Carousel: pause button for autoplay (WCAG 2.2.2), controlled `index`
- [ ] Toaster mounted in the docs layout, so blocks can use toasts
- [ ] Shared glyph keyframes (`ui-glyph-*`, `ui-action-label-in/out`): move from action-button.css to motion.css
- [ ] Theme packs: component dark tweaks match any `.dark` ancestor; switch them to
      `:where(.dark, [data-theme-mode="dark"])` so light subtrees inside a dark page stay light
- [ ] Animated counter: 9→0 should roll forward; removed characters should animate out
- [ ] Data table: per-column filter row isn't sticky with `stickyHeader`
- [ ] Stepper: "furthest step reached" option (onboarding wizard disables later steps by hand)
- [ ] Light-mode scope class (only `.dark` exists today) — pairs with the theme-pack `:where()` fix
- [ ] Swatch-style radio variant for colour pickers
- [ ] TagInput: visible error vs hidden status may double-announce rejections
- [ ] Focus-a-heading helper (`tabIndex=-1`, no outline) used by multi-step blocks

## Verify in the test pass

- [ ] New icons (play, pause, quote, shield, server, github, linkedin, …) were drawn from memory
- [ ] number-input: `'number'` style now maps to Intl `'decimal'` (formatting used to drop locale/digits)
- [ ] Contrast: segmented control unselected label, sidebar group label, comparison-table tinted cells,
      muted text over marketing gradients
- [ ] Tab indicator `role=presentation` inside tablist (axe aria-required-children)
- [ ] Accordion `hidden="until-found"` in WebKit/Firefox
- [ ] OTP paste in WebKit; bottom-sheet drag on iPhone touch; HoldToConfirm on iOS touch
- [ ] ThemeSwitch view-transition reveal (Safari 18+, Chrome; Firefox instant swap)

## Release

- [ ] D8 npm name, then remove `"private": true` (see docs/RELEASING.md)
- [x] Docs static export for Cloudflare Pages: `output: 'export'`, `generateStaticParams`,
      prompts as `/prompts/<component>/<example>/{recreate,adapt}.txt`
