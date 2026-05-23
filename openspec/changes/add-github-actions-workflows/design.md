## Context

The site repo (`@mirasen/main-website`, `private: true`) is a SvelteKit 2 + Svelte 5 app built with Vite 8, deployed to Cloudflare via Wrangler. It depends on `@mirasen/chessboard` through a local file dependency (`"@mirasen/chessboard": "file:../chessboard"`). CI checks out `./site` and `./chessboard` side-by-side, the kt-workflows wrapper's `install-script` installs both repos, and the wrapper's `run-script` calls `npm run build:full` (which builds `../chessboard` before the site build runs and reconciles the file: link). The reference patterns come from `mirasen-io/chessboard`, which is a published library — its `release.yml` is built around `kt-workflows/actions/npm-release@main`, which wraps `changesets/action@v1` and is wired to publish to npm. The site reuses the *shape* of that pipeline for CI but invokes `changesets/action@v1` directly in `release.yml` and replaces npm publish with a Cloudflare deploy.

Inspected facts that drive the design:

- `package.json` scripts: `lint` (= `prettier --check . && eslint .`), `check` (= `svelte-kit sync && svelte-check`), `build` (= `vite build`), `test` (= `test:unit -- --run && test:e2e`), `test:e2e` (= `playwright install && playwright test`), `build:chessboard` (= `npm run build --prefix ../chessboard`), `build:full` (= `build:chessboard && npm install && build`).
- `playwright.config.ts` runs `npm run build && npm run preview` as its `webServer`. Unit tests run in a Vitest browser project (Playwright/Chromium).
- `svelte.config.js` uses `@sveltejs/adapter-static` with no options; Vite emits to `build/` by default.
- `wrangler.jsonc` (current state) is a Cloudflare **Workers** project (not Pages) with `assets.directory: ./deploy-site`; today's local deploy command is `npx wrangler deploy`. The new design changes `assets.directory` to `./build` (relative to `./site`) and replaces the manual CLI invocation with `cloudflare/wrangler-action@v4` (`command: deploy`, `workingDirectory: ./site`) inside `release.yml`. See Decisions 7 and 9.
- `./deploy-site/` is partially git-tracked: `assets/`, `favicon.ico`, `index.html`, `sitemap.xml`, `chess-lore/index.html`, `chessboard/index.html`, `chessboard/examples/*.html` are all checked in. The current `./build/` (gitignored) contains `_app/`, `chess-lore.html`, `chessboard.html`, `index.html`, `chessboard/`, `robots.txt`. So today's `deploy-site/` is a hand-curated mix of static assets and SvelteKit-built pages renamed/restructured (flat `chess-lore.html` → `chess-lore/index.html`). The release workflow must produce a fresh, deterministic artifact — not deploy stale checked-in content.
- `.gitignore` ignores `/build*`, `/.svelte-kit`, `dist`, `coverage*`, `test-results`, `.wrangler`, `node_modules`. `deploy-site/` itself is not ignored.

Inspected kt-workflows actions (under `/Users/d050316/SAPDevelop/git/personal/kt-workflows/actions/`):

