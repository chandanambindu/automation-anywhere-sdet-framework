require('dotenv').config();

module.exports = {
  baseURL: process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition',
  apiBaseURL: process.env.API_BASE_URL || process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition',
  // Preferred login URL for the cloud community site
  loginURL: process.env.LOGIN_URL || 'https://community.cloud.automationanywhere.digital/#/login?next=/index',
  loginURL: process.env.LOGIN_URL || 'https://community.cloud.automationanywhere.digital/#/login',
  username: process.env.USERNAME || '',
  password: process.env.PASSWORD || '',
  timeout: Number(process.env.TEST_TIMEOUT_MS || 60000),
  retries: Number(process.env.RETRIES || 1),
  browser: process.env.BROWSER || 'chromium',
  headless: process.env.HEADLESS !== 'false',
};
