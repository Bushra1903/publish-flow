/**
 * Run this from the server/ folder: `npm run verify`
 * (or `node ../scripts/verify-connections.js` from inside server/)
 *
 * Checks each hop in the chain independently so you know exactly
 * where a break is: token, repo access, or workflow dispatch.
 */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', 'server', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} else {
  console.log(`WARNING: could not find ${envPath} — did you run "cp .env.example .env" in server/?`);
}
const { checkAuth, checkRepoAccess, triggerWorkflow } = require('../server/utils/github');

function line() { console.log('-'.repeat(50)); }

async function main() {
  console.log('Verifying Client -> Server -> GitHub -> Actions chain\n');
  line();

  // Step 1: token validity
  console.log('[1/3] Checking GITHUB_TOKEN is valid...');
  try {
    const auth = await checkAuth();
    console.log(`  OK - token is valid, authenticated as: ${auth.login}`);
  } catch (err) {
    console.log(`  FAILED - ${err.message}${err.status ? ' (HTTP ' + err.status + ')' : ''}`);
    if (err.status === 401) {
      console.log('  -> Token is invalid/expired/revoked. Generate a new one at https://github.com/settings/tokens');
    }
    console.log('\nStopping here — fix the token before checking further steps.');
    process.exitCode = 1;
return;
  }
  line();

  // Step 2: repo access
  console.log('[2/3] Checking token can access GITHUB_OWNER/GITHUB_REPO...');
  try {
    const repo = await checkRepoAccess();
    console.log(`  OK - repo reachable: ${repo.full_name} (default branch: ${repo.default_branch})`);
    console.log(`  Permissions: ${JSON.stringify(repo.permissions)}`);
    if (!repo.permissions || !repo.permissions.push) {
      console.log('  WARNING - token does not have push access to this repo. Commits will fail.');
    }
  } catch (err) {
    console.log(`  FAILED - ${err.message}${err.status ? ' (HTTP ' + err.status + ')' : ''}`);
    if (err.status === 404) {
      console.log('  -> Check GITHUB_OWNER / GITHUB_REPO spelling in .env, and that the token can see this repo (private repos need "repo" scope).');
    }
    console.log('\nStopping here — fix repo access before checking workflow dispatch.');
    process.exitCode = 1;
return;
  }
  line();

  // Step 3: workflow dispatch (does NOT actually trigger unless you pass --trigger)
  const shouldTrigger = process.argv.includes('--trigger');
  console.log(`[3/3] ${shouldTrigger ? 'Triggering' : 'Checking (dry-run) whether'} workflow_dispatch works...`);
  if (!shouldTrigger) {
    console.log('  Skipped actual trigger (run with --trigger to actually fire the workflow).');
    console.log('  If token + repo checks above passed, dispatch should work as long as:');
    console.log('   - GITHUB_WORKFLOW_FILE matches a real file in .github/workflows on GITHUB_BRANCH');
    console.log('   - that workflow file has "workflow_dispatch:" under "on:"');
  } else {
    try {
      const result = await triggerWorkflow({});
      console.log(`  OK - dispatched: ${JSON.stringify(result)}`);
      console.log('  Check the Actions tab on GitHub to watch it run.');
    } catch (err) {
      console.log(`  FAILED - ${err.message}${err.status ? ' (HTTP ' + err.status + ')' : ''}`);
      if (err.status === 422) {
        console.log('  -> Usually means the workflow file has no workflow_dispatch trigger, or ref/branch is wrong.');
      }
      if (err.status === 404) {
        console.log('  -> GITHUB_WORKFLOW_FILE name does not match any file in .github/workflows on GITHUB_BRANCH.');
      }
    }
  }
  line();
  console.log('\nAll checks complete.');
}

main();
