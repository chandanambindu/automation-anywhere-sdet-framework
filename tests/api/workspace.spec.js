const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const WorkspaceApi = require('../../api/workspaceApi');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API workspace tests: credentials not provided');
} else {
  test.describe('API Workspace', () => {
    test('should authenticate and list workspaces', async () => {
      const authApi = new AuthApi();
      const workspaceApi = new WorkspaceApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.ok).toBeTruthy();
      const authBody = await authResponse.json();
      const token = authBody.accessToken || authBody.token || authBody.idToken;

      expect(token).toBeTruthy();

      const workspaceResponse = await workspaceApi.listWorkspaces(token);
      expect(workspaceResponse.ok).toBeTruthy();
      const workspaceBody = await workspaceResponse.json();
      expect(workspaceBody).toBeTruthy();
    });
  });
}
