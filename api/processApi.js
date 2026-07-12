const BaseApiClient = require('./baseApiClient');
const env = require('../config/env');

class ProcessApi extends BaseApiClient {
  constructor() {
    super(process.env.API_BASE_URL || env.apiBaseURL || env.baseURL, {
      Accept: 'application/json',
    });
  }

  authHeaders(token) {
    return token ? { 'X-Authorization': token } : {};
  }

  async listProcesses(token, query) {
    return this.get('/processes', {
      headers: this.authHeaders(token),
      query,
    });
  }

  async getProcess(processId, token) {
    return this.get(`/processes/${processId}`, {
      headers: this.authHeaders(token),
    });
  }

  async createProcess(processPayload, token) {
    return this.post('/v2/repository/files', {
      headers: this.authHeaders(token),
      body: processPayload,
    });
  }

  async saveProcessContent(processId, processBody, token) {
    return this.put(`/v2/repository/files/${processId}/content`, {
      headers: {
        ...this.authHeaders(token),
        'Content-Type': 'application/vnd.aa.workflow',
      },
      query: { hasErrors: false },
      body: processBody,
    });
  }

  async saveDependencies(fileId, childFileIds, token) {
    return this.put(`/v2/repository/files/${fileId}/dependencies`, {
      headers: this.authHeaders(token),
      body: { childFileIds },
    });
  }

  async updateProcess(processId, processPayload, token) {
    return this.put(`/processes/${processId}`, {
      headers: this.authHeaders(token),
      body: processPayload,
    });
  }

  async deleteProcess(processId, token) {
    return this.delete(`/processes/${processId}`, {
      headers: this.authHeaders(token),
    });
  }
}

module.exports = ProcessApi;
