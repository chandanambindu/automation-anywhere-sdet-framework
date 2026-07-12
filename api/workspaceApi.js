const BaseApiClient = require('./baseApiClient');
const env = require('../config/env');

class WorkspaceApi extends BaseApiClient {
  constructor() {
    super(process.env.API_BASE_URL || env.apiBaseURL || env.baseURL, {
      Accept: 'application/json',
    });
  }

  authHeaders(token) {
    return token ? { 'X-Authorization': token, Authorization: `Bearer ${token}` } : {};
  }

  async listWorkspaces(token) {
    return this.get('/workspaces', {
      headers: this.authHeaders(token),
    });
  }

  async getWorkspaceDefaults(token) {
    return this.get('/v2/repository/workspace/defaults', {
      headers: this.authHeaders(token),
    });
  }

  async getRepositoryFolder(folderId, token) {
    return this.get(`/v2/repository/folders/${folderId}`, {
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
