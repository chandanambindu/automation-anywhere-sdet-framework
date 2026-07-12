const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const WorkspaceApi = require('../../api/workspaceApi');
const FormApi = require('../../api/formApi');
const { expectOkAndJson } = require('../../utils/apiHelpers');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;
const BOTS_FOLDER_ID = process.env.BOTS_FOLDER_ID || env.botsFolderId || '32996145';

function extractToken(authBody) {
  return authBody.token || authBody.accessToken || authBody.idToken || authBody.authToken;
}

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API save-form-content test: credentials not provided');
} else {
  test.describe('API - Save Form Content (vnd.aa.form)', () => {
    test('auth, create form, save captured form content, save dependencies', async () => {
      const authApi = new AuthApi();
      const workspaceApi = new WorkspaceApi();
      const formApi = new FormApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.status).toBe(200);
      const authBody = await expectOkAndJson(authResponse);
      const token = extractToken(authBody);
      expect(token).toBeTruthy();

      const folderResponse = await workspaceApi.getRepositoryFolder(BOTS_FOLDER_ID, token);
      expect(folderResponse.status).toBe(200);
      const folderBody = await expectOkAndJson(folderResponse);
      expect(folderBody.id).toBe(String(BOTS_FOLDER_ID));

      const formName = `AutoForm-${Date.now()}`;
      const createFormResponse = await formApi.createForm({
        contentType: 'application/vnd.aa.form',
        name: formName,
        description: '',
        parentFolderId: folderBody.id,
      }, token);
      expect(createFormResponse.status).toBe(201);
      const formCreateBody = await expectOkAndJson(createFormResponse);
      expect(formCreateBody.id).toBeTruthy();
      const formFileId = formCreateBody.id;

      // Captured form payload from the browser
      const capturedPayload = {
        form: {
          properties: {
            title: 'Form title',
            dimension: { height: 600, width: 600, displayHeight: 600 },
            font: { fontType: 'System', fontSize: 'MEDIUM' },
            closeOnEndMachine: false,
            minimizeOnEndMachine: false,
            hiddenElements: [],
            brandLogos: [],
            logoCount: 'Zero',
          },
          position: {
            isFormPreviewCentered: false,
            startX: 650,
            startY: 10,
            formPlacement: 'TOP_LEFT',
          },
          meta: { version: '2.1' },
          rules: [],
          documentElement: {},
          rows: [
            {
              columns: [
                {
                  type: 'File',
                  fieldType: 'File',
                  id: 'File0',
                  label: 'Select a file',
                  toolTip: '',
                  hintText: '',
                  mandatory: false,
                  readOnly: false,
                  supportedFileExtensions: [],
                  width: 100,
                  fileDownloadSupported: false,
                  unsupportedFileExtensions: [],
                  hidden: false,
                },
              ],
            },
            {
              columns: [
                {
                  type: 'TextBox',
                  fieldType: 'TextBox',
                  id: 'TextBox0',
                  label: 'TextBox',
                  defaultValue: 'hell',
                  toolTip: '',
                  hintText: '',
                  mandatory: false,
                  hidden: false,
                  readOnly: false,
                  width: 100,
                  minLength: -1,
                  maxLength: -1,
                  masked: false,
                  regex: '',
                  regexErrorMessage: '',
                  validationType: 'standard',
                  hasFeatureCustomStyles: false,
                  value: '',
                },
              ],
            },
          ],
          styles: {},
        },
      };

      const formContentResponse = await formApi.saveFormContent(formFileId, capturedPayload, token);
      expect(formContentResponse.status).toBe(200);
      const formContentBody = await expectOkAndJson(formContentResponse);
      expect(formContentBody).toBeTruthy();

      const depsResponse = await formApi.saveDependencies(formFileId, [], token);
      expect(depsResponse.status).toBe(200);
      const depsBody = await expectOkAndJson(depsResponse);
      expect(depsBody).toBeTruthy();
    });
  });
}
