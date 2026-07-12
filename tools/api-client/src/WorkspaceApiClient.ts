import BaseApiClient from './BaseApiClient';
import type { APIRequestContext } from '@playwright/test';

export class WorkspaceApiClient extends BaseApiClient {
  constructor(requestContext: APIRequestContext, baseURL: string) {
    super(requestContext, baseURL);
  }

  async getRepositoryFolder(folderId: string) {
    return this.get(`/v2/repository/folders/${folderId}`);
  }

  async listWorkspaces() {
    return this.get('/workspaces');
  }
}

export default WorkspaceApiClient;
