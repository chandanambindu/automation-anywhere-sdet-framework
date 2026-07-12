const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    locale: 'en-US',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  });

  const page = await context.newPage();
  const target = process.env.DEBUG_URL || 'https://community.cloud.automationanywhere.digital/#/login';

  try {
    console.log('Navigating to', target);
    await page.goto(target, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForTimeout(2000);

    const screenshotPath = 'debug-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Saved screenshot:', screenshotPath);

    const url = page.url();
    console.log('Current URL:', url);

    const hasEmail = await page.$('input[type="email"], input[name*="email" i], input[placeholder*="email" i]') !== null;
    const hasPassword = await page.$('input[type="password"], input[name*="password" i]') !== null;
    console.log('Has email field:', hasEmail);
    console.log('Has password field:', hasPassword);

    const frames = page.frames();
    console.log('Frames count:', frames.length);
    const iframeInfo = frames
      .filter(f => f.url())
      .map(f => ({ url: f.url(), name: f.name() }))
      .slice(0, 10);
    console.log('Iframe samples:', JSON.stringify(iframeInfo, null, 2));

    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log('Body text sample (first 400 chars):\n', bodyText.substring(0, 400));
  } catch (err) {
    console.error('Navigation error:', err.message || err);
  } finally {
    await browser.close();
  }
})();
