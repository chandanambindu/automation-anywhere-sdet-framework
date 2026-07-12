import BaseApiClient from './BaseApiClient';
import type { APIRequestContext } from '@playwright/test';
import type * as models from './models';

export class FormApiClient extends BaseApiClient {
  constructor(requestContext: APIRequestContext, baseURL: string) {
    super(requestContext, baseURL);
  }

  async createForm(payload: models.CreateFilePayload) {
    return this.post('/v2/repository/files', { data: payload, headers: { 'Content-Type': 'application/json' } });
  }

  async saveFormContent(formId: string, formBody: models.SaveFormContentPayload) {
    // NOTE: exact content-type must be application/vnd.aa.form and the body
    // must match the shape observed in the browser. Replace `data` with
    // the captured payload when available.
    return this.put(`/v2/repository/files/${formId}/content`, {
      data: formBody,
      headers: { 'Content-Type': 'application/vnd.aa.form' },
      params: { hasErrors: false },
    } as any);
  }

  async saveDependencies(fileId: string, childFileIds: string[]) {
    return this.put(`/v2/repository/files/${fileId}/dependencies`, { data: { childFileIds } });
  }
}

export default FormApiClient;
