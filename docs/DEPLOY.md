# Deploying the docs site

The docs app (`apps/docs`) is a fully static site: `next build` runs with
`output: 'export'` and writes plain HTML, JS, CSS and text files to
`apps/docs/out/`. It is hosted on **Cloudflare Pages** through its Git
integration. No server, Functions or Workers code is involved.

## What the build produces

| Path on the site | Source | Notes |
|---|---|---|
| `/`, `/docs/**` | `apps/docs/app/**/page.tsx` | `docs/components/button.html`; Pages serves it at `/docs/components/button` |
| `/r/<name>.json`, `/r/theme.json`, `/r/all.json`, `/r/index.json` | `scripts/gen-registry.mjs` (docs `prebuild`) | shadcn registry |
| `/llms.txt`, `/llms-full.txt`, `/md/<name>.md` | `scripts/gen-llms.mjs` (docs `prebuild`) | AI docs |
| `/prompts/<component>/<example>/recreate.txt` and `adapt.txt` | `apps/docs/app/prompts/[...path]/route.ts` | One pair per `<Example>` on a docs page; blocks are `/prompts/blocks/<block>/<example>/…` |
| `/_headers` | `apps/docs/public/_headers` | CORS and content types for the files above |
| `/404.html` | Next.js | Pages serves it for unknown paths |

The registry and AI docs embed absolute URLs, taken from `UI_SITE_URL` at build
time. A build without it points them at the placeholder
`https://ui-kit.example.com`, so always set it in the Pages project.

## Cloudflare Pages project settings

Dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick this
repository, then:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `npm run build -w docs` |
| Build output directory | `apps/docs/out` |
| Root directory (advanced) | `/` (leave empty: the repo root, so npm workspaces resolve) |

Environment variables (**Settings → Variables and Secrets**, set for both
Production and Preview):

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `UI_SITE_URL` | `https://<project>.pages.dev` (no trailing slash); change it to the custom domain once one is attached |

Notes:

- **No `npm ci` in the build command.** When the root directory has a
  `package-lock.json`, the Pages build image installs dependencies itself
  before running the build command (its log shows
  `Installing project dependencies: npm clean-install --progress=false`).
  Adding `npm ci` would install everything twice.
- **The `ui-kit` package does not need building first.** The docs import the
  library source through the `ui-kit` path alias in `apps/docs/tsconfig.json`
  and `@import "ui-kit/kit.css"` (which points at `src/styles/`), so
  `npm run build -w docs` is enough. The docs `prebuild` step generates the
  registry and AI docs.
- **Preview deployments** (every non-production branch) get their own
  `https://<hash>.<project>.pages.dev` URL, but the registry inside them still
  points at `UI_SITE_URL`. Test `npx shadcn add` against production, or set a
  Preview-only `UI_SITE_URL` if you need previews to be self-contained.
- **Pages limits:** 20,000 files per deployment and 25 MiB per file. The
  export is well below both (check `apps/docs/out` if many examples are added).

### Custom domain

1. Pages project → **Custom domains → Set up a custom domain**, e.g.
   `ui.example.com`; follow the DNS step.
2. Change `UI_SITE_URL` to `https://ui.example.com` and **retry the latest
   deployment** (or push a commit). The registry URLs are baked in at build
   time, so a rebuild is required.

## URLs and trailing slashes

`trailingSlash` is `false` (the default), so pages export as
`docs/components/button.html`. Cloudflare Pages serves that file at
`/docs/components/button` and redirects `/docs/components/button.html` to the
clean URL. Links inside the site already use the clean form, so there are no
redirects in normal use.

## Headers

`apps/docs/public/_headers` is copied to the root of the output. It sets
`Access-Control-Allow-Origin: *` and a UTF-8 content type on:

| Pattern | Content-Type |
|---|---|
| `/r/*` | `application/json; charset=utf-8` |
| `/md/*` | `text/markdown; charset=utf-8` |
| `/llms.txt`, `/llms-full.txt` | `text/plain; charset=utf-8` |
| `/prompts/*` | `text/plain; charset=utf-8` |

Add a block there for any new machine-readable file the build starts emitting.

## Installing components (for teammates)

In a React app that already has Tailwind CSS v4 (`@import "tailwindcss";` in
its global CSS):

```bash
# 1. Tokens, base styles and motion (once per app)
npx shadcn@latest add https://<site>/r/theme.json

# 2. Any component; its dependencies come with it
npx shadcn@latest add https://<site>/r/button.json
npx shadcn@latest add https://<site>/r/dialog.json

# Or everything at once
npx shadcn@latest add https://<site>/r/all.json
```

Then, in the global CSS after `@import "tailwindcss";`:

```css
@import "<path-to>/ui/styles/theme.css";
@import "<path-to>/ui/styles/components/button.css"; /* one per component */
```

The source is copied into `ui/` (or `src/ui/` when the app uses `src/`); the
full list of items is at `https://<site>/r/index.json`. `<site>` is the Pages
URL or the custom domain, the same value as `UI_SITE_URL`.

AI tools can read `https://<site>/llms.txt` (index), `llms-full.txt` (all docs
in one file) or `https://<site>/md/<name>.md` per component, and the
per-example prompts under `/prompts/`.

## Checking a build locally

```bash
rm -rf apps/docs/.next apps/docs/out
UI_SITE_URL=https://<project>.pages.dev npm run build -w docs
npm run start -w docs   # serves apps/docs/out on http://localhost:4321
```

`npm run start -w docs` uses `npx serve`, because `next start` does not work
with a static export. `serve` ignores `_headers`; the headers only apply on
Cloudflare. After a deploy, spot-check:

- `/docs/components/button` loads with no redirect;
- `/r/index.json` and `/r/button.json` are JSON with `access-control-allow-origin: *`
  (`curl -I https://<site>/r/button.json`);
- `/llms.txt`, `/md/button.md`, `/prompts/button/variants/recreate.txt` load;
- `npx shadcn@latest add https://<site>/r/button.json` works in a scratch app.
