const BaseApiClient = require('./baseApiClient');
const env = require('../config/env');

class AuthApi extends BaseApiClient {
  constructor() {
    super(process.env.API_BASE_URL || env.apiBaseURL || env.baseURL, {
      Accept: 'application/json',
    });
  }

  async login(username, password) {
    return this.post('/v2/authentication', {
      body: { username, password, captcha: {} },
    });
  }

  async refresh(refreshToken) {
    return this.post('/auth/refresh', {
      body: { refreshToken },
    });
  }

  async getCurrentUser(token) {
    return this.get('/auth/me', {
      headers: this.authHeaders(token),
    });
  }

  authHeaders(token) {
    return token ? { 'X-Authorization': token } : {};
  }
}

module.exports = AuthApi;
