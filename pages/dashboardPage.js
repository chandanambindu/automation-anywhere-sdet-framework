const BasePage = require('./basePage');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.automationMenuItem = page.locator('text=Automation').first();
  }

  async openAutomation() {
    await this.automationMenuItem.waitFor({ state: 'visible' });
    await this.automationMenuItem.click();
  }
}

module.exports = DashboardPage;
