const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const WorkspaceApi = require('../../api/workspaceApi');
const FormApi = require('../../api/formApi');
const ProcessApi = require('../../api/processApi');
const { expectOkAndJson } = require('../../utils/apiHelpers');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;

function extractToken(authBody) {
  return authBody.accessToken || authBody.token || authBody.idToken || authBody.authToken;
}

function pickWorkspaceId(workspaces) {
  if (!Array.isArray(workspaces) || workspaces.length === 0) {
    return null;
  }

  const preferred = workspaces.find((workspace) => {
    const label = `${workspace.name || workspace.label || workspace.type || ''}`.toLowerCase();
    return label.includes('private');
  });

  const workspace = preferred || workspaces[0];
  return workspace.id || workspace.folderId || workspace.workspaceId || workspace._id || null;
}

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping Use Case 2 API test: credentials not provided');
} else {
  test.describe('Use Case 2 - Create Process with a Form via API', () => {
    test('should create a form, save dependencies, create a process, and link the form', async () => {
      const authApi = new AuthApi();
      const workspaceApi = new WorkspaceApi();
      const formApi = new FormApi();
      const processApi = new ProcessApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.status).toBe(200);
      const authBody = await expectOkAndJson(authResponse);
      const token = extractToken(authBody);
      expect(token).toBeTruthy();

      const workspaceResponse = await workspaceApi.listWorkspaces(token);
      expect(workspaceResponse.status).toBe(200);
      const workspaces = await expectOkAndJson(workspaceResponse);
      const workspaceFolderId = pickWorkspaceId(workspaces);
      expect(workspaceFolderId).toBeTruthy();

      const formCreateResponse = await formApi.createForm({
        name: `AutoForm-${Date.now()}`,
        workspaceId: workspaceFolderId,
        contentType: 'application/vnd.aa.form',
      }, token);
      expect(formCreateResponse.status).toBe(201);
      const formCreateBody = await expectOkAndJson(formCreateResponse);
      expect(formCreateBody.id).toBeTruthy();
      const formFileId = formCreateBody.id;

      const formContentResponse = await formApi.post(`/forms/${formFileId}/content`, {
        headers: formApi.authHeaders(token),
        body: {
          fields: [
            { type: 'TextBox', label: 'TextBox' },
            { type: 'TextArea', label: 'TextArea' },
            { type: 'Number', label: 'Number' },
          ],
        },
      });
      expect(formContentResponse.status).toBe(200);
      const formContentBody = await expectOkAndJson(formContentResponse);
      expect(formContentBody.saved).toBeTruthy();

      const formDepsResponse = await formApi.post(`/forms/${formFileId}/dependencies`, {
        headers: formApi.authHeaders(token),
        body: {
          dependencies: [
            { fileId: formFileId, contentType: 'application/vnd.aa.form' },
          ],
        },
      });
      expect(formDepsResponse.status).toBe(200);
      const formDepsBody = await expectOkAndJson(formDepsResponse);
      expect(formDepsBody.dependenciesSaved).toBeTruthy();

      const processCreateResponse = await processApi.createProcess({
        name: `AutoProcess-${Date.now()}`,
        workspaceId: workspaceFolderId,
        contentType: 'application/vnd.aa.workflow',
      }, token);
      expect(processCreateResponse.status).toBe(201);
      const processCreateBody = await expectOkAndJson(processCreateResponse);
      expect(processCreateBody.id).toBeTruthy();
      const processFileId = processCreateBody.id;

      const processContentResponse = await processApi.post(`/processes/${processFileId}/content`, {
        headers: processApi.authHeaders(token),
        body: {
          nodes: [
            { id: 'InitialStep', type: 'initial', next: 'FormStep' },
            { id: 'FormStep', type: 'form', formFileId },
            { id: 'Exit', type: 'exit' },
          ],
          formId: formFileId,
        },
      });
      expect(processContentResponse.status).toBe(200);
      const processContentBody = await expectOkAndJson(processContentResponse);
      expect(processContentBody.saved).toBeTruthy();

      const processDepsResponse = await processApi.post(`/processes/${processFileId}/dependencies`, {
        headers: processApi.authHeaders(token),
        body: {
          dependencies: [
            { fileId: formFileId, contentType: 'application/vnd.aa.form' },
          ],
        },
      });
      expect(processDepsResponse.status).toBe(200);
      const processDepsBody = await expectOkAndJson(processDepsResponse);
      expect(processDepsBody.dependenciesSaved).toBeTruthy();
    });
  });
}