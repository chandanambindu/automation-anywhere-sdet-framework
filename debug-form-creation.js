const { chromium } = require('playwright');
const dotenv = require('dotenv');
dotenv.config();

const LoginPage = require('./pages/loginPage');
const DashboardPage = require('./pages/dashboardPage');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. Logging in...');
    const loginPage = new LoginPage(page);
    await loginPage.openLoginPage(process.env.LOGIN_URL);
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
    
    console.log('2. Going to Automation...');
    const dashboard = new DashboardPage(page);
    await dashboard.openAutomation();
    
    console.log('3. Looking for Create button...');
    const createBtn = page.locator('button[name="createOptions"], button:has-text("Create")').first();
    console.log('Create button found:', await createBtn.count() > 0);
    
    await createBtn.click();
    console.log('Create button clicked');
    
    await page.waitForTimeout(1500);
    
    // List all buttons/menu items visible
    console.log('\n4. Menu items after clicking Create:');
    const allButtons = await page.locator('button, [role="menuitem"], [role="option"], div[role="button"]').all();
    for (const btn of allButtons) {
      const text = await btn.textContent().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      if (visible && text.trim()) {
        console.log(`   - "${text.trim()}" (visible: ${visible})`);
      }
    }
    
    // Try to find Form button/option
    console.log('\n5. Trying different selectors for Form:');
    const selectors = [
      'button:has-text("Form")',
      '[role="menuitem"]:has-text("Form")',
      '[role="option"]:has-text("Form")',
      'text="Form…"',
      'text=/^Form/'
    ];
    
    for (const sel of selectors) {
      const count = await page.locator(sel).count().catch(() => 0);
      console.log(`   ${sel}: ${count} found`);
    }
    
    // Click Form using the most reliable method
    console.log('\n6. Clicking Form option...');
    await page.locator('button:has-text("Form"), [role="menuitem"]:has-text("Form")').first().click({ force: true });
    
    console.log('Form option clicked');
    await page.waitForTimeout(2000);
    
    // Check for iframes
    console.log('\n7. Checking for iframes:');
    const frames = page.frames();
    console.log(`Total frames: ${frames.length}`);
    frames.forEach((f, i) => {
      console.log(`   Frame ${i}: ${f.url()}`);
    });
    
    // Look for form inputs on page
    console.log('\n8. Looking for form inputs on PAGE:');
    const nameInputs = await page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Form"], input[type="text"]').all();
    console.log(`Found ${nameInputs.length} potential name inputs on page`);
    for (let i = 0; i < Math.min(3, nameInputs.length); i++) {
      const placeholder = await nameInputs[i].getAttribute('placeholder').catch(() => '');
      const name = await nameInputs[i].getAttribute('name').catch(() => '');
      const visible = await nameInputs[i].isVisible().catch(() => false);
      console.log(`   Input ${i}: name="${name}" placeholder="${placeholder}" visible=${visible}`);
    }
    
    // Look for form inputs in iframe
    if (frames.length > 1) {
      console.log('\n9. Looking for form inputs in IFRAME:');
      const iframe = frames[1];
      const iframeInputs = await iframe.locator('input[name="name"], input[placeholder*="name"], input[type="text"]').all();
      console.log(`Found ${iframeInputs.length} potential name inputs in iframe`);
      for (let i = 0; i < Math.min(3, iframeInputs.length); i++) {
        const placeholder = await iframeInputs[i].getAttribute('placeholder').catch(() => '');
        const name = await iframeInputs[i].getAttribute('name').catch(() => '');
        const visible = await iframeInputs[i].isVisible().catch(() => false);
        console.log(`   Input ${i}: name="${name}" placeholder="${placeholder}" visible=${visible}`);
      }
    }
    
    console.log('\n✓ Debug complete. Browser staying open for inspection.');
    console.log('Press Ctrl+C to close when done inspecting.');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
