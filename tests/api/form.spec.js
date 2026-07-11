const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const FormApi = require('../../api/formApi');
const { expectOkAndJson } = require('../../utils/apiHelpers');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API form tests: credentials not provided');
} else {
  test.describe('API Form', () => {
    test('should authenticate and list forms', async () => {
      const authApi = new AuthApi();
      const formApi = new FormApi();

      const authResponse = await authApi.login(USERNAME, PASSWORD);
      expect(authResponse.ok).toBeTruthy();
      const authBody = await authResponse.json();
      const token = authBody.accessToken || authBody.token || authBody.idToken;

      expect(token).toBeTruthy();

      const formResponse = await formApi.listForms(token);
      const formBody = await expectOkAndJson(formResponse);
      expect(formBody).toBeTruthy();
    });
  });
}
