require('dotenv').config();
const express = require('express');
const cors = require('cors');
const publishRoute = require('./routes/publish');
const { checkAuth, checkRepoAccess } = require('./utils/github');

const app = express();
app.use(cors());
app.use(express.json());

// --- Step 1 verification: Client -> Server ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server Application is up and reachable.' });
});

app.use('/', publishRoute);

// --- Step 2 verification: Server -> GitHub (token + repo access) ---
app.get('/github-status', async (req, res) => {
  const result = { tokenValid: false, repoAccessible: false };
  try {
    const auth = await checkAuth();
    result.tokenValid = true;
    result.authenticatedAs = auth.login;
  } catch (err) {
    result.tokenError = err.message + (err.status ? ` (HTTP ${err.status})` : '');
  }

  try {
    const repo = await checkRepoAccess();
    result.repoAccessible = true;
    result.repo = repo;
  } catch (err) {
    result.repoError = err.message + (err.status ? ` (HTTP ${err.status})` : '');
  }

  const allGood = result.tokenValid && result.repoAccessible;
  res.status(allGood ? 200 : 500).json(result);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server Application running on http://localhost:${PORT}`);
  console.log(`  - Health check:      GET  http://localhost:${PORT}/health`);
  console.log(`  - GitHub connection: GET  http://localhost:${PORT}/github-status`);
  console.log(`  - Publish endpoint:  POST http://localhost:${PORT}/publish`);
});
