import { defineConfig, devices } from '@playwright/test';

/**
 * Interaction, accessibility and visual tests against the docs site.
 * Three engines (D6): Chromium, WebKit (Safari, every iOS browser), Firefox,
 * plus phone profiles for the touch layout.
 */
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  // The Next dev server compiles on demand; too many workers starve it.
  workers: process.env.CI ? 2 : 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['blob'], ['list']] : [['list']],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'iphone', use: { ...devices['iPhone 15 Pro'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev -w docs',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: process.env.CI ? 300_000 : 120_000,
  },
});
