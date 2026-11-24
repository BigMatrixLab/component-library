import { defineConfig } from 'tsup';

// Unbundled build: every source file becomes its own module so that
// 'use client' directives stay on exactly the files that need them,
// and Server Components can import the presentational ones.
export default defineConfig({
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}'],
  format: ['esm'],
  bundle: false,
  target: 'es2022',
  sourcemap: true,
  clean: false,
  dts: false,
  outDir: 'dist',
});
