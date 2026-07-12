import { APIRequestContext, APIRequestOptions, APIResponse } from '@playwright/test';
import type * as models from './models';

export class BaseApiClient {
  readonly request: APIRequestContext;
  baseURL: string;
  token?: string;

  constructor(requestContext: APIRequestContext, baseURL: string) {
    this.request = requestContext;
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  protected defaultHeaders() {
    const h: Record<string, string> = { Accept: 'application/json' };
    if (this.token) {
      h['x-authorization'] = this.token;
      h['Authorization'] = `Bearer ${this.token}`;
    }
    return h;
  }

  async requestRaw(method: string, path: string, options: APIRequestOptions = {}): Promise<APIResponse> {
    const url = new URL(path, this.baseURL).toString();
    const headers = { ...(options.headers || {}), ...this.defaultHeaders() };
    return this.request.fetch(url, { method, headers, ...options });
  }

  async get(path: string, options: APIRequestOptions = {}) {
    return this.requestRaw('GET', path, options);
  }

  async post(path: string, options: APIRequestOptions = {}) {
    return this.requestRaw('POST', path, options);
  }

  async put(path: string, options: APIRequestOptions = {}) {
    return this.requestRaw('PUT', path, options);
  }

  async delete(path: string, options: APIRequestOptions = {}) {
    return this.requestRaw('DELETE', path, options);
  }
}

export default BaseApiClient;
