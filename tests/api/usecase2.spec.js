const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const WorkspaceApi = require('../../api/workspaceApi');
const FormApi = require('../../api/formApi');
const ProcessApi = require('../../api/processApi');
const { expectOkAndJson } = require('../../utils/apiHelpers');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping Use Case 2 API tests: credentials not provided');
} else {
  test.describe('Use Case 2 - Create Process with Form via API', () => {
    test('full flow: auth -> workspace -> create form -> save content/deps -> create process -> save content/deps', async () => {
      const authApi = new AuthApi();
      const workspaceApi = new WorkspaceApi();
      const formApi = new FormApi();
      const processApi = new ProcessApi();

      // 1. Authenticate
      const authResponse = await authApi.login(USERNAME, PASSWORD);
      const authBody = await expectOkAndJson(authResponse);
      const token = authBody.accessToken || authBody.token || authBody.idToken;
      expect(token).toBeTruthy();

      // 2. List workspaces
      const wsResp = await workspaceApi.listWorkspaces(token);
      const wsBody = await expectOkAndJson(wsResp);
      expect(Array.isArray(wsBody)).toBeTruthy();
      const workspaceId = (wsBody[0] && wsBody[0].id) || 'ws1';

      // 3. Create form file
      const createFormResp = await formApi.createForm({ name: 'AutoForm', workspaceId }, token);
      const createdForm = await expectOkAndJson(createFormResp);
      expect(createdForm.id).toBeTruthy();
      const formId = createdForm.id;

      // 4. Save form content
      const saveContentResp = await formApi.post(`/forms/${formId}/content`, { headers: formApi.authHeaders(token), body: { fields: ["TextBox","TextArea","Number"] } });
      const savedContent = await expectOkAndJson(saveContentResp);
      expect(savedContent.saved).toBeTruthy();

      // 5. Save form dependencies
      const depsResp = await formApi.post(`/forms/${formId}/dependencies`, { headers: formApi.authHeaders(token), body: { deps: [] } });
      const depsBody = await expectOkAndJson(depsResp);
      expect(depsBody.dependenciesSaved).toBeTruthy();

      // 6. Create process
      const createProcResp = await processApi.createProcess({ name: 'AutoProcess', workspaceId }, token);
      const createdProc = await expectOkAndJson(createProcResp);
      expect(createdProc.id).toBeTruthy();
      const procId = createdProc.id;

      // 7. Save process content referencing the form
      const procContentResp = await processApi.post(`/processes/${procId}/content`, { headers: processApi.authHeaders(token), body: { nodes: ["InitialStep","FormStep","Exit"], formId } });
      const procSaved = await expectOkAndJson(procContentResp);
      expect(procSaved.saved).toBeTruthy();

      // 8. Save process dependencies linking the form
      const procDepsResp = await processApi.post(`/processes/${procId}/dependencies`, { headers: processApi.authHeaders(token), body: { deps: [formId] } });
      const procDepsBody = await expectOkAndJson(procDepsResp);
      expect(procDepsBody.dependenciesSaved).toBeTruthy();
    });
  });
}
