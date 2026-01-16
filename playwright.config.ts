import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:23002',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Main test project - each test handles its own login via helpers/auth.ts
    // (storageState doesn't work with Firebase which uses IndexedDB)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      // Exclude auth setup from regular test runs
      testIgnore: /auth\.setup\.ts/,
    },

    // Additional browsers (optional - can be enabled as needed)
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: '.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    //   testIgnore: /auth\.setup\.ts/,
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: '.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    //   testIgnore: /auth\.setup\.ts/,
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: './run-local.sh',
    url: 'http://localhost:23002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start server
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
