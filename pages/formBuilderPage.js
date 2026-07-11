const BasePage = require('./basePage');

class FormBuilderPage extends BasePage {
  constructor(page) {
    super(page);
    this.formNameInput = page.locator('input[name*="name" i], input[placeholder*="name" i]').first();
    this.formDescriptionInput = page.locator('textarea, input[type="text"]').nth(1);
    this.createButton = page.locator('button:has-text("Create")').first();
    this.textBoxTool = page.locator('text=TextBox').first();
    this.selectFileTool = page.locator('text=Select File').first();
    this.propertiesPanel = page.locator('text=Properties').first();
    this.saveButton = page.locator('button:has-text("Save")').first();
  }

  async fillMandatoryDetails(name, description) {
    await this.formNameInput.waitFor({ state: 'visible' });
    await this.formNameInput.fill(name);
    await this.formDescriptionInput.fill(description);
    await this.createButton.click();
  }

  async dragTextBox() {
    await this.textBoxTool.dragTo(this.page.locator('body'));
  }

  async dragSelectFile() {
    await this.selectFileTool.dragTo(this.page.locator('body'));
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

  async saveForm() {
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.click();
  }
}

module.exports = FormBuilderPage;