- `npm-ci-check/action.yml` — composite. Inputs: `node-version`, `matrix-node-version`, `matrix-node-version-earliest`, `install-script` (default `npm ci`), `skip-npm-setup`, `run-script` (default `npm run check\nnpm run lint`), `no-cache`, `cache-additional-path` (default includes `~/.cache/ms-playwright`), `cache-reset`, `cache-dependency-path` (default `**/package-lock.json`), `working-directory` (default `.`), and **`checkout` (default `'true'`)**. The first composite step is `actions/checkout@v6` gated by `if: ${{ inputs.checkout == 'true' }}`; with `checkout: false` the action does no checkout itself and delegates straight to `npm-run-script@main`.
- `npm-ci-test/action.yml` — composite. Same `install-script` / `run-script` / `cache-*` / `working-directory` / **`checkout`** inputs as above. Default `run-script` is `npm run build\nnpm run test`. Same conditional inner checkout.
- `npm-run-script/action.yml` — composite. Has no inner checkout. Steps: `setup-node-minmax`, `npm-run-script-cache-key`, optional `npm-run-script-cache-delete`, `actions/cache@v5` for `**/node_modules` + `cache-additional-path`, `install-script`, `run-script`. All steps respect `working-directory`.
- `npm-release/action.yml` — composite. Now exposes:
  - **`checkout` input** (default `'true'`), gating the inner `actions/checkout@v6` so workflow-level sibling checkout is preserved when `checkout: false` is set.
  - **`working-directory` input** (default `'.'`), propagated as the inner `kt-workflows/actions/npm-run-script@main`'s `working-directory` AND as both `changesets/action@v1` invocations' `cwd`.
  - **`published` output** (`steps.changesets.outputs.published == 'true' || steps.changesets-fallback.outputs.published == 'true'`), so callers can gate post-release steps (e.g. Cloudflare deploy) on whether a release actually happened.
  Wraps `changesets/action@v1` with two attempts (`continue-on-error` first, `NPM_TOKEN`-fallback second). Sets `NPM_CONFIG_PROVENANCE: true`. Forces `npm install -g npm@11` if npm major < 12. `publish-script` defaults to `npm run changeset:publish`, `version-script` defaults to `npm run changeset:version`, `build-script` defaults to `npm run build:release`. All three are configurable.
- `dependabot-auto-merge/`, `dependabot-auto-release/`, `get-associated-pr/`, `create-github-app-token/` — used as-is by chessboard; no special considerations for the site beyond the repo-name guard.

## Goals / Non-Goals

**Goals:**

- Port all seven chessboard workflows to the site, preserving overall shape and naming.
- Use the kt-workflows npm-CI wrappers (`kt-workflows/actions/npm-ci-check@main` for `check`, `kt-workflows/actions/npm-ci-test@main` for `test`) as the primary implementation path with `checkout: false` and `install-script` / `run-script` inputs.
- Keep the local sibling-checkout dev layout: `./site` + `./chessboard`. CI/test wrappers may run from workflow root or from `./site`; install-script and run-script prefixes MUST be consistent with the chosen working directory.
- Validate every PR with lint, type-check, build, and unit + e2e tests on a Node `[22, 24]` matrix.
- Run a changeset-driven release that creates a Git tag, a GitHub Release, and a Cloudflare deployment for a **private** package.
- Never run `npm publish` and never require `NPM_TOKEN`.
- Keep deployment off of fork PRs and untrusted events.
- Make the deploy artifact deterministic — build always produces the published content; nothing relies on stale checked-in `deploy-site/` files for site pages.

**Non-Goals:**

- Switching `@mirasen/chessboard` to a published pinned dependency.
- SonarCloud / coverage upload (the site is not a published library; coverage gates add cost without benefit here).
- Cloudflare Pages preview deployments per PR (out of scope; can be a follow-up).
- Migrating Wrangler config or moving the deploy artifact away from `./deploy-site/`. *(superseded — this change DOES update Wrangler config and move the deploy artifact away from `./deploy-site/`; see Decision 7. Listed here only to flag that the previous revision treated this as out-of-scope; it now is in scope.)*
- npm provenance, OIDC trusted publishing, NPM_TOKEN handling.
- Modifying `kt-workflows` actions in this change. (We may suggest enhancements separately.)

## Decisions

### 1. Sibling checkout layout in every workflow that runs site code

For `ci.yml` and `release.yml`, do two checkouts at the workflow step level (not relying on action-internal checkouts):

- `actions/checkout@v6` with `path: site` (this repo).
- `actions/checkout@v6` with `repository: mirasen-io/chessboard`, `path: chessboard`, `ref: main` (default), and **no token** for the public-repo case. If `mirasen-io/chessboard` is private, add `token: ${{ steps.app-token.outputs.token }}` from a `kt-workflows/actions/create-github-app-token@main` step. Apply phase confirms visibility.

