const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const WorkspaceApi = require('../../api/workspaceApi');
const FormApi = require('../../api/formApi');
const ProcessApi = require('../../api/processApi');
const { expectOkAndJson } = require('../../utils/apiHelpers');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;
const BOTS_FOLDER_ID = process.env.BOTS_FOLDER_ID || env.botsFolderId || '32996145';

function extractToken(authBody) {
  return authBody.token || authBody.accessToken || authBody.idToken || authBody.authToken;
}

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API process-with-form test: credentials not provided');
} else {
  test.describe('Use Case 2 - Create Process with a Form via API', () => {
    test('should authenticate, get bots folder, create workflow and form, save content, and save dependencies', async () => {
      const authApi = new AuthApi();
      const workspaceApi = new WorkspaceApi();
      const formApi = new FormApi();
      const processApi = new ProcessApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.status).toBe(200);
      const authBody = await expectOkAndJson(authResponse);
      const token = extractToken(authBody);
      expect(token).toBeTruthy();

      const folderResponse = await workspaceApi.getRepositoryFolder(BOTS_FOLDER_ID, token);
      expect(folderResponse.status).toBe(200);
      const folderBody = await expectOkAndJson(folderResponse);
      expect(folderBody.id).toBe(String(BOTS_FOLDER_ID));
      expect(folderBody.name).toMatch(/Bots/i);

      const processName = `AutoProcess-${Date.now()}`;
      const createProcessResponse = await processApi.createProcess({
        contentType: 'application/vnd.aa.workflow',
        name: processName,
        description: '',
        parentFolderId: folderBody.id,
      }, token);
      expect(createProcessResponse.status).toBe(201);
      const processCreateBody = await expectOkAndJson(createProcessResponse);
      expect(processCreateBody.id).toBeTruthy();
      const processFileId = processCreateBody.id;

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

      const formContentResponse = await formApi.saveFormContent(formFileId, {
        form: {
          properties: {
            title: formName,
          },
          fields: [
            {
              id: 'TextBox',
              label: 'TextBox',
              type: 'TextBox',
              required: false,
            },
            {
              id: 'TextArea',
              label: 'TextArea',
              type: 'TextArea',
              required: false,
            },
            {
              id: 'Number',
              label: 'Number',
              type: 'Number',
              required: false,
            },
          ],
        },
      }, token);
      expect(formContentResponse.status).toBe(200);
      const formContentBody = await expectOkAndJson(formContentResponse);
      expect(formContentBody).toBeTruthy();

      const processContentResponse = await processApi.saveProcessContent(processFileId, {
        nodes: [
          { id: 'InitialStep', type: 'initial', next: 'FormStep' },
          {
            id: 'FormStep',
            type: 'form',
            name: 'FormStep',
            next: 'Exit',
            formFileId,
          },
          { id: 'Exit', type: 'exit' },
        ],
        orphans: [],
        variables: [],
        swimlanes: [],
        isProcessV2: true,
        swimlaneStacking: 'LEFT_TO_RIGHT',
      }, token);
      expect(processContentResponse.status).toBe(200);
      const processContentBody = await expectOkAndJson(processContentResponse);
      expect(processContentBody).toBeTruthy();

      const formDependenciesResponse = await formApi.saveDependencies(formFileId, [], token);
      expect(formDependenciesResponse.status).toBe(200);

      const processDependenciesResponse = await processApi.saveDependencies(processFileId, [formFileId], token);
      expect(processDependenciesResponse.status).toBe(200);
      const processDependenciesBody = await expectOkAndJson(processDependenciesResponse);
      expect(processDependenciesBody).toBeTruthy();
    });
  });
}
