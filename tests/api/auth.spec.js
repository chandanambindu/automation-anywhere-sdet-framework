const { test, expect } = require('../../fixtures/base');
const AuthApi = require('../../api/authApi');
const env = require('../../config/env');

const USERNAME = process.env.USERNAME || env.username;
const PASSWORD = process.env.PASSWORD || env.password;

if (!USERNAME || !PASSWORD) {
  console.warn('Skipping API auth tests: credentials not provided');
} else {
  test.describe('API Authentication', () => {
    test('should authenticate and return a response payload', async () => {
      const authApi = new AuthApi();
      const response = await authApi.login(USERNAME, PASSWORD);

      expect(response.ok).toBeTruthy();
      const body = await response.json();
      expect(body).toBeTruthy();
      expect(Object.keys(body).length).toBeGreaterThan(0);
    });
  });
}
