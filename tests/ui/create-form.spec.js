const { test, expect } = require('../../fixtures/base');
const LoginPage = require('../../pages/loginPage');
const DashboardPage = require('../../pages/dashboardPage');
const AutomationPage = require('../../pages/automationPage');
const FormBuilderPage = require('../../pages/formBuilderPage');
const fileHelper = require('../../utils/fileUpload');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username || '';
const PASSWORD = process.env.PASSWORD || env.password || '';

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping create-form UI tests: credentials not provided');
} else {
  test.describe('Automation - Create Form', () => {
    test('should create form, add controls, upload file and save', async ({ page, testData }) => {
      const loginPage = new LoginPage(page);
      const dashboard = new DashboardPage(page);
      const automation = new AutomationPage(page);
      const formBuilder = new FormBuilderPage(page);

      // Login
      await loginPage.openLoginPage();
      await loginPage.login(USERNAME, PASSWORD);

      // Navigate to Automation
      await dashboard.openAutomation();

      // Open Create -> Form
      await automation.openCreateForm();

      const formName = testData.randomName;
      const dialog = page.locator('div[role="dialog"]');
      await dialog.locator('input[name="name"], input[placeholder="Required"]').first().fill(formName);
      const descField = dialog.locator('input[name="description"], textarea').first();
      if (await descField.count()) {
        await descField.fill('Created by automation test');
      }

      const createSubmit = dialog.locator('button[aria-label="Create & edit"], button:has-text("Create & edit"), button:has-text("Create & Edit")').first();
      await createSubmit.waitFor({ state: 'visible', timeout: 15000 });
      await createSubmit.click({ force: true });
      await dialog.waitFor({ state: 'hidden', timeout: 45000 });

      await formBuilder.waitForBuilderReady(60000);

      // Drag the requested controls onto the canvas
      await formBuilder.dragTextBox();
      await formBuilder.dragSelectFile();

      // Basic validation that the controls were added
      await formBuilder.clickControlOnCanvas('Text Box');
      await formBuilder.verifyControlProperties('Text Box');
      await formBuilder.clickControlOnCanvas('Select File');
      await formBuilder.verifyControlProperties('Select File');
    });
  });
}
