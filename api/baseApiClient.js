const env = require('../config/env');

class BaseApiClient {
  constructor(baseURL, defaultHeaders = {}) {
    this.baseURL = baseURL || env.apiBaseURL || env.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...defaultHeaders,
    };
  }

  buildUrl(path, query) {
    const url = new URL(path, this.baseURL);
    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async request(method, path, { headers = {}, query, body } = {}) {
    const requestUrl = this.buildUrl(path, query);
    const mergedHeaders = { ...this.defaultHeaders, ...headers };
    const init = {
      method,
      headers: mergedHeaders,
    };

    if (body !== undefined) {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(requestUrl, init);
    return response;
  }

  get(path, options = {}) {
    return this.request('GET', path, options);
  }

  post(path, options = {}) {
    return this.request('POST', path, options);
  }

  put(path, options = {}) {
    return this.request('PUT', path, options);
  }

  delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }
}

module.exports = BaseApiClient;
