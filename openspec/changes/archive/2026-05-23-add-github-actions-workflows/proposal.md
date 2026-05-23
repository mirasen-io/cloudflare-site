## Why

The site repo currently has no `.github/workflows/` directory, so PRs are not validated, dependency updates are not gated, security scans do not run, and there is no automated path from a merged change to a deployed Cloudflare site. The migration to SvelteKit + Cloudflare and the interactive examples are basically complete, so this is the right moment to bring CI/CD in line with the rest of the Mirasen stack — using the `@mirasen/chessboard` workflow set as the reference pattern, but adapted to a SvelteKit/Cloudflare site that does not publish to npm.

## What Changes

- Add seven GitHub Actions workflows under `.github/workflows/`, ported from `@mirasen/chessboard` and adapted to the site:
  - `ci.yml` — lint, type-check, build, unit + e2e tests on PRs and `main`/`contribution` pushes.
  - `codeql.yml` — CodeQL scanning for `actions` and `javascript-typescript`.
  - `auto-merge.yml` — Dependabot auto-merge using the kt-workflows action.
  - `auto-release.yml` — Scheduled Dependabot auto-release (monthly cron + manual dispatch).
  - `contribution-update.yml` — Sync `main` → `contribution` after PRs merge to `main`.
  - `contribution-reset.yml` — Hard-reset `contribution` to `main` after a `contribution → main` PR merges.
  - `release.yml` — **Reworked**: changeset-driven release for a private package that creates GitHub Releases and deploys to Cloudflare via Wrangler instead of publishing to npm.
- Adopt the chessboard CI shape: top-level `concurrency` cancellation, `check-execution` gating, a `config` job emitting `MATRIX_NODE_VERSION`/`CACHE_RESET`, separate `check`/`test` jobs over a Node matrix (`["22", "24"]`), and stable `required-main` / `required-contribution` aggregate jobs for branch protection.
- Use the kt-workflows composite actions for the validation jobs only, with workflow-level checkout into `./site` + `./chessboard` and the wrappers driving setup-node, install-script, and run-script. Specifically: `kt-workflows/actions/npm-ci-check@main` (with `checkout: false`) for the `check` job and `kt-workflows/actions/npm-ci-test@main` (with `checkout: false`) for the `test` job. Plus `dependabot-auto-merge@main`, `dependabot-auto-release@main`, `get-associated-pr@main`, `create-github-app-token@main` for the existing chessboard patterns. **`kt-workflows/actions/npm-release@main` is intentionally not used in `release.yml`** — the action is technically capable (it now supports `checkout: false`, `working-directory`, and a `published` output), but this site's release is a Changesets-driven site release plus a Cloudflare deployment, not an npm-package release. Using an action named `npm-release` here is semantically misleading and keeps npm-specific baggage (npm provenance, `NPM_TOKEN` fallback, `npm@11` force-install) inside a non-npm release flow. `release.yml` invokes `changesets/action@v1` directly instead. See design.md Decision 4.
- Command layout convention:
  - **CI (lint/check/build, test)**: `kt-workflows/actions/npm-ci-check@main` / `npm-ci-test@main` with `checkout: false` run from workflow root; install via `npm ci --prefix chessboard` + `npm ci --prefix site`; build via `npm run build:full --prefix site`.
  - **Release**: same workflow-root install + build, then `changesets/action@v1` directly with `cwd: site`. Cloudflare deploy via `cloudflare/wrangler-action@v4` gated on `steps.changesets.outputs.published == 'true'`.
