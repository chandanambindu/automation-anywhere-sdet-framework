
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
    const signInSelectors = [
      'text=Sign in',
      'text=Sign In',
      'text=Log in',
      'text=Login',
      'a[href*="/login" i]',
    ];

    const usernameSel = 'input[name="username"]:visible';
    const passwordSel = 'input[name="password"]:visible';
    const loginBtnSel = 'button[name="submitLogin"]:visible, button:has-text("Log in"):visible, button:has-text("Login"):visible';

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
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

        await this.page.waitForSelector(usernameSel, { state: 'visible', timeout: 30000 });
        await this.page.waitForSelector(passwordSel, { state: 'visible', timeout: 30000 });

        const usernameField = this.page.locator(usernameSel).first();
        const passwordField = this.page.locator(passwordSel).first();
        await usernameField.click({ force: true });
        await usernameField.fill(username, { timeout: 5000 });
        await passwordField.click({ force: true });
        await passwordField.fill(password, { timeout: 5000 });

        const loginBtn = this.page.locator(loginBtnSel).first();
        await loginBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForFunction(
          selector => {
            const el = document.querySelector(selector);
            return el && !el.disabled;
          },
          'button[name="submitLogin"], button:has-text("Log in"), button:has-text("Login")',
          { timeout: 10000 }
        ).catch(() => {});

        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}),
          loginBtn.click({ force: true }),
        ]);

        await this.page.waitForTimeout(4000);
        const stillOnLogin = await this.page.locator(usernameSel).isVisible().catch(() => false);
        const loggedOutMessage = await this.page.locator('text=Please log in again, text=logged out, text=Code:').first().isVisible().catch(() => false);
        if (!stillOnLogin && !loggedOutMessage) {
          return;
        }

        if (attempt < 2) {
          await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
          continue;
        }

        throw new Error('Login attempt did not progress to the dashboard');
      } catch (err) {
        if (attempt < 2) {
          await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
          continue;
        }
        await this.page.screenshot({ path: 'screenshots/login-error.png', fullPage: true }).catch(() => {});
        throw err;
      }
    }
  }
}

module.exports = LoginPage;
