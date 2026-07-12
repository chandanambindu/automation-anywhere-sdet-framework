import BaseApiClient from './BaseApiClient';
import type { APIRequestContext } from '@playwright/test';
import type * as models from './models';

export class ProcessApiClient extends BaseApiClient {
  constructor(requestContext: APIRequestContext, baseURL: string) {
    super(requestContext, baseURL);
  }

  async createProcess(payload: models.CreateFilePayload) {
    return this.post('/v2/repository/files', { data: payload, headers: { 'Content-Type': 'application/json' } });
  }

  async saveProcessContent(processId: string, body: models.SaveWorkflowContentPayload) {
    return this.put(`/v2/repository/files/${processId}/content`, {
      data: body,
      headers: { 'Content-Type': 'application/vnd.aa.workflow' },
      params: { hasErrors: false },
    } as any);
  }

  async saveDependencies(processId: string, childFileIds: string[]) {
    return this.put(`/v2/repository/files/${processId}/dependencies`, { data: { childFileIds } });
  }
}

export default ProcessApiClient;
