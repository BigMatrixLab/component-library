# ui-kit

Our own React component library for React and Next.js: Tailwind v4 classes, zero runtime dependencies besides React, our own motion, charts and themes, and a verified AI prompt for every example.

Status: Phase 0 (foundation) — see [PLAN.md](PLAN.md).

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

## Use it in a Next.js app

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
