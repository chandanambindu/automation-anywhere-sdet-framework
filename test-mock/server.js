const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.MOCK_PORT || 3001;
app.use(bodyParser.json());

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing credentials' });
  return res.json({ accessToken: 'mock-access-token', tokenType: 'bearer', user: { username } });
});

app.get('/workspaces', (req, res) => {
  res.json([{ id: 'ws1', name: 'Default Workspace' }]);
});

app.get('/forms', (req, res) => {
  res.json([{ id: 'form1', name: 'Mock Form' }]);
});

app.get('/processes', (req, res) => {
  res.json([{ id: 'proc1', name: 'Mock Process' }]);
});

// Forms - create, save content, save dependencies
app.post('/forms', (req, res) => {
  const payload = req.body || {};
  const id = `form-${Date.now()}`;
  res.status(201).json({ id, ...payload });
});

app.post('/forms/:id/content', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ id, saved: true });
});

app.post('/forms/:id/dependencies', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ id, dependenciesSaved: true });
});

// Processes - create, save content, save dependencies
app.post('/processes', (req, res) => {
  const payload = req.body || {};
  const id = `process-${Date.now()}`;
  res.status(201).json({ id, ...payload });
});

app.post('/processes/:id/content', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ id, saved: true });
});

app.post('/processes/:id/dependencies', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ id, dependenciesSaved: true });
});

app.listen(port, () => console.log(`Mock API listening on http://localhost:${port}`));
