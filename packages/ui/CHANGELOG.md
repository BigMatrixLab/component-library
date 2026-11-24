# Changelog

All notable changes to this package are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package uses
[Semantic Versioning](https://semver.org/). How to cut a release: `docs/RELEASING.md`.

<!-- New entries go under "Unreleased". Sections: Added, Changed, Deprecated,
     Removed, Fixed, Security. One line per change, user-facing wording,
     component name first: "Select: typeahead now matches mid-word". -->

## [Unreleased]

### Added

- Per-component entry points: `import { Button } from 'ui-kit/button'`.
- shadcn-compatible source registry (`/r/<name>.json`) and AI docs (`llms.txt`, `llms-full.txt`, `/md/<name>.md`).

## [0.1.0] - YYYY-MM-DD

First public release (not yet published; the npm name is pending, decision D8).

### Added

- Foundation: two-layer tokens, theme packs, accents, motion presets ("soft rise"), base styles, icons.
- Primitives: `useControllableState`, `usePresence`, `useScrollLock`, `useDismiss`, `useRovingFocus`, `useFloating`, `Slot`, `computePosition`.
- Core, composite, data/chart and signature components (Phases 1–5).
