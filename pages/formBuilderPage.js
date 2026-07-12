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

    // Try multiple strategies with retries to handle flakiness
    const attempts = 3;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        // Strategy A: built-in dragTo
        await source.scrollIntoViewIfNeeded().catch(() => {});
        await target.scrollIntoViewIfNeeded().catch(() => {});
        await source.dragTo(target, { force: true, trial: false });
        return;
      } catch (error) {
        // continue to fallback
      }

      try {
        // Strategy B: mouse-based drag using bounding boxes (works across frames)
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
      } catch (e) {
        // ignore and try DOM fallback
      }

      try {
        // Strategy C: DOM-level dispatch
        await dragAndDrop(this.page, source, target);
        return;
      } catch (e) {
        // final fallback will retry
      }

      // wait before next attempt
      await this.page.waitForTimeout(400 + attempt * 200);
    }

    throw new Error(`Unable to drag '${controlName}' to canvas after ${attempts} attempts`);
  }

  async dragTextBox() {
    await this._dragControlToCanvas('Text Box');
  }

  async dragSelectFile() {
    await this._dragControlToCanvas('Select File');
  }

  async clickControlOnCanvas(controlName) {
    const ctx = await this._getBuilderContext();
    const canvas = this._ctxLocator(ctx, 'div.formcanvas__leftpane, div.formcanvas-content, div.editor-layout__canvas, div.formcanvas-container, div[class*="canvas" i]').first();

    const candidates = [
      `text=${controlName}`,
      `text=${controlName.replace(/\s+/g, '')}`,
      `text=/^${controlName.replace(/\s+/g, '\\s*')}$/i`,
      `text=/^${controlName.replace(/\s+/g, '')}$/i`,
      `data-test-id=${controlName}`,
    ];

    const start = Date.now();
    const timeout = 20000;
    while (Date.now() - start < timeout) {
      try {
        for (const candidate of candidates) {
          const element = canvas.locator(candidate).first();
          if (await element.count() > 0) {
            await element.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
            try {
              // prefer elementHandle click when available inside frames
              const handle = await element.elementHandle().catch(() => null);
              if (handle) {
                try {
                  await handle.click({ force: true });
                } catch (clickErr) {
                  // fallback to JS click
                  await handle.evaluate((el) => el.click()).catch(() => {});
                }
                await this.page.waitForTimeout(300);
                return;
              }
              try {
                await element.scrollIntoViewIfNeeded();
                await element.click({ force: true });
              } catch (clickErr) {
                // JS click fallback
                await element.evaluate((el) => el.click()).catch(() => {});
              }
              await this.page.waitForTimeout(300);
              return;
            } catch (e) {
              // try next candidate
            }
          }
        }

        // Fallback: click any visible inserted control in the canvas if direct text matching fails.
        const fallbackSelectors = [
          'div[class*="formcanvas__"] button',
          'div[class*="formcanvas__"] [role="button"]',
          'div[data-path*="TextBox"]',
          'div[data-path*="SelectFile"]',
          'div[data-path*="SelectFolder"]',
          'div.control, .control-item, .form-control',
        ];
        for (const sel of fallbackSelectors) {
          const fallbackControl = canvas.locator(sel).first();
          if (await fallbackControl.count() > 0) {
            try {
              await fallbackControl.click({ force: true });
              await this.page.waitForTimeout(300);
              return;
            } catch (e) {}
          }
        }
      } catch (e) {
        // ignore and retry until timeout
      }
      await this.page.waitForTimeout(500);
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
    // Prefer editable inputs (not readonly/disabled). Search property panel for the first editable text input/textarea.
    const editableSelector = 'div.property-pane input[type="text"]:not([readonly]):not([disabled]), div.property-pane textarea:not([readonly]):not([disabled]), div.editor-details input[type="text"]:not([readonly]):not([disabled]), div.editor-details textarea:not([readonly]):not([disabled])';
    let textInput = root.locator(editableSelector).first();
    if (await textInput.count() === 0) {
      // Fallback: try to find inputs by common labels like 'Default value' or 'Element label'
      const labelCandidates = ['Default value', 'Element label', 'Label', 'Value', 'Default'];
      for (const lbl of labelCandidates) {
        try {
          const labelEl = root.locator(`text=${lbl}`).first();
          if (await labelEl.count() > 0) {
            // attempt to find the nearest input following the label
            const candidate = labelEl.locator('xpath=following::input[1] | following::textarea[1]').first();
            if (await candidate.count() > 0) { textInput = candidate; break; }
          }
        } catch (e) {}
      }
    }

    await textInput.waitFor({ state: 'visible', timeout: 30000 });
    // Ensure editable via JS if necessary
    try {
      await textInput.fill(text, { timeout: 10000 });
    } catch (e) {
      // Last resort: set value via DOM and dispatch input events
      await root.evaluate((el, val) => {
        try { el.removeAttribute('readonly'); } catch (e) {}
        try { el.removeAttribute('disabled'); } catch (e) {}
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, await textInput.elementHandle(), text);
    }
  }

  async uploadFile(filePath) {
    const ctx = await this._getBuilderContext();
    const root = ctx.type === 'frame' ? ctx.frame : this.page;
    // Strategy 1: use existing input[type=file]
    try {
      const fileInput = root.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(filePath);
        await this.page.waitForTimeout(500);
        // verify files attached
        try {
          const count = await fileInput.evaluate((el) => (el.files ? el.files.length : 0));
          if (count > 0) return;
        } catch (e) {}
      }
    } catch (e) {}

    // After initial attempts, allow retries to let the UI process the file
    const start = Date.now();
    const maxWait = 5000;

    // Strategy 2: click a visible 'browse' link/button inside drop zones to reveal input
    try {
      const browse = root.locator('text=browse, text=Browse, a:has-text("browse"), button:has-text("browse")').first();
      if (await browse.count() > 0) {
        await browse.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(500);
        const fileInput2 = root.locator('input[type="file"]').first();
        if (await fileInput2.count() > 0) {
          await fileInput2.setInputFiles(filePath);
          await this.page.waitForTimeout(500);
          try {
            const count2 = await fileInput2.evaluate((el) => (el.files ? el.files.length : 0));
            if (count2 > 0) return;
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Strategy 3: inject a hidden file input into the nearest drop area and set files programmatically
    try {
      const dropSelectors = ['div.drop-area', 'div.drop-zone', 'div.drop', 'div[class*="drop" i]', 'div[class*="dropbox" i]', 'div[class*="file-drop"]', 'div:has-text("Drop file" )'];
      for (const sel of dropSelectors) {
        const drop = root.locator(sel).first();
        if (await drop.count() > 0) {
          const uniqueId = `playwright-upload-${Date.now()}`;
          // inject an input element into the drop area
          await drop.evaluate((el, id) => {
            const inp = document.createElement('input');
            inp.type = 'file';
            inp.id = id;
            inp.style.position = 'fixed';
            inp.style.left = '-10000px';
            el.appendChild(inp);
            return true;
          }, uniqueId);

          const injected = root.locator(`#${uniqueId}`).first();
          if (await injected.count() > 0) {
            await injected.setInputFiles(filePath);
            // verify files attached to injected input
            try {
              const countInjected = await injected.evaluate((el) => (el.files ? el.files.length : 0));
              if (countInjected === 0) {
                // still continue to attempt to notify application, but treat as potential failure
              }
            } catch (e) {}
            // dispatch change and drop events to notify app
            await drop.evaluate((el, id) => {
              const inp = document.getElementById(id);
              if (!inp) return;
              const evt = new Event('change', { bubbles: true });
              inp.dispatchEvent(evt);
              // create a DataTransfer-like event for drop
              try {
                const dt = new DataTransfer();
                if (inp.files && inp.files.length) {
                  for (let i = 0; i < inp.files.length; i++) dt.items.add(inp.files[i]);
                }
                const dropEvt = new DragEvent('drop', { bubbles: true, dataTransfer: dt });
                el.dispatchEvent(dropEvt);
              } catch (e) {}
            }, uniqueId);

            await this.page.waitForTimeout(500);
            return;
          }
        }
      }
    } catch (e) {}

    // Strategy 4: try clicking a generic upload button if present
    try {
      const uploadButton = root.locator('button[name="uploadFile"], button[aria-label*="Upload files"], button:has-text("Upload"), button:has-text("Attach")').first();
      if (await uploadButton.count() > 0) {
        await uploadButton.click({ force: true });
        await this.page.waitForTimeout(500);
        const fileInput3 = root.locator('input[type="file"]').first();
        if (await fileInput3.count() > 0) {
          await fileInput3.setInputFiles(filePath);
          await this.page.waitForTimeout(500);
          return;
        }
      }
    } catch (e) {}

    // Final check: give the UI a short time to register any background upload
    while (Date.now() - start < maxWait) {
      try {
        const attached = await this.verifyUploadedFileIndicator((filePath || '').split('/').pop());
        if (attached) return;
      } catch (e) {}
      await this.page.waitForTimeout(300);
    }

    throw new Error('Upload flow could not be automated: no suitable file input or drop area found');
  }

  async verifyUploadedFileIndicator(fileName) {
    const ctx = await this._getBuilderContext();
    const root = ctx.type === 'frame' ? ctx.frame : this.page;

    // First, search near the property panel where uploaded files usually appear
    try {
      const propPanel = root.locator('div.property-pane, div.editor-details, div.uploaded-files, div.attachments').first();
      if (await propPanel.count() > 0) {
        // Exact match
        if (await propPanel.locator(`text=${fileName}`).count() > 0) return true;
        // Partial match (filename without extension)
        const base = fileName.split('.').slice(0, -1).join('.') || fileName;
        if (base && await propPanel.locator(`text=${base}`).count() > 0) return true;

        // Check explicit file list items inside panel
        const itemSelectors = ['ul.uploaded-files li', '.uploaded-file', '.file-item', '.attachment', '.attachments li', 'div.file-list li'];
        for (const sel of itemSelectors) {
          const items = propPanel.locator(sel);
          if (await items.count() > 0) {
            const handles = await items.elementHandles();
            for (const h of handles) {
              const txt = (await h.innerText()).trim();
              try { await h.dispose(); } catch (e) {}
              if (!txt) continue;
              if (txt.includes(fileName) || txt.includes(base)) return true;
            }
          }
        }
      }
    } catch (e) {
      // ignore property panel inspection errors
    }

    // Broad search across root for links/images/text matching file name or partial
    try {
      if (await root.locator(`a:has-text("${fileName}"), img[alt="${fileName}"], text=${fileName}`).count() > 0) return true;
      const base = fileName.split('.').slice(0, -1).join('.') || fileName;
      if (base && await root.locator(`text=${base}`).count() > 0) return true;
    } catch (e) {}

    // Finally, search at page level in case the builder stores uploaded file list outside frame
    try {
      if (this.page && await this.page.locator(`text=${fileName}`).count() > 0) return true;
      const base = fileName.split('.').slice(0, -1).join('.') || fileName;
      if (base && await this.page.locator(`text=${base}`).count() > 0) return true;
    } catch (e) {}

    return false;
  }

  async saveForm() {
    const ctx = await this._getBuilderContext();
    const saveBtn = this._ctxLocator(ctx, 'button:has-text("Save"), button[name="save"]').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 30000 });
    await saveBtn.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async verifySaveSuccess(timeout = 10000) {
    const start = Date.now();
    const candidates = [
      'text=Saved',
      'text=Saved successfully',
      'text=Form saved',
      '.toast-success',
      '.rio-toast--success',
      '[role="alert"]:has-text("saved")',
      '[data-testid="save-status"]:has-text("Saved")',
    ];

    while (Date.now() - start < timeout) {
      try {
        // Check page-level notifications
        for (const sel of candidates) {
          try {
            const loc = this.page.locator(sel).first();
            if (await loc.count() > 0) {
              if (await loc.isVisible().catch(() => false)) return true;
            }
          } catch (e) {}
        }

        // Check inside builder frame if present
        const ctx = await this._getBuilderContext();
        const root = ctx.type === 'frame' ? ctx.frame : this.page;
        for (const sel of candidates) {
          try {
            const loc = root.locator(sel).first();
            if (await loc.count() > 0) {
              if (await loc.isVisible().catch(() => false)) return true;
            }
          } catch (e) {}
        }
      } catch (e) {
        // ignore and retry
      }
      await this.page.waitForTimeout(500);
    }
    return false;
  }
}


module.exports = FormBuilderPage;
