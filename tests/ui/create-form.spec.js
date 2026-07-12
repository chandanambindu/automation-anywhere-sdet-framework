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

      // Basic validation that the controls were added and interact with properties
      await formBuilder.clickControlOnCanvas('Text Box');
      await formBuilder.verifyControlProperties('Text Box');
      // Enter text into the Text Box control
      await formBuilder.enterText('Sample input from automation');

      await formBuilder.clickControlOnCanvas('Select File');
      await formBuilder.verifyControlProperties('Select File');

      // In the Select File properties choose 'One Log' and upload a file into it
      let fileDetails;
      try {
        fileDetails = fileHelper.getUploadFileDetails();
        const filePath = fileDetails.filePath;
        const ctx = await formBuilder._getBuilderContext();
        const root = ctx.type === 'frame' ? ctx.frame : page;

        // Try to select the 'One Log' option in properties
        const oneLog = root.locator('label:has-text("One Log"), text=One Log').first();
        if (await oneLog.count() > 0) {
          await oneLog.click({ force: true }).catch(() => {});
          await page.waitForTimeout(500);
        }

        // Try to set the input file if present
        const propFileInput = root.locator('input[type="file"]').first();
        if (await propFileInput.count() > 0) {
          await propFileInput.setInputFiles(filePath);
        } else {
          // fallback: try the page-level file input (some builders render it outside)
          const globalFileInput = page.locator('input[type="file"]').first();
          if (await globalFileInput.count() > 0) {
            await globalFileInput.setInputFiles(filePath);
          } else {
            // fallback to helper method; it will click upload button if available
            try { await formBuilder.uploadFile(filePath); } catch (e) { /* ignore */ }
          }
        }

        // If a 'Find' button exists in the properties, click it and enter a search term
        const findBtn = root.locator('button:has-text("Find"), button:has-text("Browse")').first();
        if (await findBtn.count() > 0) {
          await findBtn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(500);
          const findInput = root.locator('input[placeholder*="Find"], input[aria-label*="Find"], input[type="search"]').first();
          if (await findInput.count() > 0) {
            await findInput.fill('sample');
            await page.waitForTimeout(300);
          }
        }
      } catch (e) {
        // Non-fatal - continue test even if upload or find fail
      }

      // Save the form and verify uploaded document and save success
      await formBuilder.saveForm();
      const saved = await formBuilder.verifySaveSuccess(30000);
      expect(saved).toBeTruthy();

      if (fileDetails && fileDetails.fileName) {
        const uploaded = await formBuilder.verifyUploadedFileIndicator(fileDetails.fileName);
        expect(uploaded).toBeTruthy();
      }

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

      // Return to repository folder and open the saved form by name, then verify uploaded file in finder
      try {
        const base = process.env.BASE_URL || process.env.API_BASE_URL || env.apiBaseURL || env.baseURL || 'https://community.cloud.automationanywhere.digital';
        const BOTS_FOLDER_ID = process.env.BOTS_FOLDER_ID || env.botsFolderId || '32996145';
        const folderUrl = `${base}/#/bots/repository/private/folders/${BOTS_FOLDER_ID}`;
        await page.goto(folderUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Find the file by title and open it
        const fileElem = page.locator(`text=${formName}`).first();
        await fileElem.waitFor({ state: 'visible', timeout: 15000 });
        await fileElem.click({ force: true });
        await page.waitForTimeout(1000);

        // Sometimes clicking the name opens a details pane; try to click Open/Edit
        const openBtn = page.locator('button:has-text("Open"), button:has-text("Edit"), button:has-text("Create & edit")').first();
        if (await openBtn.count() > 0) {
          await openBtn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(2000);
        }

        // Wait for builder to load for the opened form
        await formBuilder.waitForBuilderReady(30000);

        // Hover over the uploaded file in the finder/properties to ensure it is present
        if (fileDetails && fileDetails.fileName) {
          const ctx2 = await formBuilder._getBuilderContext();
          const root2 = ctx2.type === 'frame' ? ctx2.frame : page;
          const uploadedElem = root2.locator(`text=${fileDetails.fileName}`).first();
          await uploadedElem.waitFor({ state: 'visible', timeout: 15000 });
          await uploadedElem.hover().catch(() => {});
          await page.waitForTimeout(500);
        }

        // Close the editor/view
        const closeBtn = page.locator('button:has-text("Close"), button[aria-label="Close"]').first();
        if (await closeBtn.count() > 0) {
          await closeBtn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(500);
        }
      } catch (e) {
        // if any of these verification steps fail, surface the error
        throw e;
      }
    });
  });
}
