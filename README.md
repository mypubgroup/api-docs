# API Docs

Static API reference site for the MyPubGroup API, published to GitHub Pages.

The site is generated from [`openapi.json`](openapi.json) using
[Redocly CLI](https://redocly.com/docs/cli/), which renders it into a single
static HTML page (via `redoc-static`).

Live site: `https://mypubgroup.github.io/api-docs/` (once GitHub Pages is
enabled — see [Manual setup](#manual-setup) below).

## How it stays up to date

This repository does not author the spec itself. Instead:

1. [`mypubgroup/api`](https://github.com/mypubgroup/api) exports its OpenAPI
   schema (via `dedoc/scramble`) after its test suite passes on `develop`.
2. That workflow commits the refreshed `openapi.json` to this repository's
   `main` branch (see `.github/workflows/build-docs.yml` in the `api` repo).
3. The push above triggers this repository's own
   [`deploy.yml`](.github/workflows/deploy.yml) workflow, which rebuilds the
   static site and deploys it to GitHub Pages.

So under normal operation nobody edits `openapi.json` by hand here — it's
overwritten automatically whenever the API changes.

## Building locally

```bash
npm install
npm run build
```

Output is written to `dist/index.html`. Open it directly in a browser to
preview.

## Manual setup

These one-off steps have to be done by a human in the GitHub UI (or via an
authenticated `gh`/API call) — they can't be scripted from within either
repository's CI:

1. **Enable GitHub Pages for this repository**, sourced from GitHub Actions:
   Settings → Pages → Build and deployment → Source → **GitHub Actions**.
2. **Create a deploy token** the `api` repo can use to push to this
   repository, and add it as a secret named `API_DOCS_DEPLOY_TOKEN` on the
   [`mypubgroup/api`](https://github.com/mypubgroup/api) repository (Settings
   → Secrets and variables → Actions → New repository secret):
   - A [fine-grained personal access
     token](https://github.com/settings/personal-access-tokens/new) scoped to
     only the `mypubgroup/api-docs` repository, with **Contents: Read and
     write** permission, is the least-privilege option.
   - Alternatively, a GitHub App installation token or deploy key with push
     access works too, if that's already how the org manages cross-repo CI
     access.
3. **Push once to `main`** (this initial commit does that) so the `deploy.yml`
   workflow runs at least once and Pages has something to serve.

After that, everything downstream — spec export, commit, rebuild, deploy — is
automatic.