For `auto-merge.yml`, `auto-release.yml`, `contribution-update.yml`, `contribution-reset.yml`, and `codeql.yml` — none of these need the chessboard checkout, so they keep their chessboard shape verbatim and only the repository-name / org guard changes.

### 2. Use `kt-workflows/actions/npm-ci-check@main` and `npm-ci-test@main` with `checkout: false`

The user direction is "use kt-workflows npm CI actions as the primary implementation path." The previous revision of this design routed around the wrappers and used `npm-run-script@main` directly, because at that time the wrappers contained an unconditional inner `actions/checkout@v6` that would clobber a sibling `./site` + `./chessboard` checkout. **That blocker is gone** — the wrappers now expose a `checkout` input (default `'true'`) that gates the inner checkout via `if: ${{ inputs.checkout == 'true' }}`, while keeping default behavior backward-compatible with the chessboard workflows.

**Decision**: in `ci.yml`, do workflow-level checkouts of `./site` and `./chessboard`, then use:

- `kt-workflows/actions/npm-ci-check@main` with `checkout: false` for the `check` job.
- `kt-workflows/actions/npm-ci-test@main` with `checkout: false` for the `test` job.

This is the closest possible parity with chessboard's CI shape and exercises the wrappers' caching and setup-node behavior end-to-end. `kt-workflows/actions/npm-run-script@main` is still the underlying primitive both wrappers call; for this site we no longer need to use it directly. It remains a fallback or building block if a future job needs something the wrappers don't expose.

The `auto-merge.yml`, `auto-release.yml`, `contribution-update.yml`, `contribution-reset.yml` workflows continue to use `kt-workflows/actions/dependabot-auto-merge@main`, `dependabot-auto-release@main`, `get-associated-pr@main`, `create-github-app-token@main` exactly as chessboard does.

### 3. Per-workflow porting decisions

| Workflow | Decision | Notes |
|---|---|---|
| `ci.yml` | **Port with semantic changes**: keep `check-execution`, `config`, `required-main`, `required-contribution`; reuse `kt-workflows/actions/npm-ci-check@main` and `npm-ci-test@main` with `checkout: false`, after workflow-level sibling checkouts. Drop the `sonar` job. | No SonarCloud secret/job. |
| `codeql.yml` | **Port mostly as-is**. | Identical structure; only the repo path is implicit. |
| `auto-merge.yml` | **Port mostly as-is**. | Same kt-workflows action and secrets. |
| `auto-release.yml` | **Port with one change**: `if: github.repository == 'mirasen-io/<this-site-repo-slug>'` (verify the actual repo slug at implementation). | Cron + manual dispatch unchanged. Open question: keep at all for a private site (see Open Questions). |
| `contribution-update.yml` | **Port mostly as-is** (just the repo guard). | Uses `get-associated-pr` + `create-github-app-token`. |
| `contribution-reset.yml` | **Port mostly as-is** (just the repo guard). | |
| `release.yml` | **Port with major semantic changes**: changeset-driven for a private package, no npm publish, GitHub Release via `changesets/action@v1`, deploys to Cloudflare. See Decision 4. | |

### 4. Release workflow: changeset-driven for a private package, no npm publish

#### 4.1 `release.yml` invokes `changesets/action@v1` directly — `kt-workflows/actions/npm-release@main` is intentionally not used

`kt-workflows/actions/npm-release@main` is **technically capable** of running this site's release flow today. The recent kt-workflows revisions resolve every prior blocker:

- ✅ **`checkout: false`** preserves the workflow-level sibling checkout.
- ✅ **`working-directory`** propagates into the inner `npm-run-script@main` and to both `changesets/action@v1` invocations as `cwd`.
- ✅ **`published` output** lets callers gate post-release steps.

Despite being capable, **the action is intentionally not used in `release.yml`** for semantic and ergonomic reasons:

