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
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  use: {
    baseURL,
    headless: process.env.HEADLESS !== 'false',
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
  ],
});
