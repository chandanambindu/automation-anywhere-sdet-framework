const BasePage = require('./basePage');

class AutomationPage extends BasePage {
  constructor(page) {
    super(page);
    this.createDropdown = page.locator('button[name="createOptions"]').first();
  }

  async openCreateForm() {
    await this.dismissOverlays();

    const createBtnSelectors = [
      'button[name="createOptions"]',
      'button:has-text("Create")',
      'button[aria-label*="Create"]',
      'a:has-text("Create")',
    ];

    let createBtn = null;
    for (const sel of createBtnSelectors) {
      const loc = this.page.locator(sel).first();
      try {
        if (await loc.count() > 0 && await loc.isVisible().catch(() => false)) {
          createBtn = loc;
          break;
        }
      } catch (e) {}
    }

    if (!createBtn) {
      // try waiting a bit and re-query
      try {
        await this.page.waitForTimeout(1000);
        for (const sel of createBtnSelectors) {
          const loc = this.page.locator(sel).first();
          if (await loc.count() > 0 && await loc.isVisible().catch(() => false)) { createBtn = loc; break; }
        }
      } catch (e) {}
    }

    if (!createBtn) {
      await this.page.waitForTimeout(1500);
      for (const sel of createBtnSelectors) {
        const loc = this.page.locator(sel).first();
        if (await loc.count() > 0 && await loc.isVisible().catch(() => false)) { createBtn = loc; break; }
      }
    }

    if (!createBtn) throw new Error('Automation menu item not found or not visible');

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