- This repo's release is a **Changesets-driven site release plus a Cloudflare deployment**, not an npm-package release. The site is `private: true` and never publishes to npm.
- An action named `npm-release` advertised on chessboard's library release flow is misleading when it appears in a site that has nothing to publish.
- The action carries npm-specific machinery that adds noise even when it's a no-op for a private package: `NPM_CONFIG_PROVENANCE: true`, the `npm@11` force-install when npm major < 12, and a `NPM_TOKEN`-fallback `changesets/action@v1` invocation. None of these are needed in a non-npm flow.

**Decision 4.1**: `release.yml` calls `changesets/action@v1` directly with `cwd: site`. Cloudflare deploy is gated on `steps.changesets.outputs.published == 'true'`. The kt-workflows wrappers (`npm-ci-check@main` / `npm-ci-test@main`) remain in use for the **CI/validation** jobs, where they fit semantically.

This rejection is a **deliberate semantic choice, not a technical incapability**. If the maintainer ever wants to revisit it (e.g. via a sibling kt-workflows action named `site-release` or `changeset-release` without npm baggage), that's a separate proposal.

#### 4.2 Changesets behavior for a private package — verified contract

The Changesets behavior we depend on:

- `privatePackages.version: true` (default already true in newer Changesets) — a private package gets its `version` field bumped by `changeset version`.
- `privatePackages.tag: true` (**not** the default) — `changeset publish` creates a Git tag for the private package and emits the `🦋  New tag: <name>@<version>` line on stdout.
- `changeset publish` for a private package **skips** `npm publish` entirely. No `NPM_TOKEN` is touched.
- `changesets/action@v1` reads stdout from the `publish` script, parses `🦋  New tag:` lines into `publishedPackages`, sets `published=true`, and creates a GitHub Release for each published entry using the GitHub token in env.

So the canonical, supported recipe for "GitHub Release for a private package, no npm publish" is:

- `.changeset/config.json` with `privatePackages: { version: true, tag: true }`.
- `npm run changeset:publish` = `changeset publish`. No custom JSON-line stdout shim.
- `changesets/action@v1` with `publish: npm run changeset:publish`.

This is the documented Changesets pattern, not a workaround. The previous proposal's "JSON-line manifest from a custom publish script" was unnecessary — it would have worked, but it relied on internal `changesets/action` parsing and was strictly inferior to using the documented `privatePackages.tag` flag. **This proposal drops that approach in favor of the documented one.**

#### 4.3 release.yml shape

```yaml
on:
  workflow_run:
    workflows: ['CI']
    types: [completed]
    branches: [main]
  workflow_dispatch:

concurrency:
  group: ${{ github.repository }}-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: write       # tag + GitHub Release
  pull-requests: write  # changesets version PR

jobs:
  release:
    runs-on: ubuntu-latest
    if: >-
      github.repository == 'mirasen-io/<site-slug>' &&
      (
        github.event_name == 'workflow_dispatch' ||
        (github.event_name == 'workflow_run'
          && github.event.workflow_run.event == 'push'
          && github.event.workflow_run.conclusion == 'success')
      )
    steps:
      - id: app-token
        uses: kt-workflows/actions/create-github-app-token@main
        with:
          app-id: ${{ secrets.WORKFLOW_APP_ID }}
          private-key: ${{ secrets.WORKFLOW_APP_PRIVATE_KEY }}
          configure-git: false
          default-to-github-token: true

      - uses: actions/checkout@v6
        with:
          path: site
          fetch-depth: 0
          token: ${{ steps.app-token.outputs.token }}

      - uses: actions/checkout@v6
        with:
          repository: mirasen-io/chessboard
          path: chessboard
          ref: main
          # token: ${{ steps.app-token.outputs.token }}  # only if private

      # Install both repos and build the site via build:full from workflow root.
      - uses: kt-workflows/actions/npm-ci-check@main
        with:
          checkout: false
          matrix-node-version: '["24"]'
          install-script: |
            npm ci --prefix chessboard
            npm ci --prefix site
          run-script: |
            npm run build:full --prefix site

      - id: changesets
        uses: changesets/action@v1
        with:
          cwd: site
          version: npm run changeset:version
          publish: npm run changeset:publish
          createGithubReleases: true
        env:
          GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}

      - if: ${{ steps.changesets.outputs.published == 'true' }}
        name: Cloudflare deploy
        uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
          workingDirectory: ./site
```

