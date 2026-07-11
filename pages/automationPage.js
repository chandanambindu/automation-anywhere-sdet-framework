const BasePage = require('./basePage');

class AutomationPage extends BasePage {
  constructor(page) {
    super(page);
    this.createDropdown = page.locator('button:has-text("Create"), [aria-label*="Create" i]').first();
    this.formOption = page.locator('text=Form').first();
  }

  async openCreateForm() {
    await this.createDropdown.waitFor({ state: 'visible' });
    await this.createDropdown.click();
    await this.formOption.waitFor({ state: 'visible' });
    await this.formOption.click();
  }
}

module.exports = AutomationPage;
