import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const config: NextConfig = {
  reactStrictMode: true,
  // Static site in `out/` (Cloudflare Pages, see docs/DEPLOY.md). `next dev` is unaffected.
  output: 'export',
  // Default, kept explicit: /docs/components/button → button.html, which Cloudflare
  // Pages serves at the clean URL with no redirect (it strips the .html itself).
  trailingSlash: false,
  // The monorepo root, so tracing and file reads (prompts, sources) resolve
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
};

export default config;