Key shape parity with chessboard: same App-token + checkout-with-token pattern, same `changesets/action@v1` driver wrapping the version PR / publish phase, same trigger surface (`workflow_run` + `workflow_dispatch`), same deferred-deploy gate on the publish output.

Key differences from chessboard: `kt-workflows/actions/npm-release@main` is **not** used (Decision 4.1 — semantic clarity for a non-npm release); `changesets/action@v1` is invoked directly with `cwd: site`; `createGithubReleases: true` is set explicitly so the GitHub Release for the private package is unambiguous; `cloudflare/wrangler-action@v4` deploy replaces npm publish; deploy gated on `steps.changesets.outputs.published == 'true'`. The dual-event `if:` ensures `workflow_dispatch` is not stripped by the absent `workflow_run` payload.

### 5. Validation command sequence

Workspace root after the two checkouts contains `./site` and `./chessboard`. CI commands run from the workspace root using `--prefix` to disambiguate, mirroring the install/build shape the maintainer uses locally.

- `check` job (single Node version, latest from matrix): `kt-workflows/actions/npm-ci-check@main` with
  - `checkout: false`
  - `working-directory: .` (workspace root; the kt-workflows default)
  - `cache-dependency-path: '**/package-lock.json'` (the wrapper default; matches both `site/package-lock.json` and `chessboard/package-lock.json`)
  - `install-script`:

    ```sh
    npm ci --prefix chessboard
    npm ci --prefix site
    ```

  - `run-script`:

    ```sh
    npm run build:full --prefix site
    npm run lint --prefix site
    npm run check --prefix site
    ```

  `build:full` runs `build:chessboard` + `npm install` + site `build` per the existing site script. The trailing `lint` and `check` then run over the freshly built tree.

- `test` job (matrix over `["22", "24"]`): `kt-workflows/actions/npm-ci-test@main` with `checkout: false`, same `install-script`; `run-script`:

    ```sh
    npm run build:full --prefix site
    npm run test --prefix site
    ```

  `npm run test` already runs unit + e2e (`test:e2e` itself does `playwright install`). **Do not** call `npm run test:e2e` separately. The e2e webServer rebuilds via `npm run build && npm run preview`, so the site is rebuilt during e2e — slight redundancy with `build:full`, but kept for parity with the maintainer's preferred install/build entrypoint.

The wrappers' default `cache-additional-path` already covers `~/.cache/ms-playwright`, so no separate Playwright cache step is needed.

### 6. Build strategy for the local `@mirasen/chessboard` dependency

Use `npm run build:full --prefix site`. The site's `build:full` script is `npm run build:chessboard && npm install && npm run build`, which:

1. Runs `npm run build --prefix ../chessboard` from `./site` → builds `chessboard/dist/`.
2. Runs `npm install` from `./site` → re-resolves the `file:../chessboard` link with the now-built `dist/`.
3. Runs `npm run build` → site Vite build.

The post-CI install step in (2) is mostly a no-op under modern npm (file: deps are symlinked, not copied), but it's kept because the maintainer authored the script that way and the parity with local dev is worth the round-trip.

We do **not** run `npm install` in the workflow's install-script (we use `npm ci --prefix site`), because `npm ci` is the CI-correct primitive — strict lockfile, deterministic. The `npm install` inside `build:full` is the only `install` invocation; it operates over an already-installed tree and reconciles the file: link.

### 7. Deployment uses the SvelteKit build output directly

`./deploy-site/` is a legacy artifact of the migration: it holds a hand-curated mix of static assets (`assets/`, `favicon.ico`, `index.html`, `sitemap.xml`, etc.) and SvelteKit-built pages renamed/restructured from `./build/`. Today's `wrangler.jsonc` declares `assets.directory: ./deploy-site`, so deployments serve that hand-curated tree.

