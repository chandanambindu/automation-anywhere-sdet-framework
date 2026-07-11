const BasePage = require('./basePage');

class AutomationPage extends BasePage {
  constructor(page) {
    super(page);
    this.createDropdown = page.locator('button[name="createOptions"]').first();
  }

  async openCreateForm() {
    await this.dismissOverlays();

    const createBtn = this.page.locator('button[name="createOptions"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.click();
    await this.page.waitForTimeout(600);

    const formOption = this.page.locator('button:has-text("Form…"), button:has-text("Form")').first();
    await formOption.waitFor({ state: 'visible', timeout: 10000 });
    await formOption.click({ force: true });
    console.log('[openCreateForm] Form option clicked');

    await this.page.locator('input[name="name"], input[placeholder="Required"]').first().waitFor({ state: 'visible', timeout: 15000 });
    console.log('[openCreateForm] Name field is visible');
  }
}

module.exports = AutomationPage;
