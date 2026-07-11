const BaseApiClient = require('./baseApiClient');
const env = require('../config/env');

class WorkspaceApi extends BaseApiClient {
  constructor() {
    super(process.env.API_BASE_URL || env.baseURL, {
      Accept: 'application/json',
    });
  }

  authHeaders(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async listWorkspaces(token) {
    return this.get('/workspaces', {
      headers: this.authHeaders(token),
    });
  }

  async getWorkspace(workspaceId, token) {
    return this.get(`/workspaces/${workspaceId}`, {
      headers: this.authHeaders(token),
    });
  }

  async createWorkspace(workspacePayload, token) {
    return this.post('/workspaces', {
      headers: this.authHeaders(token),
      body: workspacePayload,
    });
  }
}

module.exports = WorkspaceApi;
