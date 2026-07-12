const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const WorkspaceApi = require('../../api/workspaceApi');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;
const BOTS_FOLDER_ID = process.env.BOTS_FOLDER_ID || env.botsFolderId || '32996145';

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API workspace tests: credentials not provided');
} else {
  test.describe('API Workspace', () => {
    test('should authenticate and read the Bots repository folder', async () => {
      const authApi = new AuthApi();
      const workspaceApi = new WorkspaceApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.ok).toBeTruthy();
      const authBody = await authResponse.json();
      const token = authBody.accessToken || authBody.token || authBody.idToken;

      expect(token).toBeTruthy();

      const folderResponse = await workspaceApi.getRepositoryFolder(BOTS_FOLDER_ID, token);
      expect(folderResponse.ok).toBeTruthy();
      const folderBody = await folderResponse.json();
      expect(folderBody).toBeTruthy();
      expect(folderBody.id).toBe(String(BOTS_FOLDER_ID));
      expect(folderBody.name).toMatch(/Bots/i);
    });
  });
}
