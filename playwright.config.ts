import { defineConfig } from '@playwright/test';

// Two servers: the Next.js app on :3000 and the static design reference on :4174.
export default defineConfig({
  testDir: 'scripts',
  testMatch: /.*\.spec\.ts/,
  timeout: 240_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run serve:reference',
      url: 'http://localhost:4174/EdCloud%20Home.dc.html',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000/',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
});
