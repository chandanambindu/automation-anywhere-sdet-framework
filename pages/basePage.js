class BasePage {
  constructor(page) {
    this.page = page;
  }

  async waitForUrl(urlFragment, options = {}) {
    await this.page.waitForURL((currentUrl) => currentUrl.toString().includes(urlFragment), options);
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = BasePage;
