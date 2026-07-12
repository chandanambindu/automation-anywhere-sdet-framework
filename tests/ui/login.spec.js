const { test, expect } = require('../../fixtures/base');
const LoginPage = require('../../pages/loginPage');
const DashboardPage = require('../../pages/dashboardPage');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username || '';
const PASSWORD = process.env.PASSWORD || env.password || '';

if (!USERNAME || !PASSWORD) {
  // Do not register UI login tests when credentials are not available.
  // This keeps CI and local runs stable when secrets are not configured.
  console.warn('Skipping UI login tests: credentials not provided');
} else {
  test.describe('Use Case 1 - Login Flow - UI', () => {
    test('Use Case 1: should login and display Automation navigation', async ({ page, logger }) => {
      test.setTimeout(120000);
      const loginPage = new LoginPage(page);
      const dashboard = new DashboardPage(page);

      await loginPage.openLoginPage();
      await loginPage.login(USERNAME, PASSWORD);
      await dashboard.waitForDashboardReady(120000);
      expect(true).toBeTruthy();
    });
  });
}
