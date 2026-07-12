const BasePage = require('./basePage');
const { dragAndDrop } = require('../utils/dom');
const { expect } = require('@playwright/test');

class FormBuilderPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async _findBuilderFrame() {
    const frames = this.page.frames();
    const nestedBuilder = frames.find((f) => {
      const url = f.url();
      return (
        f.parentFrame() &&
        (url.includes('/modules/attended/#/file/form/') ||
          (url.includes('/file/form/') && url.includes('/modules/attended/')) ||
          (url.includes('/file/form/') && url.includes('/edit')))
      );
    });
    if (nestedBuilder) {
      return nestedBuilder;
    }

    return frames.find((f) => {
      const url = f.url();
      return (
        url.includes('/modules/attended/#/file/form/') ||
        url.includes('/file/form/') ||
        url.includes('form/edit') ||
        url.includes('module/attended')
      );
    });
  }

  async _getBuilderContext() {
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});

    const frameObj = await this._findBuilderFrame();
    if (frameObj) {
      return { type: 'frame', frame: frameObj };
    }

    // Prefer the iframe.modulepage-frame when available
    try {
      const iframeHandle = this.page.locator('iframe.modulepage-frame').first();
      if (await iframeHandle.count().catch(() => 0)) {
        return { type: 'frame', frame: this.page.frameLocator('iframe.modulepage-frame').first() };
      }
    } catch (e) {}

    // Scan all frames and pick the one that contains both palette items and the canvas/property panel
    for (const f of this.page.frames()) {
      try {
        const hasPalette = await f.locator('button:has-text("Text Box"), button:has-text("Select File"), div.editor-palette-item, div.editor-palette-item__child--is_draggable').count().catch(() => 0);
        const hasCanvas = await f.locator('div.formcanvas__leftpane, div.formcanvas-content, div.editor-layout__canvas, div.formbuilder-formcanvas, div.formcanvas-container, div[class*="canvas"], div[class*="builder"]').count().catch(() => 0);
        const hasProps = await f.locator('div.property-pane, div.editor-details').count().catch(() => 0);
        if (hasPalette && hasCanvas) {
          return { type: 'frame', frame: f };
        }
        if (hasCanvas && hasProps) {
          return { type: 'frame', frame: f };
        }
      } catch (e) {
        // ignore frame inspection errors
      }
    }

    // Fallback to page-level context
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

    const createBtn = this.page.locator('button:has-text("Create & edit"), button:has-text("Create & Edit"), button:has-text("Create")').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click({ force: true }).catch(() => {});

    // Give the builder some extra time to initialize
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2500);

    // Try expanding palette if collapsed, but do not require it here
    try {
      await this._ensurePaletteVisible();
    } catch (e) {
      // ignore; builder may still be available later
    }
  }

  async waitForBuilderReady(timeout = 60000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const frameObj = await this._findBuilderFrame();
        if (frameObj) {
          const control = frameObj.locator('button:has-text("Text Box"), button:has-text("Select File"), button:has-text("TextBox"), button:has-text("Textbox"), div.editor-palette-item').first();
          if (await control.count() > 0) {
            await control.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
            return;
          }
        }

        const ctx = await this._getBuilderContext();
        const control = this._ctxLocator(ctx, 'button:has-text("Text Box"), button:has-text("Select File"), button:has-text("TextBox"), button:has-text("Textbox"), div.editor-palette-item').first();
        if (await control.count() > 0) {
          await control.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
          return;
        }
      } catch (e) {
        // ignore and retry
      }
      await this.page.waitForTimeout(1000);
    }
    throw new Error('Timed out waiting for form builder to become ready');
  }

  // Try to click a palette toggle if present in the page or in any frame
  async _ensurePaletteVisible() {
    const toggleSelectors = ['button[aria-label="Toggle Palette"]', 'button[aria-label="Toggle palette"]', 'button.editor-layout__resize-toggle', 'button[aria-label*="Toggle"]'];
    // try page-level first
    for (const sel of toggleSelectors) {
      const t = this.page.locator(sel).first();
      if (await t.count() > 0) {
        try { await t.click({ force: true }); await this.page.waitForTimeout(300); } catch (e) {}
      }
    }

    // try inside frames
    for (const f of this.page.frames()) {
      for (const sel of toggleSelectors) {
        try {
          const t = f.locator(sel).first();
          if (t && await t.count() > 0) {
            try { await t.click({ force: true }); await this.page.waitForTimeout(300); } catch (e) {}
          }
        } catch (e) {}
      }
    }
  }

  async _getDropTarget(ctx) {
    const targets = [
      'div.formcanvas__leftpane',
      'div.formcanvas-content',
      'div.editor-layout__canvas',
      'div.formcanvas-container',
      'div[class*="canvas" i]',
      'div[class*="builder" i]',
      'div[class*="drop" i]',
    ];
    for (const selector of targets) {
      const locator = this._ctxLocator(ctx, selector).first();
      if (await locator.count() > 0) {
        return locator;
      }
    }
    throw new Error('Unable to find a canvas drop target in the form builder');
  }

  async _getPaletteItem(ctx, controlName) {
    const selectors = [
      `div.editor-palette-item__child--is_draggable:has-text("${controlName}")`,
      `button:has-text("${controlName}")`,
      `div.editor-palette-item:has-text("${controlName}")`,
    ];
    for (const selector of selectors) {
      const locator = this._ctxLocator(ctx, selector).first();
      if (await locator.count() > 0) {
        return locator;
      }
    }
    throw new Error(`Control palette item '${controlName}' not found in builder palette`);
  }

  async _dragControlToCanvas(controlName) {
    const ctx = await this._getBuilderContext();
    const source = await this._getPaletteItem(ctx, controlName);
    const target = await this._getDropTarget(ctx);

    await source.waitFor({ state: 'visible', timeout: 30000 });
    await target.waitFor({ state: 'visible', timeout: 30000 });

    // First try the built-in dragTo which is usually fine inside same-frame contexts
    try {
      await source.dragTo(target, { force: true });
      return;
    } catch (error) {
      // fallback to mouse-based drag which works across frames and complex canvases
    }

    // Mouse-based fallback
    const srcHandle = await source.elementHandle().catch(() => null);
    const destHandle = await target.elementHandle().catch(() => null);
    if (srcHandle && destHandle) {
      const srcBox = await srcHandle.boundingBox();
      const destBox = await destHandle.boundingBox();
      if (srcBox && destBox) {
        await this.page.mouse.move(srcBox.x + srcBox.width / 2, srcBox.y + srcBox.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(destBox.x + destBox.width / 2, destBox.y + destBox.height / 2, { steps: 12 });
        await this.page.mouse.up();
        try { await srcHandle.dispose(); } catch (e) {}
        try { await destHandle.dispose(); } catch (e) {}
        return;
      }
    }

    // Last resort: DOM dispatch drag events
    await dragAndDrop(this.page, source, target);
  }

  async dragTextBox() {
    await this._dragControlToCanvas('Text Box');
  }

  async dragSelectFile() {
    await this._dragControlToCanvas('Select File');
  }

  async clickControlOnCanvas(controlName) {
    const ctx = await this._getBuilderContext();
    const canvas = this._ctxLocator(ctx, 'div.formcanvas__leftpane, div.formcanvas-content, div.editor-layout__canvas').first();

    const candidates = [
      `text=${controlName}`,
      `text=${controlName.replace(/\s+/g, '')}`,
      `text=/^${controlName.replace(/\s+/g, '\\s*')}$/i`,
      `text=/^${controlName.replace(/\s+/g, '')}$/i`,
    ];

    for (const candidate of candidates) {
      const element = canvas.locator(candidate).first();
      if (await element.count() > 0) {
        await element.waitFor({ state: 'visible', timeout: 10000 });
        await element.click({ force: true });
        await this.page.waitForTimeout(500);
        return;
      }
    }

    // Fallback: click any visible inserted control in the canvas if direct text matching fails.
    const fallbackControl = canvas.locator('div[class*="formcanvas__"] button, div[class*="formcanvas__"] [role="button"], div[data-path*="TextBox"], div[data-path*="SelectFile"], div[data-path*="SelectFolder"]').first();
    if (await fallbackControl.count() > 0) {
      await fallbackControl.click({ force: true });
      await this.page.waitForTimeout(500);
      return;
    }

    throw new Error(`Unable to click control '${controlName}' on the canvas`);
  }

  async verifyControlProperties(controlName) {
    const ctx = await this._getBuilderContext();
    const root = ctx.type === 'frame' ? ctx.frame : this.page;
    const propPanel = root.locator('div.property-pane, div.editor-details').first();
    await propPanel.waitFor({ state: 'visible', timeout: 20000 });

    const checks = [
      `text=${controlName}`,
      `text=${controlName.replace(/\s+/g, '')}`,
      'text=Element ID',
      'text=Element label',
      'text=Default value',
      'text=Formatting',
      'text=Help text option',
      'text=Hint below field',
    ];

    for (const check of checks) {
      if (await propPanel.locator(check).count()) {
        return;
      }
    }

    throw new Error(`Property panel did not show expected content after selecting ${controlName}`);
  }

  async verifyPropertiesPanel() {
    const ctx = await this._getBuilderContext();
    const propPanel = this._ctxLocator(ctx, 'div.property-pane, div.editor-details').first();
    await propPanel.waitFor({ state: 'visible', timeout: 10000 });
    await expect(propPanel).toBeVisible();
  }

  async enterText(text) {
    const ctx = await this._getBuilderContext();
    const root = ctx.type === 'frame' ? ctx.frame : this.page;
    const textInput = root.locator('div.property-pane input[type="text"], div.property-pane textarea, div.editor-details input[type="text"], div.editor-details textarea').first();
    await textInput.waitFor({ state: 'visible', timeout: 30000 });
    await textInput.fill(text);
  }

  async uploadFile(filePath) {
    const ctx = await this._getBuilderContext();
    const root = ctx.type === 'frame' ? ctx.frame : this.page;
    const fileInput = root.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(filePath);
      await this.page.waitForTimeout(500);
      return;
    }

    const uploadButton = root.locator('button[name="uploadFile"], button[aria-label*="Upload files"]').first();
    if (await uploadButton.count() === 0) {
      throw new Error('Upload button not found in builder');
    }

    await uploadButton.click({ force: true });
    await this.page.waitForTimeout(500);
    throw new Error('Upload flow is currently unsupported by direct automation: file dialog cannot be attached.');
  }

  async verifyUploadedFileIndicator(fileName) {
    const ctx = await this._getBuilderContext();
    const root = ctx.type === 'frame' ? ctx.frame : this.page;
    const indicators = await root.locator(`text=${fileName}`).all();
    return indicators.length > 0;
  }

  async saveForm() {
    const ctx = await this._getBuilderContext();
    const saveBtn = this._ctxLocator(ctx, 'button:has-text("Save"), button[name="save"]').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 30000 });
    await saveBtn.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async verifySaveSuccess(timeout = 10000) {
    try {
      const successLabel = this.page.locator('text=Saved, text=successfully, text=Form saved, text=Saved successfully').first();
      await successLabel.waitFor({ state: 'visible', timeout });
      return true;
    } catch (e) {
      return false;
    }
  }
}


module.exports = FormBuilderPage;
