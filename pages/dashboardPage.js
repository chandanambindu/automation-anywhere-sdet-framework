const BasePage = require('./basePage');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.automationMenuItem = page.locator('text=Automation').first();
  }

  async openAutomation() {
    const selectors = [
      'text=Automation',
      'a:has-text("Automation")',
      'nav >> text=Automation',
      '[role="navigation"] >> text=Automation',
      'text=Automations',
    ];

    for (const sel of selectors) {
      const loc = this.page.locator(sel).first();
      try {
        if (await loc.isVisible()) {
          await loc.click();
          return;
        }
      } catch (e) {
        // ignore and try next selector
      }
    }

    // Last ditch: try clicking any sidebar link that contains 'Automation' text with a timeout
    try {
      await this.page.waitForSelector('text=Automation', { timeout: 10000 });
      await this.page.locator('text=Automation').first().click();
      return;
    } catch (e) {
      throw new Error('Automation menu item not found or not visible');
    }
  }
}

module.exports = DashboardPage;
