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

  async dismissOverlays() {
    // Attempts to close or remove common blocking overlays (banners, guides, modals)
    const closeSelectors = [
      '#pendo-resource-center-container button',
      '.pendo-close',
      '.pendo-guide-close',
      'button[aria-label="Close"]',
      'button[title="Close"]',
      '.modal .close',
      '.toast-close',
      '.banner .close',
      '.notification .close',
      '[data-testid="close-button"]',
      '.cookie-accept',
      '.rio-modal .rio-modal__close',
    ];

    for (const sel of closeSelectors) {
      try {
        const loc = this.page.locator(sel).first();
        if (await loc.isVisible().catch(() => false)) {
          await loc.click().catch(() => {});
        }
      } catch (e) {
        // ignore
      }
    }

    // As a last resort remove known overlay nodes from DOM to unblock clicks
    await this.page.evaluate(() => {
      try {
        const ids = ['pendo-resource-center-container', 'pendo-overlay', 'pendo-guide-container'];
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el && el.parentNode) el.parentNode.removeChild(el);
        });
        // remove aria-modal dialogs that are not expected
        document.querySelectorAll('[role="dialog"]').forEach(d => {
          if (d && d.getAttribute('aria-modal') === 'false') {
            d.parentNode && d.parentNode.removeChild(d);
          }
        });
      } catch (e) {}
    }).catch(() => {});
  }
}

module.exports = BasePage;
