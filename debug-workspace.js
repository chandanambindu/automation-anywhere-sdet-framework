const AuthApi = require('./api/authApi');
const WorkspaceApi = require('./api/workspaceApi');
const env = require('./config/env');
(async () => {
  const username = process.env.USERNAME || env.username;
  const password = process.env.PASSWORD || env.password;
  if (!username || !password) { console.error('No creds'); process.exit(1); }
  const a = new AuthApi();
  const w = new WorkspaceApi();
  const r = await a.login(username, password);
  const body = await r.json();
  const token = body.token || body.accessToken || body.idToken;
  console.log('token length', token && token.length);
  const res = await w.getRepositoryFolder(process.env.BOTS_FOLDER_ID || env.botsFolderId || '32996145', token);
  console.log('status', res.status);
  console.log(await res.text());
})();