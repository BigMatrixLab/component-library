import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const config: NextConfig = {
  reactStrictMode: true,
  // The monorepo root, so tracing and file reads (prompts, sources) resolve
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
};

export default config;
