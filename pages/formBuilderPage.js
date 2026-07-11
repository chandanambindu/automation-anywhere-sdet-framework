const BasePage = require('./basePage');
const { dragAndDrop } = require('../utils/dom');

class FormBuilderPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async _getBuilderContext() {
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    const iframeHandle = this.page.locator('iframe.modulepage-frame').first();
    if (await iframeHandle.count().catch(() => 0)) {
      return { type: 'frame', frame: this.page.frameLocator('iframe.modulepage-frame').first() };
    }
    const frame = this.page.frames().find((f) => {
      const url = f.url();
      return /modules\/attended|file\/form|form\/edit|module\/attended/i.test(url)
        || /modulepage/i.test(f.name());
    });
    if (frame) return { type: 'frame', frame };
    return { type: 'page', page: this.page };
  }

  _ctxLocator(ctx, selector) {
    return ctx.type === 'frame' ? ctx.frame.locator(selector) : this.page.locator(selector);
  }

  async fillMandatoryDetails(name, description) {
    const nameInput = this.page.locator('input[name="name"], input[placeholder="Required"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 15000 });
    await nameInput.fill(name);

    const descInput = this.page.locator('input[name="description"], textarea').first();
    if (await descInput.count()) {
      await descInput.fill(description);
    }

    const createBtn = this.page.getByRole('button', { name: 'Create & edit' }).first();
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.click({ force: true });

    await this.page.waitForTimeout(1500);
    await this.page.locator('button:has-text("Text Box"), button:has-text("Select File")').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  }

  async dragTextBox() {
    const ctx = await this._getBuilderContext();
    const control = this._ctxLocator(ctx, 'button:has-text("Text Box")').first();
    const canvas = this._ctxLocator(ctx, 'div.formbuilder-formcanvas, div.formcanvas-content, div.editor-layout__canvas').first();
    await control.waitFor({ state: 'visible', timeout: 30000 });
    await canvas.waitFor({ state: 'visible', timeout: 30000 });
    await control.dragTo(canvas, { force: true }).catch(async () => {
      await this.page.waitForTimeout(500);
      await control.click({ force: true });
    });
  }

  async dragSelectFile() {
    const ctx = await this._getBuilderContext();
    const control = this._ctxLocator(ctx, 'button:has-text("Select File")').first();
    const canvas = this._ctxLocator(ctx, 'div.formbuilder-formcanvas, div.formcanvas-content, div.editor-layout__canvas').first();
    await control.waitFor({ state: 'visible', timeout: 30000 });
    await canvas.waitFor({ state: 'visible', timeout: 30000 });
    await control.dragTo(canvas, { force: true }).catch(async () => {
      await this.page.waitForTimeout(500);
      await control.click({ force: true });
    });
  }

  async verifyPropertiesPanel() {
    const ctx = await this._getBuilderContext();
    const propPanel = this._ctxLocator(ctx, 'div.property-pane, div.editor-details').first();
    await propPanel.waitFor({ state: 'visible', timeout: 10000 });
  }

  async enterText(text) {
    const ctx = await this._getBuilderContext();
    const textInput = this._ctxLocator(ctx, 'input[type="text"], textarea').first();
    await textInput.waitFor({ state: 'visible', timeout: 30000 });
    await textInput.fill(text);
  }

  async uploadFile(filePath) {
    const ctx = await this._getBuilderContext();
    const root = ctx.type === 'frame' ? ctx.frame : this.page;
    let browseLink = root.locator('a.preview-label__browseText').first();
    if (await browseLink.count() === 0) {
      browseLink = root.getByText('browse', { exact: false }).first();
    }
    if (await browseLink.count() === 0) {
      throw new Error('Browse link not found');
    }

    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      browseLink.click({ force: true }),
    ]);

    await fileChooser.setFiles(filePath);
    await this.page.waitForTimeout(500);
  }

  async verifyUploadedFileIndicator(fileName) {
    const ctx = await this._getBuilderContext();
    const root = ctx.type === 'frame' ? ctx.frame : this.page;
    const indicators = await root.locator(`text=${fileName}, text=*${fileName}*`).all();
    return indicators.length > 0;
  }

  async saveForm() {
    const ctx = await this._getBuilderContext();
    const saveBtn = this._ctxLocator(ctx, 'button:has-text("Save")').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 30000 });
    await saveBtn.click();
  }

  async verifySaveSuccess(timeout = 10000) {
    try {
      await this.page.locator('text=Saved, text=successfully').first().waitFor({ state: 'visible', timeout });
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = FormBuilderPage;
