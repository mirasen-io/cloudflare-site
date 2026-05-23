## 1. Pre-flight verification

- [ ] 1.1 Confirm the actual GitHub repo slug for this site (likely `mirasen-io/cloudflare-site`) and substitute it everywhere a `github.repository ==` guard appears.
- [ ] 1.2 Confirm whether `mirasen-io/chessboard` is public or private. If private, plan to pass an app token to the chessboard `actions/checkout` step in `ci.yml` and `release.yml`.
- [ ] 1.3 Confirm with the maintainer that the chessboard `WORKFLOW_APP_*` and `APPROVE_APP_*` GitHub Apps are installed on this repo; if not, request installation.
- [x] 1.4 `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are confirmed available as repository **secrets**. *(done)* `WORKFLOW_APP_ID` / `WORKFLOW_APP_PRIVATE_KEY` and `APPROVE_APP_ID` / `APPROVE_APP_PRIVATE_KEY` remain to verify (task 1.3).
- [ ] 1.5 Confirm release design: **direct `changesets/action@v1` with `cwd: site`**, gated on `steps.changesets.outputs.published == 'true'`. `kt-workflows/actions/npm-release@main` is intentionally not used in `release.yml` for semantic clarity (Decision 4.1 — non-npm release flow). Workflow-root install + build via `kt-workflows/actions/npm-ci-check@main` (with `checkout: false`).
- [ ] 1.6 Confirm whether to keep `auto-release.yml` for this private site or skip it (open question from design.md). Default is "port".

## 2. Changeset surface

- [x] 2.1 Add `@changesets/cli` to `devDependencies` and refresh `package-lock.json`. *(done in package.json update — `^2.31.0`)*
- [x] 2.2 `.changeset/config.json` includes `"privatePackages": { "version": true, "tag": true }`. *(done)*
- [x] 2.3 Create `.changeset/README.md` with a one-line pointer to the changesets docs. *(done — chessboard's README transferred verbatim, content is appropriate)*
- [ ] 2.4 Add an initial changeset markdown recording the workflow-bootstrap change so the first release has a non-empty changelog entry.

## 3. package.json release scripts

- [x] 3.1 Add `"changeset:version": "changeset version && npm install && npm run format && git add --all"`. *(done in package.json update)*
- [x] 3.2 Add `"changeset:publish": "changeset publish"` (no custom JSON-line shim — `privatePackages.tag: true` makes the vanilla command emit the tag line that `changesets/action@v1` needs). *(done in package.json update)*
- [x] 3.3 No `release:stage-deploy` (or equivalent) staging script is introduced. Deployment uses the SvelteKit build output directly via `cloudflare/wrangler-action@v4`, after `wrangler.jsonc` is updated to declare `assets.directory: ./build` (relative to `./site`; see task 11). *(decision recorded)*
- [ ] 3.4 Verify locally end-to-end: from the workspace root with `./site` and `./chessboard` siblings, run `npm ci --prefix chessboard`, `npm ci --prefix site`, `npm run build:full --prefix site`, and confirm `./site/build/` contains the deployable site after the static-asset migration in task 11.
- [ ] 3.5 Confirm `package.json` keeps `private: true` and the `"@mirasen/chessboard": "file:../chessboard"` dependency unchanged. *(verified in package.json)*

## 4. ci.yml — port with semantic changes, kt-workflows wrappers with `checkout: false`

- [ ] 4.1 Create `.github/workflows/ci.yml` with `on: { push: { branches: [main, contribution] }, pull_request: }`, top-level concurrency, and `permissions` (`contents: read`, `actions: write`, `pull-requests: read`).
- [ ] 4.2 Add `env.DEFAULT_MATRIX_NODE_VERSION: '["22","24"]'` and `env.DEFAULT_CACHE_RESET: false`.
- [ ] 4.3 Implement the `check-execution` job mirroring chessboard (open-PR-on-contribution skip + identical-tree-to-main skip).
- [ ] 4.4 Implement the `config` job emitting `matrix-node-version` and `cache-reset` outputs (drop the `sonar` output; this site has no SonarCloud).
- [ ] 4.5 Implement the `check` job:
  - `actions/checkout@v6` of this repo to `path: site`
  - `actions/checkout@v6` of `mirasen-io/chessboard` to `path: chessboard, ref: main` (with token from app-token step if private — apply-phase decision)
  - `kt-workflows/actions/npm-ci-check@main` with:
    - `checkout: false`
    - `matrix-node-version: <latest of matrix>` (single Node for `check`)
    - `cache-reset: ${{ needs.config.outputs.cache-reset }}`
    - `install-script: |\n  npm ci --prefix chessboard\n  npm ci --prefix site`
    - `run-script: |\n  npm run build:full --prefix site\n  npm run lint --prefix site\n  npm run check --prefix site`
- [ ] 4.6 Implement the `test` job: same checkout pair, `kt-workflows/actions/npm-ci-test@main` matrixed over `${{ fromJson(needs.config.outputs.matrix-node-version) }}` with:
  - `checkout: false`
  - `install-script: |\n  npm ci --prefix chessboard\n  npm ci --prefix site`
  - `run-script: |\n  npm run build:full --prefix site\n  npm run test --prefix site`
  - The wrapper's default `cache-additional-path` already covers `~/.cache/ms-playwright`, so no separate Playwright cache step is needed.
- [ ] 4.7 Implement `required-main` (needs `check`, `test`) and `required-contribution` (needs `check`, `test`) aggregate jobs.
- [ ] 4.8 Verify no `NPM_TOKEN`, no `SONAR_TOKEN`, no `CLOUDFLARE_*` references in `ci.yml`.

## 5. codeql.yml — port mostly as-is

- [ ] 5.1 Create `.github/workflows/codeql.yml` with the same triggers as chessboard (`push: main`, `pull_request:`, weekly cron).
- [ ] 5.2 Use the same matrix (`actions`, `javascript-typescript`) and `build-mode: none`.
- [ ] 5.3 Confirm only this repo is checked out — no chessboard checkout needed.

## 6. auto-merge.yml — port mostly as-is

- [ ] 6.1 Create `.github/workflows/auto-merge.yml` using `kt-workflows/actions/dependabot-auto-merge@main` with `WORKFLOW_APP_*` and `APPROVE_APP_*` secrets.
- [ ] 6.2 Verify the `if: github.event.pull_request.user.login == 'dependabot[bot]'` guard is preserved.

## 7. auto-release.yml — port with repo guard (or skip)

- [ ] 7.1 If task 1.6 says "keep": create `.github/workflows/auto-release.yml` with the monthly cron + `workflow_dispatch`, repo-slug guard, `kt-workflows/actions/dependabot-auto-release@main` and the App secrets.
- [ ] 7.2 If task 1.6 says "skip": leave the file out and document the skip in the change PR description.

## 8. contribution-update.yml — port with repo guard

- [ ] 8.1 Create `.github/workflows/contribution-update.yml`.
- [ ] 8.2 Update the repo guard to this repo's slug.
- [ ] 8.3 Confirm `kt-workflows/actions/get-associated-pr@main` and `create-github-app-token@main` resolve and the App is installed.

## 9. contribution-reset.yml — port with repo guard

- [ ] 9.1 Create `.github/workflows/contribution-reset.yml`.
- [ ] 9.2 Update the repo guard to this repo's slug.
- [ ] 9.3 Confirm force-with-lease push works under the App token.

## 10. release.yml — reworked for Cloudflare, no npm publish

- [ ] 10.1 Create `.github/workflows/release.yml` with `on: { workflow_run: { workflows: ["CI"], types: [completed], branches: [main] }, workflow_dispatch: }`.
- [ ] 10.2 Add concurrency `${{ github.repository }}-${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`, and `permissions: { contents: write, pull-requests: write }` (no `id-token`).
- [ ] 10.3 Add the dual-event `if:` guard:
  ```
  github.repository == 'mirasen-io/<site-slug>' &&
  (
    github.event_name == 'workflow_dispatch' ||
    (github.event_name == 'workflow_run' &&
     github.event.workflow_run.event == 'push' &&
     github.event.workflow_run.conclusion == 'success')
  )
  ```
- [ ] 10.4 Step: `kt-workflows/actions/create-github-app-token@main` with `default-to-github-token: true`, `configure-git: false`. Stores token in `steps.app-token.outputs.token`.
- [ ] 10.5 Two `actions/checkout@v6`: site → `path: site, fetch-depth: 0, token: ${{ steps.app-token.outputs.token }}`; chessboard → `repository: mirasen-io/chessboard, path: chessboard, ref: main` (with token if private). The site checkout uses `fetch-depth: 0` so Changesets generates accurate changelogs against full git history.
- [ ] 10.6 `kt-workflows/actions/npm-ci-check@main` for install + build:
  - `checkout: false`
  - `matrix-node-version: '["24"]'`
  - `install-script: |\n  npm ci --prefix chessboard\n  npm ci --prefix site`
  - `run-script: |\n  npm run build:full --prefix site`
- [ ] 10.7 `changesets/action@v1` (id `changesets`) invoked directly with:
  - `cwd: site`
  - `version: npm run changeset:version`
  - `publish: npm run changeset:publish`
  - `createGithubReleases: true`
  - `env.GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}`
- [ ] 10.8 Conditional Cloudflare deploy step using `cloudflare/wrangler-action@v4`, gated on `if: ${{ steps.changesets.outputs.published == 'true' }}`, with `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}`, `accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`, `command: deploy`, `workingDirectory: ./site` (camelCase per the action's input contract; the action resolves `assets.directory: ./build` from `wrangler.jsonc` relative to that working directory).
- [ ] 10.9 Verify `release.yml` references no `NPM_TOKEN` and does not invoke `npm publish` anywhere.
- [ ] 10.10 Add a comment block documenting the Changesets contract: `privatePackages.tag: true` + vanilla `changeset publish` produces the tag-emit line that `changesets/action@v1` parses to create the GitHub Release without npm publish.
- [ ] 10.11 Document the fallback if Changesets ever drops the tag emit for private packages: detect the gate as `false` even with a merged Version PR and run `gh release create "<tag>" --notes-file CHANGELOG.md` (or `softprops/action-gh-release`) before the deploy step.

## 11. Wrangler config + static-asset migration (replaces previous deploy-staging tasks)

- [ ] 11.1 Update `wrangler.jsonc`: change `assets.directory` from `./deploy-site` to `./build`.
- [ ] 11.2 Move static-only assets from `./deploy-site/` into `./static/`: `favicon.ico`, `sitemap.xml`, `assets/` (logos, css), and any other file that is not produced by `vite build`. After move, these are picked up by SvelteKit's static input dir and copied into `build/` during build.
- [ ] 11.3 **Verify routing first; do not auto-change `trailingSlash`.** Existing SEO direction is canonical URLs without trailing slash. Apply phase MUST first verify whether Cloudflare Workers + Wrangler assets serve the current `adapter-static` flat output (`chess-lore.html`, `chessboard.html`, etc.) correctly for no-trailing-slash routes (`/chess-lore`, `/chessboard`). Only if that serving model is incompatible may the maintainer deliberately accept a routing/SEO change (e.g. setting `export const trailingSlash = 'always'` on selected routes, with redirects from non-trailing-slash variants). This is a **deliberate routing/SEO decision**, not a mechanical deploy-output fix.
- [ ] 11.4 After the migration, run `npm run build:full --prefix site` and diff `./site/build/` against `./site/deploy-site/` to confirm the build output is a superset of the prior hand-curated tree (no missing files, no missing routes).
- [ ] 11.5 Remove `./site/deploy-site/` from git once 11.4 is clean.
- [ ] 11.6 Verify `npx wrangler deploy --dry-run` (from `./site`) succeeds with the new `assets.directory: ./build` and the expected file set.

## 12. Local dry-runs

- [ ] 12.1 Locally run the same install/build sequence the workflow will use: `npm ci --prefix chessboard`, `npm ci --prefix site`, `npm run build:full --prefix site`, `npm run lint --prefix site`, `npm run check --prefix site`, `npm run test --prefix site`. Confirm a clean result with the sibling layout.
- [ ] 12.2 Locally run `npx wrangler deploy --dry-run` from `./site` after the static-asset migration (task 11) and confirm Wrangler resolves `./build/` and the file set matches the expected deployment surface.
- [ ] 12.3 Locally run `npx changeset add` + `npm run changeset:version` to verify Changesets reads the new config (private package gets versioned) and the Version PR shape would be coherent.
- [ ] 12.4 Locally run `npm run changeset:publish` against an empty changeset state and confirm: it does not call `npm publish`, it does not error in the absence of `NPM_TOKEN`, and it would emit the `🦋  New tag:` line for the private package after a real version bump.
- [ ] 12.5 Run `openspec validate add-github-actions-workflows --strict` and resolve any issues.

## 13. Repository configuration (out-of-band; document in PR description)

- [ ] 13.1 Document required secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `WORKFLOW_APP_ID`, `WORKFLOW_APP_PRIVATE_KEY`, `APPROVE_APP_ID`, `APPROVE_APP_PRIVATE_KEY`.
- [ ] 13.2 Document optional repo variables: `MATRIX_NODE_VERSION`, `CACHE_RESET`.
- [ ] 13.3 Document branch protection: `main` requires `required-main`; `contribution` requires `required-contribution`.
- [ ] 13.4 Document the `dependabot.yml` config addition (separate, optional follow-up) needed to populate Dependabot PRs the auto-merge workflow expects.

## 14. Apply-phase verification of the release contract

After the workflow PR merges, exercise the contract end-to-end before declaring done:

- [ ] 14.1 Open a trivial PR; confirm `ci.yml` runs `check` + `test` and reports `required-main`. No Cloudflare secret references appear in the run logs.
- [ ] 14.2 Push a commit to `contribution`; verify `check-execution` correctly handles the open-PR-skip and identical-tree-skip cases.
- [ ] 14.3 Confirm CodeQL results land in the Security tab.
- [ ] 14.4 Add a no-op `.changeset/*.md` and merge it; verify `release.yml` opens/updates the "Version Packages" PR.
- [ ] 14.5 Merge the "Version Packages" PR. Verify, in this exact order:
  - (a) `release.yml` runs.
  - (b) The job logs contain **no** `npm publish` invocation.
  - (c) A new Git tag `@mirasen/main-website@<version>` exists.
  - (d) A GitHub Release at that tag exists with the changelog content.
  - (e) The `cloudflare/wrangler-action@v4` step ran exactly once and the deploy succeeded.
  - (f) `npm run changeset:publish` emitted the `🦋  New tag:` stdout line that `changesets/action@v1` parsed.
  - (g) The deploy gate `steps.changesets.outputs.published == 'true'` evaluated to `true`.
- [ ] 14.6 Manually `workflow_dispatch` `release.yml` once with no pending changesets; verify the workflow runs (not gated out), Changesets reports nothing to publish, the deploy gate is `false`, and the deploy step does not run.
- [ ] 14.7 Verify Cloudflare secrets do not appear in any non-release workflow run log.
- [ ] 14.8 If 14.5(b)–(d) fails (Changesets did not create a GitHub Release for the private package), apply the fallback documented in task 10.11: extend `release.yml` with a `gh release create` step gated on the new tag's existence.

## 15. Archive the change

- [ ] 15.1 After all workflows are validated in production, archive the change with `/opsx:archive`.
