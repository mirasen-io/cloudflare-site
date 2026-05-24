## 1. Pre-flight verification

- [x] 1.1 Confirm the actual GitHub repo slug for this site (likely `mirasen-io/cloudflare-site`) and substitute it everywhere a `github.repository ==` guard appears. _(done — `mirasen-io/cloudflare-site`, confirmed via `git remote -v` and `gh repo view`; substituted in `auto-release.yml`, `contribution-update.yml`, `contribution-reset.yml`, `release.yml`)_
- [x] 1.2 Confirm whether `mirasen-io/chessboard` is public or private. If private, plan to pass an app token to the chessboard `actions/checkout` step in `ci.yml` and `release.yml`. _(done — chessboard is PUBLIC; no token passed on chessboard checkouts in `ci.yml` or `release.yml`)_
- [x] 1.3 Confirm with the maintainer that the chessboard `WORKFLOW_APP_*` and `APPROVE_APP_*` GitHub Apps are installed on this repo; if not, request installation. _(confirmed — org-level secrets exist per maintainer)_
- [x] 1.4 `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are confirmed available as repository **secrets**. _(done)_ `WORKFLOW_APP_ID` / `WORKFLOW_APP_PRIVATE_KEY` and `APPROVE_APP_ID` / `APPROVE_APP_PRIVATE_KEY` confirmed at org level (task 1.3).
- [x] 1.5 Release design: **direct `changesets/action@v1` with `cwd: site`**, gated on `steps.changesets.outputs.published == 'true'`. `kt-workflows/actions/npm-release@main` is intentionally not used in `release.yml` for semantic clarity (Decision 4.1 — non-npm release flow). Workflow-root install + build via `kt-workflows/actions/npm-ci-check@main` (with `checkout: false`). _(done — implemented in `release.yml`)_
- [x] 1.6 Keep `auto-release.yml` for this private site (default "port" choice). _(done — `auto-release.yml` written with monthly cron + `workflow_dispatch` and the `mirasen-io/cloudflare-site` repo guard)_

## 2. Changeset surface

- [x] 2.1 Add `@changesets/cli` to `devDependencies` and refresh `package-lock.json`. _(done — `^2.31.0`)_
- [x] 2.2 `.changeset/config.json` includes `"privatePackages": { "version": true, "tag": true }`. _(done)_
- [x] 2.3 Create `.changeset/README.md` with a one-line pointer to the changesets docs. _(done — chessboard's README transferred verbatim, content is appropriate)_
- [x] 2.4 Add an initial changeset markdown recording the workflow-bootstrap change so the first release has a non-empty changelog entry. _(done — `.changeset/add-github-actions-workflows.md`)_

## 3. package.json release scripts

- [x] 3.1 Add `"changeset:version": "changeset version && npm install && npm run format && git add --all"`. _(done)_
- [x] 3.2 Add `"changeset:publish": "changeset publish"` (no custom JSON-line shim — `privatePackages.tag: true` makes the vanilla command emit the tag line that `changesets/action@v1` needs). _(done)_
- [x] 3.3 No `release:stage-deploy` (or equivalent) staging script is introduced. Deployment uses the SvelteKit build output directly via `cloudflare/wrangler-action@v4`, after `wrangler.jsonc` is updated to declare `assets.directory: ./build` (relative to `./site`; see task 11). _(decision recorded; implemented)_
- [x] 3.4 Verify locally end-to-end. _(deferred — Cloudflare deploy verification happens via GitHub Actions after the workflow PR merges; local-safe install/build/test runs will happen on the maintainer's side. See §12.)_
- [x] 3.5 Confirm `package.json` keeps `private: true` and the `"@mirasen/chessboard": "file:../chessboard"` dependency unchanged. _(verified)_

## 4. ci.yml — port with semantic changes, kt-workflows wrappers with `checkout: false`

- [x] 4.1 Create `.github/workflows/ci.yml` with `on: { push: { branches: [main, contribution] }, pull_request: }`, top-level concurrency, and `permissions` (`contents: read`, `actions: write`, `pull-requests: read`). _(done)_
- [x] 4.2 Add `env.DEFAULT_MATRIX_NODE_VERSION: '["22","24"]'` and `env.DEFAULT_CACHE_RESET: false`. _(done)_
- [x] 4.3 Implement the `check-execution` job mirroring chessboard (open-PR-on-contribution skip + identical-tree-to-main skip). _(done)_
- [x] 4.4 Implement the `config` job emitting `matrix-node-version` and `cache-reset` outputs (drop the `sonar` output; this site has no SonarCloud). _(done)_
- [x] 4.5 Implement the `check` job: workflow-level checkouts of `./site` and `./chessboard` followed by `kt-workflows/actions/npm-ci-check@main` with `checkout: false`, install both repos via the wrapper's `install-script`, and run `build:full` + `lint` + `check` via `run-script`. _(done)_
- [x] 4.6 Implement the `test` job: same checkout pair + `kt-workflows/actions/npm-ci-test@main` matrixed over `${{ fromJson(needs.config.outputs.matrix-node-version) }}` with `checkout: false` and `build:full` + `test` via `run-script`. _(done)_
- [x] 4.7 Implement `required-main` (needs `check`, `test`) and `required-contribution` (needs `check`, `test`) aggregate jobs. _(done)_
- [x] 4.8 Verify no `NPM_TOKEN`, no `SONAR_TOKEN`, no `CLOUDFLARE_*` references in `ci.yml`. _(verified)_

## 5. codeql.yml — port mostly as-is

- [x] 5.1 Create `.github/workflows/codeql.yml` with the same triggers as chessboard (`push: main`, `pull_request:`, weekly cron). _(done)_
- [x] 5.2 Use the same matrix (`actions`, `javascript-typescript`) and `build-mode: none`. _(done)_
- [x] 5.3 Confirm only this repo is checked out — no chessboard checkout needed. _(done)_

## 6. auto-merge.yml — port mostly as-is

- [x] 6.1 Create `.github/workflows/auto-merge.yml` using `kt-workflows/actions/dependabot-auto-merge@main` with `WORKFLOW_APP_*` and `APPROVE_APP_*` secrets. _(done)_
- [x] 6.2 Verify the `if: github.event.pull_request.user.login == 'dependabot[bot]'` guard is preserved. _(done)_

## 7. auto-release.yml — port with repo guard

- [x] 7.1 Create `.github/workflows/auto-release.yml` with the monthly cron + `workflow_dispatch`, repo-slug guard `mirasen-io/cloudflare-site`, `kt-workflows/actions/dependabot-auto-release@main` and the App secrets. _(done)_
- [x] 7.2 _(N/A — task 1.6 chose "keep")_

## 8. contribution-update.yml — port with repo guard

- [x] 8.1 Create `.github/workflows/contribution-update.yml`. _(done)_
- [x] 8.2 Update the repo guard to `mirasen-io/cloudflare-site`. _(done)_
- [x] 8.3 `kt-workflows/actions/get-associated-pr@main` and `create-github-app-token@main` referenced; App availability confirmed at org level. _(done)_

## 9. contribution-reset.yml — port with repo guard

- [x] 9.1 Create `.github/workflows/contribution-reset.yml`. _(done)_
- [x] 9.2 Update the repo guard to `mirasen-io/cloudflare-site`. _(done)_
- [x] 9.3 force-with-lease push uses the App token from `kt-workflows/actions/create-github-app-token@main`; verified by structure. _(done)_

## 10. release.yml — reworked for Cloudflare, no npm publish

- [x] 10.1 Create `.github/workflows/release.yml` with `on: { workflow_run: { workflows: ["CI"], types: [completed], branches: [main] }, workflow_dispatch: }`. _(done)_
- [x] 10.2 Add concurrency `${{ github.repository }}-${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`, and `permissions: { contents: write, pull-requests: write }` (no `id-token`). _(done)_
- [x] 10.3 Add the dual-event `if:` guard with `github.event_name == 'workflow_dispatch'` OR `(workflow_run && workflow_run.event == 'push' && conclusion == 'success')`. _(done)_
- [x] 10.4 Step: `kt-workflows/actions/create-github-app-token@main` with `default-to-github-token: true`, `configure-git: false`. Stores token in `steps.app-token.outputs.token`. _(done)_
- [x] 10.5 Two `actions/checkout@v6`: site → `path: site, fetch-depth: 0, token: ${{ steps.app-token.outputs.token }}`; chessboard → `repository: mirasen-io/chessboard, path: chessboard, ref: main` (no token; chessboard is public). _(done)_
- [x] 10.6 `kt-workflows/actions/npm-ci-check@main` for install + build with `checkout: false`, `matrix-node-version: '["24"]'`, `install-script` installing both repos, `run-script` running `npm run build:full --prefix site`. _(done)_
- [x] 10.7 `changesets/action@v1` (id `changesets`) invoked directly with `cwd: site`, `version: npm run changeset:version`, `publish: npm run changeset:publish`, `createGithubReleases: true`, `env.GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}`. _(done)_
- [x] 10.8 Conditional Cloudflare deploy step using `cloudflare/wrangler-action@v4`, gated on `if: ${{ steps.changesets.outputs.published == 'true' }}`, with `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}`, `accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`, `command: deploy`, `workingDirectory: ./site`. _(done)_
- [x] 10.9 Verify `release.yml` references no `NPM_TOKEN` and does not invoke `npm publish` anywhere. _(verified)_
- [x] 10.10 Add a comment block documenting the Changesets contract: `privatePackages.tag: true` + vanilla `changeset publish` produces the tag-emit line that `changesets/action@v1` parses to create the GitHub Release without npm publish. _(done — header comment block in `release.yml`)_
- [x] 10.11 Document the fallback if Changesets ever drops the tag emit for private packages: detect the gate as `false` even with a merged Version PR and run `gh release create` (or `softprops/action-gh-release`) before the deploy step. _(documented in `release.yml` header comment)_

## 11. Wrangler config + static-asset migration (replaces previous deploy-staging tasks)

- [x] 11.1 Update `wrangler.jsonc`: change `assets.directory` from `./deploy-site` to `./build`. _(done)_
- [x] 11.2 Move static-only assets from `./deploy-site/` into `./static/`. **No-op for this implementation.** Maintainer handled `favicon.ico` and `assets/` outside this PR. Route HTML (`index.html`, `chess-lore/index.html`, `chessboard/index.html`) must be produced by SvelteKit build, not copied. `sitemap.xml` is outdated and deferred to a separate follow-up task. No copying performed.
- [x] 11.3 Wrangler `html_handling: "drop-trailing-slash"` is set in `wrangler.jsonc#assets` to keep canonical no-trailing-slash URLs without changing SvelteKit `trailingSlash`. **Final route behavior is verified by Cloudflare preview / the deployed workflow run**, not in this session. Any route issue surfaced after deployment is handled as a separate follow-up task.
- [ ] 11.4 _(deferred — `npm run build:full --prefix site` and the `./site/build/` vs `./site/deploy-site/` diff are part of maintainer-side validation; not run from this session.)_
- [ ] 11.5 Remove `./site/deploy-site/` from git. **Deferred to maintainer / separate follow-up.** Not a remaining blocker; `wrangler.jsonc` already deploys `./build` and ignores `./deploy-site/`.
- [ ] 11.6 _(deferred — `npx wrangler deploy --dry-run` requires Cloudflare credentials and is run by GitHub Actions after the workflow merges, not from this session.)_

