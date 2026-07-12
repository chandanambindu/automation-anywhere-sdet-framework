const AuthApi = require('./api/authApi');
const env = require('./config/env');
(async () => {
  const username = process.env.USERNAME || env.username;
  const password = process.env.PASSWORD || env.password;
  if (!username || !password) { console.error('No creds'); process.exit(1); }
  const a = new AuthApi();
  const res = await a.login(username, password);
  console.log('status', res.status, res.statusText);
  const text = await res.text();
  console.log('body:', text);
})();