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
    
    console.log('3. Clicking Create button...');
    const createBtn = page.locator('button[name="createOptions"]').first();
    await createBtn.click();
    
    console.log('4. Waiting 1 second...');
    await page.waitForTimeout(1000);
    
    console.log('5. Clicking Form option...');
    // Get all visible buttons and find Form
    const buttons = await page.locator('button, [role="menuitem"]').all();
    console.log(`Found ${buttons.length} total buttons/menuitems`);
    
    for (const btn of buttons) {
      const text = await btn.textContent().catch(() => '');
      if (text.includes('Form')) {
        const visible = await btn.isVisible().catch(() => false);
        console.log(`Found Form button: visible=${visible}, text="${text.trim()}"`);
        await btn.click();
        break;
      }
    }
    
    console.log('6. Waiting 2 seconds for form to appear...');
    await page.waitForTimeout(2000);
    
    // Check for iframes
    console.log('\n7. Checking for iframes:');
    const frames = page.frames();
    console.log(`Total frames: ${frames.length}`);
    for (let i = 0; i < frames.length; i++) {
      console.log(`  Frame ${i}: ${frames[i].url()}`);
    }
    
    // Look for name input on main page
    console.log('\n8. Looking for inputs on MAIN PAGE:');
    const inputs = await page.locator('input[type="text"], input[placeholder*="name" i], input[placeholder*="form" i], input[name="name"], input[name="description"]').all();
    console.log(`Found ${inputs.length} inputs`);
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const visible = await inputs[i].isVisible().catch(() => false);
      const value = await inputs[i].inputValue().catch(() => '');
      console.log(`  Input ${i}: name="${name}" placeholder="${placeholder}" visible=${visible} value="${value}"`);
    }
    
    // Look for name input in iframe if exists
    if (frames.length > 1) {
      console.log('\n9. Looking for inputs in IFRAME:');
      const iframeInputs = await frames[1].locator('input[type="text"], input[placeholder*="name" i], input[name="name"]').all();
      console.log(`Found ${iframeInputs.length} inputs in iframe`);
      for (let i = 0; i < iframeInputs.length; i++) {
        const name = await iframeInputs[i].getAttribute('name');
        const placeholder = await iframeInputs[i].getAttribute('placeholder');
        const visible = await iframeInputs[i].isVisible().catch(() => false);
        console.log(`  IFrame Input ${i}: name="${name}" placeholder="${placeholder}" visible=${visible}`);
      }
    }
    
    console.log('\n✓ Browser window open. Inspect the form and check console for details.');
    console.log('Press Ctrl+C when done.');
    
    // Keep browser open for 120 seconds
    await new Promise(r => setTimeout(r, 120000));
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
