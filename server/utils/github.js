const { Octokit } = require('@octokit/rest');

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token || token.includes('xxxxxxx')) {
    const err = new Error('GITHUB_TOKEN is missing or still the placeholder value in .env');
    err.code = 'NO_TOKEN';
    throw err;
  }
  return new Octokit({ auth: token });
}

/**
 * Verifies the token itself is valid by asking GitHub who it belongs to.
 * This is the #1 place "token not working" issues show up.
 */
async function checkAuth() {
  const octokit = getOctokit();
  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return { login: data.login, id: data.id };
  } catch (err) {
    if (!err.message && err.response) {
      err.message = JSON.stringify(err.response.data || {}) || `HTTP ${err.status} with no body`;
    }
    throw err;
  }
}

/**
 * Verifies the token can actually see the target repo (right owner/repo name,
 * right scopes, repo not private-without-access, etc).
 */
async function checkRepoAccess() {
  const octokit = getOctokit();
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!owner || !repo) {
    const err = new Error('GITHUB_OWNER or GITHUB_REPO not set in .env');
    err.code = 'NO_REPO_CONFIG';
    throw err;
  }
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return {
    full_name: data.full_name,
    default_branch: data.default_branch,
    permissions: data.permissions
  };
}

/**
 * Creates or updates a file in the repo (the "commit changes" step).
 */
async function commitFile({ path, content, message }) {
  const octokit = getOctokit();
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  let sha;
  try {
    const existing = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
    if (!Array.isArray(existing.data)) sha = existing.data.sha;
  } catch (e) {
    if (e.status !== 404) throw e; // 404 = file doesn't exist yet, that's fine
  }

  const { data } = await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    branch,
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    sha
  });

  return { commitSha: data.commit.sha, contentPath: path };
}

/**
 * Triggers the GitHub Actions workflow via workflow_dispatch (the "trigger build/deploy" step).
 */
async function triggerWorkflow(inputs = {}) {
  const octokit = getOctokit();
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE || 'deploy.yml';

  await octokit.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: workflowFile,
    ref: branch,
    inputs
  });

  return { triggered: true, workflow: workflowFile, ref: branch };
}

module.exports = { getOctokit, checkAuth, checkRepoAccess, commitFile, triggerWorkflow };
