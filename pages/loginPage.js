
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
    const target = url || process.env.LOGIN_URL || env.loginURL || process.env.BASE_URL || env.baseURL || '/';
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

    const usernameSel = 'input[name="username"]';
    const passwordSel = 'input[name="password"]';
    const loginBtnSel = 'button[name="submitLogin"], button[type="submit"], button:has-text("Log in"), button:has-text("Login")';

    try {
      // Wait for username or password input to appear
      await Promise.race([
        this.page.waitForSelector(usernameSel, { state: 'visible', timeout: 30000 }),
        this.page.waitForSelector(passwordSel, { state: 'visible', timeout: 30000 }),
      ]);

      // Try normal fills first
      try {
        await this.page.locator(usernameSel).fill(username, { timeout: 5000 });
        await this.page.locator(passwordSel).fill(password, { timeout: 5000 });
      } catch (e) {
        // Fallback: set values via JS and remove tabindex which may block interaction
        await this.page.evaluate((uSel, pSel, uVal, pVal) => {
          const elU = document.querySelector(uSel);
          const elP = document.querySelector(pSel);
          if (elU) {
            try { elU.removeAttribute('tabindex'); } catch (e) {}
            elU.value = uVal;
            elU.dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (elP) {
            try { elP.removeAttribute('tabindex'); } catch (e) {}
            elP.value = pVal;
            elP.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, usernameSel, passwordSel, username, password);
      }

      // Click login
      await this.page.waitForSelector(loginBtnSel, { state: 'visible', timeout: 10000 });
      await this.page.locator(loginBtnSel).first().click();
    } catch (err) {
      await this.page.screenshot({ path: 'screenshots/login-error.png', fullPage: true }).catch(() => {});
      throw err;
    }
  }
}

module.exports = LoginPage;
