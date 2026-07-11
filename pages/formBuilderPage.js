const BasePage = require('./basePage');
const { dragAndDrop } = require('../utils/dom');

class FormBuilderPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
    this.formNameInput = page.locator('input[name*="name" i], input[placeholder*="name" i]').first();
    this.formDescriptionInput = page.locator('textarea, input[type="text"]').nth(1);
    this.createButton = page.locator('button:has-text("Create")').first();
    this.textBoxTool = page.locator('text=TextBox').first();
    this.selectFileTool = page.locator('text=Select File').first();
    this.canvas = page.locator('[data-testid="canvas"], .canvas, #canvas, [role="main"]') ;
    this.propertiesPanel = page.locator('text=Properties').first();
    this.saveButton = page.locator('button:has-text("Save")').first();
  }

  async fillMandatoryDetails(name, description) {
    await this.formNameInput.waitFor({ state: 'visible' });
    await this.formNameInput.fill(name);
    await this.formDescriptionInput.fill(description);
    await this.createButton.click();
  }

  async dragControlToCanvas(controlLocator) {
    // Try Playwright dragTo first, fall back to JS-driven dragAndDrop
    try {
      await controlLocator.waitFor({ state: 'visible' });
      await controlLocator.dragTo(this.canvas);
    } catch (e) {
      await dragAndDrop(this.page, controlLocator, this.canvas);
    }
  }

  async dragTextBox() {
    await this.dragControlToCanvas(this.textBoxTool);
  }

  async dragSelectFile() {
    await this.dragControlToCanvas(this.selectFileTool);
  }

  async verifyPropertiesPanel() {
    await this.propertiesPanel.waitFor({ state: 'visible' });
  }

  async enterText(text) {
    const textInput = this.page.locator('input[type="text"], textarea').first();
    await textInput.waitFor({ state: 'visible' });
    await textInput.fill(text);
  }

  async uploadFile(filePath) {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'visible' });
    await fileInput.setInputFiles(filePath);
  }

  async verifyUploadedFileIndicator(expectedFileName) {
    // Look for file name in common places. Caller should pass the actual fileName.
    const candidates = [
      this.page.locator(`text=${expectedFileName}`),
      this.page.locator(`[data-file-name="${expectedFileName}"]`),
      this.page.locator('text=Uploaded'),
      this.page.locator('text=Upload complete'),
    ];

    for (const loc of candidates) {
      try {
        if (await loc.isVisible()) return true;
      } catch (e) {
        // ignore
      }
    }

    return false;
  }

  async saveForm() {
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.click();
  }
}

module.exports = FormBuilderPage;
