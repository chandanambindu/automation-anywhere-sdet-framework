const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const baseURL = process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: Number(process.env.TEST_TIMEOUT_MS || 60000),
  expect: {
    timeout: Number(process.env.EXPECT_TIMEOUT_MS || 10000),
  },
  retries: Number(process.env.RETRIES || 1),
  // Run tests serially by default to avoid account/session collisions
  // during parallel UI runs against the shared cloud environment.
  // Set WORKERS env var to override if parallel runs are desired.
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : 1,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  use: {
    baseURL,
    headless: process.env.HEADLESS !== 'false',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: Number(process.env.ACTION_TIMEOUT_MS || 20000),
    navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT_MS || 30000),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
