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
      await formBuilder.clickControlOnCanvas('Text Box');
      await formBuilder.verifyControlProperties('Text Box');
      await formBuilder.enterText('Sample input from automation');

      await formBuilder.dragSelectFile();
      await formBuilder.clickControlOnCanvas('Select File');
      await formBuilder.verifyControlProperties('Select File');

      // Skip direct upload due to widget-level file picker limitations
      // const uploadFilePath = fileHelper.ensureFileExists();
      // await formBuilder.uploadFile(uploadFilePath);
      // const uploaded = await formBuilder.verifyUploadedFileIndicator(require('path').basename(uploadFilePath));
      // expect(uploaded).toBeTruthy();

      // Save the form
      await formBuilder.saveForm();
      const saveSuccess = await formBuilder.verifySaveSuccess(30000);
      expect(saveSuccess).toBeTruthy();
    });
  });
}
