const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const FormApi = require('../../api/formApi');
const WorkspaceApi = require('../../api/workspaceApi');
const { expectOkAndJson } = require('../../utils/apiHelpers');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;
const BOTS_FOLDER_ID = process.env.BOTS_FOLDER_ID || env.botsFolderId || '32996145';

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API form tests: credentials not provided');
} else {
  test.describe('API Form', () => {
    test('should authenticate, create a form, save content, and save dependencies', async () => {
      const authApi = new AuthApi();
      const workspaceApi = new WorkspaceApi();
      const formApi = new FormApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.ok).toBeTruthy();
      const authBody = await authResponse.json();
      const token = authBody.accessToken || authBody.token || authBody.idToken;

      expect(token).toBeTruthy();

      const folderResponse = await workspaceApi.getRepositoryFolder(BOTS_FOLDER_ID, token);
      expect(folderResponse.ok).toBeTruthy();
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

      const formContentResponse = await formApi.saveFormContent(formCreateBody.id, {
        form: {
          properties: { title: formName },
          fields: [
            { id: 'TextBox', label: 'TextBox', type: 'TextBox', required: false },
            { id: 'TextArea', label: 'TextArea', type: 'TextArea', required: false },
            { id: 'Number', label: 'Number', type: 'Number', required: false },
          ],
        },
      }, token);
      expect(formContentResponse.status).toBe(200);
      const formContentBody = await expectOkAndJson(formContentResponse);
      expect(formContentBody).toBeTruthy();

      const dependenciesResponse = await formApi.saveDependencies(formCreateBody.id, [], token);
      expect(dependenciesResponse.status).toBe(200);
      const dependenciesBody = await expectOkAndJson(dependenciesResponse);
      expect(dependenciesBody).toBeTruthy();
    });
  });
}