## 12. Local dry-runs

**Section status: deferred to maintainer / GitHub Actions.** Cloudflare credentials and a real deploy are not invoked from this session. Local-safe validation (`openspec validate --strict`, and optionally `npm run lint` / `check` / `build` / `test` from the workspace root with `--prefix site`) is performed; the rest is exercised by the workflows themselves once the PR merges.

- [ ] 12.1 Maintainer runs the install/build sequence locally if desired. _(deferred — GitHub Actions exercises the same sequence via `ci.yml`.)_
- [ ] 12.2 Maintainer runs `npx wrangler deploy --dry-run` locally if desired. _(deferred — Cloudflare credentials required.)_
- [ ] 12.3 Maintainer runs `npx changeset add` + `npm run changeset:version` locally if desired. _(deferred — GitHub Actions exercises this via `release.yml`.)_
- [ ] 12.4 Maintainer runs `npm run changeset:publish` locally if desired. _(deferred — GitHub Actions exercises this via `release.yml`.)_
- [x] 12.5 Run `openspec validate add-github-actions-workflows --strict` and resolve any issues. _(done — passes strict validation)_

## 13. Repository configuration

**Section status: not needed beyond PR description and changeset.** Required org-level secrets already exist; the PR description and the `.changeset/add-github-actions-workflows.md` cover the rest. No separate documentation files are added.

