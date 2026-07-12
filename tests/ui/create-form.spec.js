const { test, expect } = require('../../fixtures/base');
const LoginPage = require('../../pages/loginPage');
const DashboardPage = require('../../pages/dashboardPage');
const AutomationPage = require('../../pages/automationPage');
const FormBuilderPage = require('../../pages/formBuilderPage');
const fileHelper = require('../../utils/fileUpload');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username || '';
const PASSWORD = process.env.PASSWORD || env.password || '';
function getAppBaseURL() {
  const loginUrl = process.env.LOGIN_URL || env.loginURL || process.env.BASE_URL || env.baseURL;
  try {
    return new URL(loginUrl).origin;
  } catch (e) {
    return process.env.API_BASE_URL || env.apiBaseURL || process.env.BASE_URL || env.baseURL || 'https://community.cloud.automationanywhere.digital';
  }
}
if (!USERNAME || !PASSWORD) {
  console.warn('Skipping create-form UI tests: credentials not provided');
} else {
  test.describe('Use Case 1 - Automation - Create Form', () => {
    test('Use Case 1: create form, add controls, upload file and save', async ({ page, testData }) => {
      test.setTimeout(180000);
      const loginPage = new LoginPage(page);
      const dashboard = new DashboardPage(page);
      const automation = new AutomationPage(page);
      const formBuilder = new FormBuilderPage(page);

      // Login
      await loginPage.openLoginPage();
      await loginPage.login(USERNAME, PASSWORD);
      await dashboard.waitForDashboardReady();

      // Navigate to Automation and open Create -> Form
      await dashboard.openAutomation();
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

      // Basic validation that the controls were added and interact with properties
      await formBuilder.clickControlOnCanvas('Text Box');
      await formBuilder.verifyControlProperties('Text Box');
      // Enter text into the Text Box control
      await formBuilder.enterText('Sample input from automation');

      await formBuilder.clickControlOnCanvas('Select File');
      await formBuilder.verifyControlProperties('Select File');

      const fileDetails = fileHelper.getUploadFileDetails();
      const filePath = fileDetails.filePath;
      const uploadSuccess = await formBuilder.uploadFile(filePath);
      expect(uploadSuccess).toBeTruthy();

      // Save the form and verify save success
      await formBuilder.saveForm();
      const saved = await formBuilder.verifySaveSuccess(30000);
      expect(saved).toBeTruthy();

      // Click Preview then Close (if preview appears)
      try {
        const previewBtn = page.locator('button:has-text("Preview"), text=Preview').first();
        if (await previewBtn.count() > 0) {
          await previewBtn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(1000);
          const closePreview = page.locator('button:has-text("Close"), button[aria-label="Close"]').first();
          if (await closePreview.count() > 0) {
            await closePreview.click({ force: true }).catch(() => {});
            await page.waitForTimeout(500);
          }
        }
      } catch (e) {}
    });
  });
}