Maintainer direction: **drop `./deploy-site/` from the deploy path; deploy `./build/` directly.** Concretely:

- **Update `wrangler.jsonc`** so `assets.directory` points at `./build` (the SvelteKit `adapter-static` default output).
- **Move static-only assets** currently checked into `deploy-site/` (`favicon.ico`, `sitemap.xml`, `assets/`, anything not produced by SvelteKit) into the SvelteKit static input dir `./static/`. SvelteKit copies `static/` into `build/` during `vite build`, so the deployed `build/` ends up with the same files at the same paths.
- **For pages** that today live as `deploy-site/<dir>/index.html` but are produced by SvelteKit as flat `<dir>.html` in `build/` (e.g. `chess-lore.html` vs `chess-lore/index.html`): **do not auto-change `trailingSlash`.** Existing SEO direction is canonical URLs without trailing slash. Apply phase MUST first verify whether Cloudflare Workers + Wrangler assets serve the current `adapter-static` flat output for no-trailing-slash routes (`/chess-lore`, `/chessboard`) correctly. **If direct `./build` deployment cannot serve current route URLs correctly, stop and ask for maintainer decision** between Wrangler routing/config tweaks, redirects, or a deliberate `trailingSlash` change. This is a routing/SEO decision, not a mechanical deploy-output fix.
- **No staging script.** No `release:stage-deploy`. The release workflow runs `npm run build:full --prefix site` (when invoking the wrappers from workflow root) or `npm run build:full` (when invoking from `./site`), then `cloudflare/wrangler-action@v4` deploys the SvelteKit build output per the new `wrangler.jsonc`.

After the migration, `./deploy-site/` is no longer referenced anywhere in the deployment path. Apply phase deletes its tree from git (or leaves only items that are demonstrably still required and not produced by `vite build`; default expectation is full removal).

The apply phase produces:
- modified `wrangler.jsonc` (`assets.directory: ./build`),
- new files under `./site/static/` (the migrated static assets),
- adjusted SvelteKit page configs where pre-rendered HTML must land in a directory shape,
- removed `./site/deploy-site/` content,
and validates locally with `npx wrangler deploy --dry-run` from `./site/` to confirm Wrangler resolves `./build/` and the file set matches the prior deployment surface.

### 8. Playwright setup

Rely on `npm run test` as-is (it calls `playwright install` via `test:e2e`). The kt-workflows `npm-run-script@main` already includes `~/.cache/ms-playwright` in `cache-additional-path` by default, so the Playwright browser binaries are cached under the same node_modules cache key — `playwright install` is a no-op on cache hits without any extra workflow steps.

### 9. Cloudflare deployment target and secrets

`wrangler.jsonc` declares a Cloudflare Workers project; after Decision 7 it declares `assets.directory: ./build` (relative to the site directory). The deploy step uses **`cloudflare/wrangler-action@v4`** (the official Cloudflare action) with:

