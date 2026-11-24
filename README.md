# ui-kit

Our own React component library for React and Next.js: Tailwind v4 classes, zero runtime dependencies besides React, our own motion, charts and themes, and a verified AI prompt for every example.

Status: all phases built, cross-browser testing in progress — see [PLAN.md](PLAN.md) and [docs/BACKLOG.md](docs/BACKLOG.md).

## Use it in your project (download the ZIP, no install)

For a React or Next.js app that uses **Tailwind CSS v4**. No npm package and no CLI: you copy the source once and import from it.

**1. Download.** On GitHub: **Code → Download ZIP**, then unzip it.

**2. Copy two folders into your project.**

| From the ZIP | To your project | What it is |
|---|---|---|
| `packages/ui/src/` | `src/ui-kit/` | The components, hooks, icons and CSS |
| `prompts/` and `apps/docs/examples/` | `ui-kit-docs/prompts/` and `ui-kit-docs/examples/` (project root, outside `src`) | Specs and working examples for your AI to read |

Then delete the unit tests from the copy (they need Vitest):

```bash
find src/ui-kit -name "*.test.ts" -o -name "*.test.tsx" | xargs rm      # macOS / Linux / Git Bash
# PowerShell: Get-ChildItem src/ui-kit -Recurse -Include *.test.ts,*.test.tsx | Remove-Item
```

**3. Point the `ui-kit` import at it** in `tsconfig.json`:

```json
{ "compilerOptions": { "paths": { "ui-kit": ["./src/ui-kit/index.ts"] } } }
```

**4. Add the styles** to your global CSS (path is relative to that file; this is for `src/app/globals.css`):

```css
@import "tailwindcss";
@import "../ui-kit/styles/kit.css";
```

**5. Add the theme script** (sets light/dark before the first paint) in `app/layout.tsx`:

```tsx
import { ThemeScript } from 'ui-kit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body>{children}</body>
    </html>
  );
}
```

**6. Use components.**

```tsx
import { Button, Dialog, DialogTrigger, DialogContent } from 'ui-kit';
```

**7. Tell your AI to use it.** Paste this into your AI coding tool once (Claude Code, Cursor, Copilot…):

```text
This project has our component library "ui-kit" in src/ui-kit (import from 'ui-kit').
Always build UI with these components instead of writing new ones or adding other UI libraries.
Before using a component, read its spec in ui-kit-docs/prompts/components/<name>.md and its
examples in ui-kit-docs/examples/<name>/. Page layouts (auth, dashboard, settings, pricing,
landing sections) are in ui-kit-docs/examples/blocks/ and their specs in ui-kit-docs/prompts/blocks/.
Style with the library's semantic tokens and Tailwind classes (bg-background, text-foreground,
text-muted-foreground, border-border, bg-primary…); never hard-code colours.
Do not edit files in src/ui-kit.
```

Requirements: React 18.2+ (or Next.js App Router), Tailwind CSS v4, TypeScript recommended. Dark mode is the `dark` class on `<html>`; accents use `data-accent="violet|blue|emerald|rose|amber|orange"`, theme packs `data-theme="stone|slate|soft|mono"`.

## Add one component with your AI (paste a URL)

Need only a few components? [`ai/`](ai/README.md) has one install doc per component and block. Copy its URL from the table in [ai/README.md](ai/README.md) and paste it to your AI tool:

```text
Add this component to my app: https://raw.githubusercontent.com/BigMatrixLab/component-library/main/ai/components/button.md
```

The doc holds every file the component needs, verbatim, and sends the agent to a one-time setup the first time. Files land in `src/ui/` (imported as `@/ui/...`), so don't mix this with the ZIP route above in the same app. `ai/` is generated: run `npm run gen:ai` after changing a component, spec or example (CI fails if it is stale).

## Repo

```
packages/ui      the library (published later)
apps/docs        Next.js documentation site — http://localhost:4321
apps/verify      isolated sandbox that renders AI output from our prompts — http://localhost:4322
prompts/         system prompt + per-component specs
tests/           Playwright: interaction, axe, visual (Chromium, WebKit, Firefox, phones)
scripts/         spring curve generator, prompt verification
```

## Commands

```bash
npm install
npm run dev                     # ui-kit in watch mode + docs on :4321
npm run build                   # library (JS, types, CSS) + docs
npm test                        # unit tests (Vitest)
npx playwright test             # browser tests (starts docs if not running)
node scripts/prompt-verify/compare.mjs button/variants   # prompt verification
```

## Use it as a package (after npm publish)

```css
/* app/globals.css */
@import "tailwindcss";
@import "ui-kit/kit.css";
```

```tsx
// app/layout.tsx
import { ThemeScript } from 'ui-kit';
// <head><ThemeScript /></head>

import { Button, Dialog, DialogTrigger, DialogContent } from 'ui-kit';
```

Building a component? Read [AUTHORING.md](AUTHORING.md).
