const express = require('express');
const router = express.Router();
const { commitFile, triggerWorkflow } = require('../utils/github');

router.post('/publish', async (req, res) => {
  const { page, title, description } = req.body || {};

  // 1. Validate
  if (!page || !title || !description) {
    return res.status(400).json({
      step: 'validation',
      success: false,
      error: 'Missing required fields: page, title, description'
    });
  }

  const contentPath = `${process.env.GITHUB_CONTENT_PATH || 'content'}/${page.toLowerCase().replace(/\s+/g, '-')}.json`;
  const fileBody = JSON.stringify({ page, title, description, updatedAt: new Date().toISOString() }, null, 2);

  try {
    // 2. Commit changes to GitHub
    const commitResult = await commitFile({
      path: contentPath,
      content: fileBody,
      message: `Publish: ${page} via CMS`
    });

    // 3. Trigger GitHub Actions workflow
    const dispatchResult = await triggerWorkflow({});

    // 4. Success - GitHub Actions will build & deploy asynchronously
    return res.json({
      success: true,
      steps: {
        validate: 'ok',
        commit: commitResult,
        workflow_dispatch: dispatchResult
      },
      note: 'Commit pushed and workflow dispatched. Check the Actions tab on GitHub for build/deploy progress.'
    });
  } catch (err) {
    console.error('[publish] error:', err.message);

    let hint = 'Unexpected error.';
    if (err.code === 'NO_TOKEN') {
      hint = 'GITHUB_TOKEN missing/placeholder in server/.env.';
    } else if (err.status === 401) {
      hint = 'GitHub rejected the token (401 Bad credentials). Token is invalid, expired, or revoked. Generate a new one.';
    } else if (err.status === 403) {
      hint = 'GitHub returned 403. Token lacks required scopes (needs "repo" + "workflow" for classic tokens), or you hit a rate limit.';
    } else if (err.status === 404) {
      hint = 'GitHub returned 404. Check GITHUB_OWNER/GITHUB_REPO spelling, and that the workflow file name matches an existing file in .github/workflows on GITHUB_BRANCH.';
    } else if (err.status === 422) {
      hint = 'GitHub returned 422 — often means the workflow file does not have a workflow_dispatch trigger, or the branch/ref is wrong.';
    }

    return res.status(500).json({
      success: false,
      error: err.message,
      hint
    });
  }
});

module.exports = router;
