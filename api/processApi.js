const BaseApiClient = require('./baseApiClient');
const env = require('../config/env');

class ProcessApi extends BaseApiClient {
  constructor() {
    super(process.env.API_BASE_URL || env.baseURL, {
      Accept: 'application/json',
    });
  }

  authHeaders(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
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
    return this.post('/processes', {
      headers: this.authHeaders(token),
      body: processPayload,
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