- `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}`
- `accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`
- `command: deploy`
- `workingDirectory: ./site` (camelCase per the action's input contract; the action then resolves `assets.directory: ./build` relative to that working directory, i.e. `./site/build`)

Required **secrets** (not vars):
- `CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit + Account Settings: Read)
- `CLOUDFLARE_ACCOUNT_ID`

No `CLOUDFLARE_PROJECT_NAME` needed (Workers project name is in `wrangler.jsonc`). Secrets are referenced **only** in the deploy step of `release.yml` and are gated by `if: ${{ steps.changesets.outputs.published == 'true' }}` (the `published` output from `changesets/action@v1`).

### 10. Branch and event triggers

- `ci.yml`: `push` to `main` and `contribution`; `pull_request:` (any branch).
- `codeql.yml`: `push` to `main`, `pull_request:`, weekly `schedule`.
- `auto-merge.yml`: `pull_request`.
- `auto-release.yml`: monthly `schedule` + `workflow_dispatch`.
- `contribution-update.yml`: `push` to `main`.
- `contribution-reset.yml`: `pull_request: { types: [closed], branches: [main] }`.
- `release.yml`: `workflow_run` for `CI` completed on `main` + `workflow_dispatch`. Gating uses dual-event `if:` (Decision 4) so `workflow_dispatch` is not stripped by an absent `workflow_run` payload.

Concurrency group on every workflow: `${{ github.repository }}-${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true`.

### 11. Node version strategy

`DEFAULT_MATRIX_NODE_VERSION: '["22", "24"]'`, override via `vars.MATRIX_NODE_VERSION`. Same as chessboard. The `release.yml` uses a single Node `["24"]` since release builds don't need matrix coverage.

### 12. Aggregate "required" jobs

`required-main` depends on `check` and `test`. `required-contribution` depends on `check` and `test`. (Chessboard's `required-main` also depends on `sonar`; we drop that.)

### 13. Changeset configuration

`.changeset/config.json` contents:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [],
  "privatePackages": {
    "version": true,
    "tag": true
  }
}
```

Differences from chessboard's config: `access: "restricted"` (cosmetic for a never-published package; matches Changesets' guidance for privates), and explicit `privatePackages.version`/`tag`. Without `privatePackages.tag: true`, `changeset publish` would not emit the `🦋  New tag` line for the private site package, and `changesets/action@v1` would not create the GitHub Release.

`.changeset/README.md` is a single line pointing at `https://github.com/changesets/changesets`.

### 14. `package.json` script additions

- `changeset:version`: `changeset version && npm install && npm run format && git add --all` (matches chessboard's pattern; the `npm install` + format + add ensures the version PR has a coherent lockfile and formatted CHANGELOG).
- `changeset:publish`: `changeset publish` (vanilla; for the private site package it skips npm publish but emits the tag line).
- *(No `release:stage-deploy` script. Decision 7 rejects deploy-staging scripts.)*

### 15. Caches and artifacts

Inherit kt-workflows cache behavior:
- `actions/setup-node` via `setup-node-minmax`: `cache: npm` keyed on `cache-dependency-path` (here, both `site/package-lock.json` and `chessboard/package-lock.json`).
- `actions/cache@v5` for `**/node_modules` + `cache-additional-path` (which includes `~/.cache/ms-playwright`).

No SvelteKit build artifact upload from `ci.yml` (validation-only). `release.yml` does its own clean build before deploy. No coverage artifact upload.

### 16. Repo and org guard

Every workflow that has secrets or write effects guards with `if: github.repository == 'mirasen-io/<site-repo-slug>'`. The actual slug is confirmed in apply phase task 1.1.

## Risks / Trade-offs

- **kt-workflows wrappers used for CI/validation only** — `npm-ci-check@main` and `npm-ci-test@main` (with `checkout: false`) drive lint/check/build/test. `npm-release@main` is intentionally not used in `release.yml` for semantic clarity (Decision 4.1) — the action is technically capable but advertises an npm-centric flow that doesn't match this private site. → No remaining blockers; `release.yml` invokes `changesets/action@v1` directly.
- **Direct `changesets/action@v1` release driver** — `release.yml` calls `changesets/action@v1` with `cwd: site`, `createGithubReleases: true`, and the same App-token + sibling-checkout pattern chessboard uses. → Mitigates the "release flow advertises npm semantics" concern by removing the npm-release wrapper from this site's deploy path entirely.
- **Sibling checkout layout** must be honored in every workflow that runs site validation → Decision 1 + Decision 2.
- **`npm ci` against a `file:` dependency** — npm installs `file:` deps with `npm ci` as long as the target directory exists with a coherent tree. Chessboard's `dist/` must exist before site install. → Mitigated by always running chessboard's `npm ci` + `npm run build` first.
- **Playwright system deps on Ubuntu runners** — Chromium headless works on `ubuntu-latest` without `--with-deps`. → Document, not mitigate now.
- **Cloudflare secrets unavailable to fork PRs** — by GitHub policy, secrets are stripped from `pull_request` from forks. Release flow is gated to repo + workflow_run on main + dispatch. → Mitigated.
- **No npm publish, ever** — `release.yml` calls `changesets/action@v1` directly (not via `kt-workflows/actions/npm-release@main`); `release.yml` declares no `NPM_TOKEN` and contains no npm provenance / trusted publishing setup; `changeset publish` for a private package is a no-op for npm. → Triple-locked.
- **Changesets GitHub Release for private package** depends on `privatePackages.tag: true` + `changesets/action@v1`'s parsing of the `🦋  New tag:` stdout line. This is the documented contract and stable across the action's `v1.x` line. → Mitigated. Fallback if Changesets ever drops the tag-emit for private packages: detect `published == 'false'` after `changesets/action`, then run `gh release create` from the new tag separately. Captured as a verification task.
- **Deploy artifact comes from `./build/` directly** — risk that the static-asset migration (`deploy-site/` → `static/`) misses a file or routing nuance, and the deployed site loses a page or asset that was hand-curated in `deploy-site/`. → Mitigated by an apply-phase diff: enumerate every git-tracked file under `deploy-site/`, ensure the resulting `build/` has an equivalent at the same URL, validate via `npx wrangler deploy --dry-run` and a manual content review before the first real deploy.
- **`workflow_dispatch` on `release.yml`** — chessboard's `if:` references `github.event.workflow_run.event` which is undefined under `workflow_dispatch`, gating manual dispatch out by accident. → Fixed in Decision 4.3 with dual-event `if:`.
- **Contribution branch flow secrets / Apps** — chessboard's contribution flow uses `WORKFLOW_APP_*` and `APPROVE_APP_*`. The site repo must have access to the same Apps. → Apply-phase task 1.3 confirms; if not available, contribution flow is disabled or scaled down.
- **`mirasen-io/chessboard` visibility** — public vs private affects whether the chessboard checkout step needs an App token. → Apply-phase task 1.2.

## Migration Plan

1. Verify the actual repo slug for this site repo (likely `mirasen-io/cloudflare-site` or `mirasen-io/main-website`).
2. Verify whether `mirasen-io/chessboard` is public or private.
3. Confirm GitHub Apps (`WORKFLOW_APP_*`, `APPROVE_APP_*`) are installed on this repo, and that `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` exist.
4. Decide deploy-staging path (Decision 7 A vs B) by reading current files and committing to one.
5. In the apply phase: add `.changeset/`, scripts, deploy-staging mechanism, and the seven workflow files. Open as a single PR.
6. After merge: configure branch protection on `main` (require `required-main`) and `contribution` (require `required-contribution`). Add the secrets.
7. Trigger one manual `workflow_dispatch` of `release.yml` on a no-op changeset, confirming: (a) Changesets opens/updates the Version PR, (b) merging the Version PR produces a Git tag + GitHub Release without any `npm publish` invocation, (c) `wrangler deploy` runs only after a real release.
8. Rollback: revert the workflow PR. Wrangler deploy is independently revertable via Cloudflare dashboard rollback or by deploying a previous tag.

## Open Questions

- Exact repo slug for branch/repo guards (`mirasen-io/<?>`) — confirm in apply phase.
- Visibility of `mirasen-io/chessboard` — affects whether the chessboard checkout needs a token.
- Decision 7 A vs B for deploy staging — pick one based on actual file inspection in apply phase.
- Whether `auto-release.yml` should run for this private site at all — port for shape parity now, but defer the keep/skip decision to the maintainer review.
- Whether to pin `kt-workflows/actions/*` to a SHA rather than `@main` for hardening. Keep `@main` for parity with chessboard; flag as a follow-up.
- *(closed)* Whether to use `kt-workflows/actions/npm-release@main` for the release flow. **Resolved**: not used. The wrapper is technically capable (Decision 4.1) but is semantically tied to npm publishing, which does not match this private site. `release.yml` invokes `changesets/action@v1` directly.
- Whether to delete `./deploy-site/` from git wholesale once the migration to `./static/` and `./build/` is verified, vs. leaving an empty placeholder. Default: full removal.
