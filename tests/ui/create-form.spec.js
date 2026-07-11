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

      // Fill mandatory details
      const formName = `${testData.randomName}-form`;
      await formBuilder.fillMandatoryDetails(formName, 'Created by automation test');

      // Drag controls onto canvas
      await formBuilder.dragTextBox();
      await formBuilder.dragSelectFile();

      // Verify properties panel
      await formBuilder.verifyPropertiesPanel();

      // Enter text into the textbox
      await formBuilder.enterText('Sample input from automation');

      // Upload a file
      const uploadFilePath = fileHelper.ensureFileExists();
      await formBuilder.uploadFile(uploadFilePath);

      // Save the form
      await formBuilder.saveForm();

      // Verify save succeeded - application-specific indicator may vary.
      // We'll try common success indicators; replace with app-specific selector if needed.
      const successSelectors = [
        page.locator('text=Saved'),
        page.locator('text=successfully'),
        page.locator('[role="status"]'),
        page.locator('text=Form saved'),
      ];

      let found = false;
      for (const sel of successSelectors) {
        try {
          if (await sel.isVisible()) {
            found = true;
            break;
          }
        } catch (e) {
          // ignore missing selectors
        }
      }

      expect(found).toBeTruthy();
    });
  });
}
