# Publish Flow (Client → Server → GitHub → Actions → Live Website)

A minimal, working implementation of the diagram you shared. Every hop can be
tested independently, which is the fastest way to find where a broken GitHub
token is breaking things.

```
Client App (client/index.html)
   |  POST /publish
   v
Server App (server/server.js, Express)
   |  Octokit: commit file + workflow_dispatch
   v
GitHub Repo  ->  GitHub Actions (.github/workflows/deploy.yml)
   |
   v
Live Website
```

## 1. Install

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:
- `GITHUB_TOKEN` — a Personal Access Token
  - Classic token: needs **repo** + **workflow** scopes
  - Fine-grained token: needs **Contents: Read & Write** and **Actions: Read & Write**
  - Generate at https://github.com/settings/tokens
- `GITHUB_OWNER` / `GITHUB_REPO` — the target repository
- `GITHUB_BRANCH` — branch that has `.github/workflows/deploy.yml` (push the
  workflow file in this project to that branch first)
- `GITHUB_WORKFLOW_FILE` — filename of the workflow (default `deploy.yml`)

## 2. Verify GitHub connectivity BEFORE touching the client

This is the step that catches "token not working" issues fast.

```bash
cd server
npm run verify
```

It checks, in order, and stops at the first failure:
1. **Token validity** — calls `GET /user` on GitHub. A 401 here means the
   token itself is bad (expired, revoked, mistyped, wrong prefix `ghp_`/`github_pat_`).
2. **Repo access** — calls `GET /repos/{owner}/{repo}`. A 404 usually means
   wrong owner/repo name, or the token can't see a private repo (missing `repo` scope).
3. **Workflow dispatch** — dry-run by default; add `--trigger` to actually fire it:
   ```bash
   node ../scripts/verify-connections.js --trigger
   ```
   A 422 here almost always means the workflow file is missing the
   `workflow_dispatch:` trigger, or isn't on the branch you pointed at.

## 3. Start the server

```bash
cd server
npm start
```

Then check:
- `GET http://localhost:4000/health` → confirms server itself is up (Client ↔ Server hop)
- `GET http://localhost:4000/github-status` → confirms Server ↔ GitHub hop (token + repo, live)

## 4. Open the client

Open `client/index.html` directly in a browser (or serve it with any static
server). Set the "Server URL" field if your server isn't on
`http://localhost:4000`, fill the form, click **Publish**.

On success the response includes the commit SHA and workflow dispatch
confirmation. Go to your repo's **Actions** tab on GitHub to watch the build/deploy run.

## 5. Wire up real deploy

`.github/workflows/deploy.yml` has a placeholder deploy step — swap it for
your actual Hostinger FTP deploy action (e.g. `SamKirkland/FTP-Deploy-Action`)
and add `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` as repo secrets under
Settings → Secrets and variables → Actions.

## Common token failure modes (from experience)

| Symptom | Cause | Fix |
|---|---|---|
| 401 Bad credentials | Token expired/revoked/mistyped | Generate a new token, paste exactly (no quotes/spaces) |
| 404 on repo check | Wrong owner/repo, or private repo without scope | Check spelling; classic token needs `repo` scope for private repos |
| 403 on commit | Token has read-only or missing `repo`/Contents scope | Regenerate token with write access |
| 422 on workflow dispatch | No `workflow_dispatch:` in the workflow YAML, or wrong branch/ref | Confirm the workflow file on GitHub, not just locally, has it |
| 404 on workflow dispatch | `GITHUB_WORKFLOW_FILE` name doesn't match a file in `.github/workflows` on `GITHUB_BRANCH` | Match filename exactly, push it to that branch |

## Project structure

```
publish-flow/
├── client/index.html              # Client App (simple form, fetch POST)
├── server/
│   ├── server.js                  # Express app: /health, /github-status, /publish
│   ├── routes/publish.js          # validate -> commit -> trigger workflow
│   ├── utils/github.js            # Octokit wrapper (auth/repo/commit/dispatch)
│   ├── package.json
│   └── .env.example
├── scripts/verify-connections.js  # standalone step-by-step connection tester
├── .github/workflows/deploy.yml   # sample CI/CD workflow (workflow_dispatch + push)
└── README.md
```
