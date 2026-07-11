const BaseApiClient = require('./baseApiClient');
const env = require('../config/env');

class FormApi extends BaseApiClient {
  constructor() {
    super(process.env.API_BASE_URL || env.baseURL, {
      Accept: 'application/json',
    });
  }

  authHeaders(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
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

  async createForm(formPayload, token) {
    return this.post('/forms', {
      headers: this.authHeaders(token),
      body: formPayload,
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
