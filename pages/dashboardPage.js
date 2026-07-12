const BasePage = require('./basePage');
const env = require('../config/env');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.automationMenuItem = page.locator('text=Automation').first();
  }

  async waitForDashboardReady(timeout = 60000) {
    const readySelectors = [
      'text=Automation',
      'text=Home',
      'text=Explore',
      '[role="navigation"]',
      'aside',
    ];

    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const sel of readySelectors) {
        const loc = this.page.locator(sel).first();
        if (await loc.count() > 0 && await loc.isVisible().catch(() => false)) {
          return;
        }
      }
      await this.page.waitForTimeout(1000);
    }

    throw new Error('Dashboard did not become ready in time');
  }

  async openAutomation() {
    await this.waitForDashboardReady();
    const selectors = [
      'a[name="automations"]',
      'a:has-text("Automation")',
      '[role="navigation"] >> a:has-text("Automation")',
      'nav >> a:has-text("Automation")',
      'text=Automation',
      'text=Automations',
    ];

    for (const sel of selectors) {
      const loc = this.page.locator(sel).first();
      try {
        if (await loc.count() > 0) {
          await loc.waitFor({ state: 'visible', timeout: 10000 });
          await loc.click({ force: true });
          return;
        }
      } catch (e) {
        // ignore and try next selector
      }
    }

    // Last ditch: wait for an Automation navigation target and click it.
    for (const sel of selectors) {
      const loc = this.page.locator(sel).first();
      try {
        await loc.waitFor({ state: 'visible', timeout: 15000 });
        await loc.click({ force: true });
        return;
      } catch (e) {
        // ignore; try next selector
      }
    }

    throw new Error('Automation menu item not found or not visible');
  }
}

module.exports = DashboardPage;
