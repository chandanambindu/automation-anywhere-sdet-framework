const BaseApiClient = require('./baseApiClient');
const env = require('../config/env');

class AuthApi extends BaseApiClient {
  constructor() {
    super(process.env.API_BASE_URL || env.baseURL, {
      Accept: 'application/json',
    });
  }

  async login(username, password) {
    return this.post('/auth/login', {
      body: { username, password },
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
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

module.exports = AuthApi;
