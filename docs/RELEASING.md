# Releasing

How the library is versioned, built and published, and what the docs site ships
alongside it. Nothing here runs automatically: every step is manual and needs no
extra dependencies.

## What ships

| Output | Where | Made by |
|---|---|---|
| npm package | `packages/ui` → `dist/`, `src/styles/`, `CHANGELOG.md` | `npm run build -w ui-kit` |
| Per-component entry points | `exports` in `packages/ui/package.json` (`ui-kit/<name>`) | `packages/ui/scripts/gen-exports.mjs` (first step of the ui build) |
| Source registry (shadcn) | `apps/docs/public/r/*.json` | `npm run gen:registry` |
| AI docs | `apps/docs/public/llms.txt`, `llms-full.txt`, `md/*.md` | `npm run gen:llms` |

The registry and AI docs are generated (git-ignored) and rebuilt by the docs
`prebuild`, so a docs deploy always matches the source it was built from.

### Environment

| Variable | Used by | Default |
|---|---|---|
| `UI_SITE_URL` | gen-registry, gen-llms: absolute URLs in items, `llms.txt` and `md/` | `https://ui-kit.example.com` (placeholder) |
| `UI_REGISTRY_TARGET` | gen-registry: folder the source is copied into in the user's app | `ui` (→ `src/ui` when the app uses `src/`) |

Set `UI_SITE_URL` in the docs build environment (Cloudflare Pages: project →
Settings → Environment variables) before the first public deploy.

## Naming (decision D8, pending)

`ui-kit` is a placeholder. The one place to change it is the `name` field of
`packages/ui/package.json`; the generator scripts read it from there. The rest
of the repo then needs a search-and-replace:

- `apps/docs/package.json` dependency `"ui-kit": "*"`
- root `package.json` scripts (`-w ui-kit`)
- imports: `grep -rn "from 'ui-kit" apps tests prompts` and `apps/docs/lib/prompts.ts` (`localiseImports`)
- CSS: `@import "ui-kit/kit.css"` in `apps/docs/app/globals.css` and `README.md`
- `prompts/system.md` ("Design system: ui-kit") and `PLAN.md`

Check availability first: `npm view <name>` should return 404. A scope
(`@<org>/ui`) avoids squatting fights and makes `access: public` necessary
(already set in `publishConfig`).

## Versioning

Semantic versioning. Public API = everything a consumer can depend on:

- exported names, props and their defaults, `data-*` / ARIA attributes,
- `ui-*` class names and their parts, `--ui-*` CSS variables,
- entry points (`ui-kit/<name>`, `styles.css`, `kit.css`).

| Change | Before 1.0 | From 1.0 |
|---|---|---|
| Rename/remove any of the above, change a default, change the DOM a selector relies on | minor | major |
| New component, prop, variant, token, entry point | patch or minor | minor |
| Bug fix, visual fix within the spec, docs | patch | patch |

Pre-releases go out as `0.x.y-next.N` under the `next` dist-tag.

## Recording changes (changesets-style, no tooling)

Every change that a consumer can see adds one file, so parallel work never
conflicts on `CHANGELOG.md`:

```md
<!-- .changes/2026-11-25-select-typeahead.md -->
---
bump: minor
---
Select: typeahead now matches mid-word.
```

At release time:

1. Take the highest `bump` among `.changes/*.md`.
2. Move each line into `packages/ui/CHANGELOG.md` under the new version heading
   (Added / Changed / Deprecated / Removed / Fixed / Security), then delete the files.

## Release steps

1. `npm run release:check` (ui build, docs build incl. registry + llms, typecheck, unit tests).
2. `npm run test:e2e` (Chromium, WebKit, Firefox; axe; visual). Note any engine that did not run.
3. Bump: `npm version <patch|minor|major|prerelease> -w ui-kit --no-git-tag-version`.
4. Fold `.changes/` into `packages/ui/CHANGELOG.md`, set the date.
5. Inspect the tarball: `npm pack -w ui-kit --dry-run`. Expect `dist/**/*.js`,
   `dist/**/*.d.ts`, `dist/styles.css`, `src/styles/**`, `CHANGELOG.md`,
   `package.json`, `README.md`, `LICENSE`; no tests, no source maps.
6. Smoke test the packed tarball (`npm pack -w ui-kit`) in a fresh Next.js app:
   root import, a subpath import (`ui-kit/button`), `kit.css` with Tailwind,
   `styles.css` without, a Server Component page using a presentational component.
7. Commit and tag `ui-kit@<version>`.
8. Publish: `npm publish -w ui-kit` (pre-release: `--tag next`). Add
   `--provenance` only when publishing from CI with OIDC.
9. Deploy the docs with `UI_SITE_URL` set (see `docs/DEPLOY.md`); check `/llms.txt`, `/r/index.json`
   and `npx shadcn@latest add <site>/r/button.json` in a scratch app.

## First-publish checklist

- [ ] D8 decided; name changed everywhere listed above; `npm view <name>` is 404.
- [ ] `"private": true` removed from `packages/ui/package.json` (it blocks `npm publish` on purpose).
- [ ] `license` confirmed (MIT placeholder) and a `LICENSE` file in `packages/ui/`.
- [ ] `README.md` copied or written for `packages/ui/` (npm shows the package folder's README).
- [ ] `repository`, `homepage` and `bugs` placeholders (`OWNER/REPO`, `ui-kit.example.com`) filled in.
- [ ] Version set to `0.1.0`; CHANGELOG date filled in.
- [ ] `UI_SITE_URL` set for the docs build; registry URLs inside `r/*.json` point at the real site.
- [ ] `npx shadcn add` verified against the deployed registry (see notes below).
- [ ] Logged in as the right npm user/org with 2FA (`npm whoami`).

## Notes and known limits

- **Subpath imports need modern resolution.** `ui-kit/<name>` relies on
  `exports`; consumers need `moduleResolution` `bundler`, `node16` or
  `nodenext` (Next.js and Vite defaults are fine). No `typesVersions` fallback.
- **Registry layout.** Each item copies the component's own folder, the shared
  lib/hook/icon files it imports, and its CSS into `<target>/` with the
  `packages/ui/src` layout, so relative imports work with no rewriting. Shared
  files repeat across items with identical content; the shadcn CLI skips
  identical files. Components a component imports are `registryDependencies`
  (absolute URLs), as is `theme`.
- **CSS is shipped as files, not `cssVars`/`css`.** The tokens rely on dark
  mode, `data-accent` and theme-pack selectors that the shadcn `cssVars` shape
  cannot express. The user imports `<target>/styles/theme.css` plus one line per
  component; each item's `docs` field prints the exact line after install.
- **Unverified so far:** an end-to-end `npx shadcn add` against a deployed
  registry, including how the CLI treats `.css` files typed `registry:file`.
