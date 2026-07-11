const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const ProcessApi = require('../../api/processApi');
const { expectOkAndJson } = require('../../utils/apiHelpers');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API process tests: credentials not provided');
} else {
  test.describe('API Process', () => {
    test('should authenticate and list processes', async () => {
      const authApi = new AuthApi();
      const processApi = new ProcessApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.ok).toBeTruthy();
      const authBody = await authResponse.json();
      const token = authBody.accessToken || authBody.token || authBody.idToken;

      expect(token).toBeTruthy();

      const processResponse = await processApi.listProcesses(token);
      const processBody = await expectOkAndJson(processResponse);
      expect(processBody).toBeTruthy();
    });
  });
}
