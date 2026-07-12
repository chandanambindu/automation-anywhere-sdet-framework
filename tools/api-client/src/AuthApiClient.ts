import BaseApiClient from './BaseApiClient';
import type { APIRequestContext } from '@playwright/test';
import type * as models from './models';

export class AuthApiClient extends BaseApiClient {
  constructor(requestContext: APIRequestContext, baseURL: string) {
    super(requestContext, baseURL);
  }

  async authenticate(username: string, password: string) {
    const res = await this.post('/v2/authentication', {
      data: { username, password, captcha: {} },
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await res.json();
    const token = (body && (body.token || body.accessToken || body.idToken)) as string | undefined;
    if (token) this.setToken(token);
    return { response: res, body } as { response: any; body: models.AuthResponse };
  }
}

export default AuthApiClient;
