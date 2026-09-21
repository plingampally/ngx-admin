import { defineConfig } from '@playwright/test';

// No webServer block: tests always run against an already-running dev server
// (Angular 14 baseline on :4200 or the version under test on :4215),
// selected via BASE_URL. Goldens are captured from the previous version's
// server and compared against the current one.
export default defineConfig({
  testDir: './playwright/tests',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4215',
    viewport: { width: 1366, height: 900 },
    trace: 'retain-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
