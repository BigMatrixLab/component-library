import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const config: NextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
  devIndicators: false,
};

export default config;
