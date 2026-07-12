/**
 * Example usage with Playwright test's `page.request` or `context.request`.
 * Replace payload placeholders with the actual form content payload captured
 * from the browser before using `saveFormContent`.
 */
import { test } from '@playwright/test';
import { AuthApiClient } from './AuthApiClient';
import { WorkspaceApiClient } from './WorkspaceApiClient';
import { FormApiClient } from './FormApiClient';
import { ProcessApiClient } from './ProcessApiClient';

test('api flow example', async ({ request }) => {
  const baseURL = process.env.API_BASE_URL || 'https://community.cloud.automationanywhere.digital';
  const auth = new AuthApiClient(request, baseURL);
  const workspace = new WorkspaceApiClient(request, baseURL);
  const form = new FormApiClient(request, baseURL);
  const process = new ProcessApiClient(request, baseURL);

  // 1. authenticate
  const username = process.env.USERNAME!;
  const password = process.env.PASSWORD!;
  const { body: authBody } = await auth.authenticate(username, password);
  const token = (authBody && (authBody.token || authBody.accessToken || authBody.idToken)) as string;
  auth.setToken(token);
  workspace.setToken(token);
  form.setToken(token);
  process.setToken(token);

  // 2. get folder
  const folderRes = await workspace.getRepositoryFolder(process.env.BOTS_FOLDER_ID || '32996145');
  console.log('folder status', folderRes.status());

  // 3. create form
  const createFormRes = await form.createForm({ contentType: 'application/vnd.aa.form', name: `AutoForm-${Date.now()}`, parentFolderId: process.env.BOTS_FOLDER_ID });
  console.log('create form status', createFormRes.status());
  const createFormBody = await createFormRes.json();

  // 4. save form content — placeholder: replace `formPayload` with the exact captured body
  const formPayload = { form: { properties: { title: createFormBody.name }, fields: [] } };
  // IMPORTANT: replace `formPayload` with the real payload you capture from DevTools
  const saveContentRes = await form.saveFormContent(createFormBody.id, formPayload as any);
  console.log('save content status', saveContentRes.status());
});
