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
  test.describe('Login Flow - UI', () => {
    test('should login and display Automation navigation', async ({ page, logger }) => {
      const loginPage = new LoginPage(page);
      const dashboard = new DashboardPage(page);

      await loginPage.openLoginPage();
      await loginPage.login(USERNAME, PASSWORD);

      await dashboard.automationMenuItem.waitFor({ state: 'visible' });
      await expect(dashboard.automationMenuItem).toBeVisible();
    });
  });
}
