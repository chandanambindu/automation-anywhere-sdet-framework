const BaseApiClient = require('./baseApiClient');
const env = require('../config/env');

class FormApi extends BaseApiClient {
  constructor() {
    super(process.env.API_BASE_URL || env.apiBaseURL || env.baseURL, {
      Accept: 'application/json',
    });
  }

  authHeaders(token) {
    return token ? { 'X-Authorization': token } : {};
  }

  async listForms(token, query) {
    return this.get('/forms', {
      headers: this.authHeaders(token),
      query,
    });
  }

  async getForm(formId, token) {
    return this.get(`/forms/${formId}`, {
      headers: this.authHeaders(token),
    });
  }

  async getFormContent(formId, token) {
    return this.get(`/v2/repository/files/${formId}/content`, {
      headers: {
        ...this.authHeaders(token),
        Accept: 'application/vnd.aa.form',
      },
    });
  }

  async createForm(formPayload, token) {
    return this.post('/v2/repository/files', {
      headers: this.authHeaders(token),
      body: formPayload,
    });
  }

  async saveFormContent(formId, formBody, token) {
    return this.put(`/v2/repository/files/${formId}/content`, {
      headers: {
        ...this.authHeaders(token),
        'Content-Type': 'application/vnd.aa.form',
      },
      query: { hasErrors: false },
      body: formBody,
    });
  }

  async saveDependencies(fileId, childFileIds, token) {
    return this.put(`/v2/repository/files/${fileId}/dependencies`, {
      headers: this.authHeaders(token),
      body: { childFileIds },
    });
  }

  async updateForm(formId, formPayload, token) {
    return this.put(`/forms/${formId}`, {
      headers: this.authHeaders(token),
      body: formPayload,
    });
  }

  async deleteForm(formId, token) {
    return this.delete(`/forms/${formId}`, {
      headers: this.authHeaders(token),
    });
  }
}

module.exports = FormApi;