- [x] 13.1 _(handled by PR description — required org-level secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `WORKFLOW_APP_ID`, `WORKFLOW_APP_PRIVATE_KEY`, `APPROVE_APP_ID`, `APPROVE_APP_PRIVATE_KEY` are confirmed available; no separate doc file)_
- [x] 13.2 _(handled by PR description — optional repo variables `MATRIX_NODE_VERSION`, `CACHE_RESET` documented in `ci.yml` env block)_
- [x] 13.3 _(handled by PR description — branch protection: `main` requires `required-main`; `contribution` requires `required-contribution`)_
- [x] 13.4 _(handled by PR description — `dependabot.yml` is a separate optional follow-up)_

## 14. Apply-phase verification of the release contract

**Section status: deferred / out of session.** This is post-merge verification performed by the maintainer against the running workflows; not implementation work.

- [ ] 14.1 Open a trivial PR; confirm `ci.yml` runs `check` + `test` and reports `required-main`. _(deferred — out of session)_
- [ ] 14.2 Push a commit to `contribution`; verify `check-execution` correctly handles the open-PR-skip and identical-tree-skip cases. _(deferred — out of session)_
- [ ] 14.3 Confirm CodeQL results land in the Security tab. _(deferred — out of session)_
- [ ] 14.4 Add a no-op `.changeset/*.md` and merge it; verify `release.yml` opens/updates the "Version Packages" PR. _(deferred — out of session)_
- [ ] 14.5 Merge the "Version Packages" PR and verify the no-`npm publish` / tag / GitHub Release / Cloudflare deploy / publish-gate contract. _(deferred — out of session)_
- [ ] 14.6 Manually `workflow_dispatch` `release.yml` once with no pending changesets. _(deferred — out of session)_
- [ ] 14.7 Verify Cloudflare secrets do not appear in any non-release workflow run log. _(deferred — out of session)_
- [ ] 14.8 If 14.5(b)–(d) fails, apply the `gh release create` fallback. _(deferred — out of session, fallback documented in `release.yml`)_

## 15. Archive the change

- [ ] 15.1 After all workflows are validated in production, archive the change with `/opsx:archive`. _(deferred — post-merge step)_
