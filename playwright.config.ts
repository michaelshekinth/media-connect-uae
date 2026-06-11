import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'production-smoke',
      testMatch: /smoke\.production\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'local-full',
      testMatch: /full-marketplace\.local\.spec\.ts/,
      timeout: 120_000,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api-integration',
      testMatch: /api\.integration\.spec\.ts/,
    },
  ],
})
