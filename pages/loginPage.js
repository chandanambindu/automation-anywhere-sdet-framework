
const BasePage = require('./basePage');
const env = require('../config/env');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"], button[name="submitLogin"], button:has-text("Log in"), button:has-text("Login")');
  }

  async openLoginPage(url) {
    const target = url || process.env.BASE_URL || env.baseURL || '/';
    try {
      await this.page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (err) {
      // retry with different strategies to work around intermittent HTTP/2 issues
      try {
        await this.page.goto(target, { waitUntil: 'load', timeout: 60000 });
      } catch (err2) {
        // fallback: navigate to origin then to full path
        try {
          const urlObj = new URL(target);
          await this.page.goto(urlObj.origin, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await this.page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
        } catch (err3) {
          throw err3;
        }
      }
    }
  }

  async login(username, password) {
    // Some sites require clicking a Sign In / Login link first
    const signInSelectors = [
      'text=Sign in',
      'text=Sign In',
      'text=Log in',
      'text=Login',
      'a[href*="/login" i]',
    ];

    for (const sel of signInSelectors) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible()) {
          await el.click();
          break;
        }
      } catch (e) {
        // ignore
      }
    }

    await this.page.locator('label:has-text("Username")').waitFor({ state: 'visible', timeout: 30000 });
    await this.usernameInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.usernameInput.fill(username);
    await this.passwordInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.passwordInput.fill(password);
    await this.loginButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.loginButton.click();
  }
}

module.exports = LoginPage;