- Standardize on a sibling-checkout layout for every workflow that needs the local `@mirasen/chessboard` dependency: site checked out into `./site`, chessboard checked out into `./chessboard`. CI/test wrappers may run from workflow root **or** from `./site`, but install-script and run-script prefixes MUST match the chosen working directory: from workflow root use `npm ci --prefix chessboard` / `npm ci --prefix site` / `npm run build:full --prefix site`; from `./site` use `npm ci --prefix ../chessboard` / `npm ci` / `npm run build:full`. **Dependency installation MUST be expressed inside the kt-workflows action's `install-script` input** (not as a separate run step) so the wrapper's package-lock cache key includes both repos. The `"@mirasen/chessboard": "file:../chessboard"` local dependency strategy is preserved unchanged.
- Add a `.changeset/` directory: `config.json` modeled on chessboard's, **plus** `privatePackages: { version: true, tag: true }` so the private site package gets versioned and tagged. **No changes to the npm package name or `private: true`** — the site stays an unpublished package.
- Extend `package.json` with the changeset scripts the workflow calls: `changeset:version`, `changeset:publish`. **No `release:stage-deploy` script is introduced** — deployment uses the existing site build output directly.
- Update `wrangler.jsonc` so `assets.directory` points at the SvelteKit build output (`./build`) instead of `./deploy-site/`. Migrate any checked-in static assets currently under `deploy-site/` (`favicon.ico`, `sitemap.xml`, `assets/`, etc.) into `static/` so SvelteKit copies them into `build/` during `vite build`. After the migration, `deploy-site/` is no longer on the deployment path and may be removed.
- `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` exist as repository **secrets** (not vars). Use `cloudflare/wrangler-action@v4` for the deploy step (the official Cloudflare action; the `wrangler` CLI is already a site devDependency). **NPM_TOKEN is not required and must not be referenced.**
- Install/build strategy in CI: after sibling checkout, run `npm ci --prefix chessboard` and `npm ci --prefix site`, then `npm run build:full --prefix site` (which builds chessboard, reinstalls site to refresh the file:-link, and builds the site). No bespoke staging step.

## Capabilities

### New Capabilities

- `ci-validation`: PR/push validation pipeline — lint, svelte-check, build, unit tests, e2e tests on a Node matrix, with the sibling `./site` + `./chessboard` checkout, driven by kt-workflows npm-CI actions.
- `codeql-scanning`: CodeQL security analysis for `actions` and `javascript-typescript` on push to `main`, PRs, and a weekly schedule.
- `dependabot-automation`: Dependabot auto-merge on PRs and scheduled auto-release of accumulated Dependabot updates.
- `contribution-branch-flow`: `contribution` branch maintenance — update from `main` after merges, reset after a `contribution → main` PR merges, and CI duplicate-run avoidance.
- `cloudflare-release`: Changeset-driven release for a private package — produces a versioned `package.json`, a CHANGELOG, a Git tag, a GitHub Release, and a Wrangler deployment to Cloudflare, with no `npm publish` and no `NPM_TOKEN`.

### Modified Capabilities

<!-- None. No existing site spec covers CI/CD, releases, or deployment. -->

## Impact

- **New files**: `.github/workflows/{ci,codeql,auto-merge,auto-release,contribution-update,contribution-reset,release}.yml`.
- **Modified files**:
  - `package.json` — `changeset:version`, `changeset:publish` scripts and `@changesets/cli` devDependency are already added.
  - `.changeset/config.json` — already created from chessboard's; `privatePackages: { version: true, tag: true }` already added.
  - `.changeset/README.md` — already created from chessboard's.
  - `wrangler.jsonc` — `assets.directory` changes from `./deploy-site` to the SvelteKit build output (`./build`).
  - `static/` — receives the static assets currently under `deploy-site/` (`favicon.ico`, `sitemap.xml`, `assets/*`, etc.) so they are copied into `build/` by `vite build`.
  - `deploy-site/` — removed from the deployment path; can be deleted from git after the static migration.
- **Repository settings (out of band, documented in the change)**: branch protection on `main` referring to `required-main`; required org/repo secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `WORKFLOW_APP_ID`, `WORKFLOW_APP_PRIVATE_KEY`, `APPROVE_APP_ID`, `APPROVE_APP_PRIVATE_KEY`; optional repo variables `MATRIX_NODE_VERSION`, `CACHE_RESET`.
- **Deployment**: site is deployed to Cloudflare Workers via `cloudflare/wrangler-action@v4` only on trusted events (push to `main` after CI success, or manual `workflow_dispatch` on the production repo). Fork PRs never receive Cloudflare secrets.
- **Behavior preserved**: existing SvelteKit routes, examples, unit/e2e tests, and the `"@mirasen/chessboard": "file:../chessboard"` local dependency strategy are unchanged.
- **Out of scope**: switching `@mirasen/chessboard` to a published pinned package; SonarCloud / coverage reporting; npm publishing of the site package; Cloudflare Pages preview deploys per PR.
