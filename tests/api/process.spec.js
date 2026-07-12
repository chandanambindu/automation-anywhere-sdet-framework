const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const WorkspaceApi = require('../../api/workspaceApi');
const ProcessApi = require('../../api/processApi');
const { expectOkAndJson } = require('../../utils/apiHelpers');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;
const BOTS_FOLDER_ID = process.env.BOTS_FOLDER_ID || env.botsFolderId || '32996145';

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API process tests: credentials not provided');
} else {
  test.describe('API Process', () => {
    test('should authenticate, create a process, save content, and save dependencies', async () => {
      const authApi = new AuthApi();
      const workspaceApi = new WorkspaceApi();
      const processApi = new ProcessApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.ok).toBeTruthy();
      const authBody = await authResponse.json();
      const token = authBody.accessToken || authBody.token || authBody.idToken;

      expect(token).toBeTruthy();

      const folderResponse = await workspaceApi.getRepositoryFolder(BOTS_FOLDER_ID, token);
      expect(folderResponse.ok).toBeTruthy();
      const folderBody = await expectOkAndJson(folderResponse);
      expect(folderBody.id).toBe(String(BOTS_FOLDER_ID));

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

      const processContentResponse = await processApi.saveProcessContent(processCreateBody.id, {
        nodes: [
          { id: 'InitialStep', type: 'initial', next: 'Exit' },
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

      const dependenciesResponse = await processApi.saveDependencies(processCreateBody.id, [], token);
      expect(dependenciesResponse.status).toBe(200);
      const dependenciesBody = await expectOkAndJson(dependenciesResponse);
      expect(dependenciesBody).toBeTruthy();
    });
  });
}
