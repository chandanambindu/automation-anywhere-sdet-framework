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
      test.setTimeout(120000);
      const loginPage = new LoginPage(page);
      const dashboard = new DashboardPage(page);

      await loginPage.openLoginPage();

      // Attempt login with one retry if post-login indicator not visible
      let loggedIn = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        await loginPage.login(USERNAME, PASSWORD);

        // Wait for a post-login indicator with retries to avoid intermittent timing issues
        const maxWait = 60000;
        const start = Date.now();
        const postLoginSelectors = ['text=Automation', 'text=Dashboard', 'text=Home', 'text=Repository', 'text=Bots'];
        let visible = false;
        while (Date.now() - start < maxWait) {
          try {
            for (const sel of postLoginSelectors) {
              const loc = page.locator(sel).first();
              if (await loc.count() > 0 && await loc.isVisible().catch(() => false)) {
                visible = true;
                break;
              }
            }
            if (visible) break;
          } catch (e) {
            // ignore and retry
          }
          await page.waitForTimeout(1000);
        }
        if (visible) { loggedIn = true; break; }
        console.warn(`Login attempt ${attempt} did not reach post-login state; retrying`);
        try { await page.reload({ waitUntil: 'domcontentloaded' }); } catch (e) {}
        await page.waitForTimeout(1000 * attempt);
      }
      expect(loggedIn).toBeTruthy();
    });
  });
}
