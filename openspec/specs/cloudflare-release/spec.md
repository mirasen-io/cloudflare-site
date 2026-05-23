# cloudflare-release Specification

## Purpose
TBD - created by archiving change add-github-actions-workflows. Update Purpose after archive.
## Requirements
### Requirement: Changeset-driven release for a private package, no npm publish

The repository SHALL provide a `release.yml` workflow that uses Changesets to version `package.json`, update `CHANGELOG.md`, open/maintain a "Version Packages" PR on `main`, create a Git tag and a GitHub Release on merge, and deploy the built site to Cloudflare via Wrangler. The workflow SHALL NOT invoke `npm publish` and SHALL NOT reference `NPM_TOKEN`. The release flow SHALL rely on the documented Changesets behavior for private packages — `privatePackages.version: true` and `privatePackages.tag: true` — so that `changeset publish` skips npm but still emits the tag line that `changesets/action@v1` parses to create a GitHub Release.

#### Scenario: Version Packages PR maintained

- **WHEN** there are unreleased `.changeset/*.md` entries on `main`
- **THEN** `release.yml` runs `changesets/action@v1` which opens or updates the "Version Packages" PR

#### Scenario: GitHub Release on Version PR merge

- **WHEN** the "Version Packages" PR is merged to `main` and CI succeeds
- **THEN** `release.yml` runs the publish phase
- **AND** `changeset publish` skips `npm publish` (because the package is private) and emits a `🦋  New tag:` line for the new version
- **AND** `changesets/action@v1` creates a Git tag and a GitHub Release for `@mirasen/main-website` at that version
- **AND** the workflow does not invoke `npm publish`

#### Scenario: Cloudflare deploy after release

- **WHEN** `changesets/action` reports `published == 'true'`
- **THEN** `release.yml` runs the `cloudflare/wrangler-action@v4` step with `command: deploy` and `workingDirectory: ./site`, using `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}` and `accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`

#### Scenario: No changesets pending

- **WHEN** there are no pending changeset entries
- **THEN** `release.yml` does not create a tag, GitHub Release, or Cloudflare deployment

### Requirement: Release sibling-checkout, build via `build:full`, deploy `./build/` directly

The release workflow SHALL use the sibling-checkout layout (`./site` + `./chessboard`), install both repos through the kt-workflows wrapper's `install-script` input (not as a separate run step) using prefixes consistent with the wrapper's chosen working directory, build via `npm run build:full` (with `--prefix site` if invoked from workflow root), and deploy the resulting SvelteKit build output directly via `cloudflare/wrangler-action@v4`. No intermediate staging script (e.g. `release:stage-deploy`) SHALL be introduced. `wrangler.jsonc` SHALL declare `assets.directory: ./build` (relative to the site directory), and `./deploy-site/` SHALL no longer be on the deployment path.

#### Scenario: Install order

- **WHEN** `release.yml` runs
- **THEN** it executes `npm ci --prefix chessboard` followed by `npm ci --prefix site` from the workspace root before any build step

#### Scenario: Build via build:full

- **WHEN** the build phase runs
- **THEN** it invokes `npm run build:full --prefix site` (which runs `build:chessboard`, `npm install`, then `npm run build`) and produces `./site/build/`

#### Scenario: Deploy from `./build/`, not `./deploy-site/`

- **WHEN** the deploy step runs
- **THEN** `wrangler.jsonc#assets.directory` is `./build`
- **AND** `cloudflare/wrangler-action@v4` deploys what `vite build` produced
- **AND** no step copies, syncs, or otherwise stages files into `./deploy-site/`

### Requirement: Release uses `changesets/action@v1` directly (not `npm-release@main`)

`release.yml` SHALL invoke `changesets/action@v1` directly with `cwd: site` and `createGithubReleases: true`. The release flow SHALL NOT use `kt-workflows/actions/npm-release@main` — the wrapper is technically capable (it supports `checkout: false`, `working-directory`, and a `published` output) but is semantically tied to npm publishing, which does not match this private, non-publishing site. Cloudflare deploy SHALL be gated on `steps.changesets.outputs.published == 'true'`. Workflow-root install + build SHALL be driven by `kt-workflows/actions/npm-ci-check@main` (with `checkout: false`), not by `npm-release@main`.

#### Scenario: Direct changesets/action invocation

- **WHEN** `release.yml` runs
- **THEN** the `changesets/action@v1` step is invoked directly (not through `npm-release@main`) with `cwd: site`, `version: npm run changeset:version`, `publish: npm run changeset:publish`, and `createGithubReleases: true`
- **AND** the deploy step runs only if `steps.changesets.outputs.published == 'true'`

#### Scenario: No npm-release wrapper in release.yml

- **WHEN** `release.yml` is reviewed
- **THEN** there is no `kt-workflows/actions/npm-release@main` step
- **AND** there is no `steps.release.outputs.publish` or `steps.release.outputs.published` reference (no such step id exists in this design)

### Requirement: Cloudflare deploy via official action

The deploy step SHALL use `cloudflare/wrangler-action@v4` with `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}`, `accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`, `command: deploy`, and `workingDirectory: ./site` (camelCase). `wrangler.jsonc` SHALL declare `assets.directory: ./build` relative to the site directory. The deploy step SHALL be gated on `steps.changesets.outputs.published == 'true'`.

#### Scenario: Deploy uses official action

- **WHEN** the deploy step runs
- **THEN** it is `cloudflare/wrangler-action@v4` with `command: deploy`

#### Scenario: Deploy gated on publish

- **WHEN** Changesets reports no publish (no changesets pending, or publish phase did not produce a tag)
- **THEN** the Cloudflare deploy step does not run

### Requirement: Release workflow event gating

The release workflow SHALL run only on the production repository, AND only when triggered by either a successful `workflow_run` for `CI` from a `push` to `main` or by `workflow_dispatch`. The `if:` condition SHALL handle both event types without referencing `github.event.workflow_run` fields when the event is `workflow_dispatch`.

#### Scenario: Trigger on successful CI on main

- **WHEN** the `CI` workflow completes successfully on `main` after a `push` event
- **THEN** `release.yml` runs

#### Scenario: Manual dispatch

- **WHEN** a maintainer triggers `workflow_dispatch` on `release.yml`
- **THEN** the workflow runs without being gated out by an absent `workflow_run` payload

#### Scenario: Failed CI does not trigger release

- **WHEN** the `CI` workflow completes with a non-success conclusion on `main`
- **THEN** `release.yml` does not run the `release` job

#### Scenario: Fork is excluded

- **WHEN** `release.yml` is dispatched in a fork
- **THEN** the `if: github.repository == 'mirasen-io/<site-slug>'` guard skips the job

### Requirement: Cloudflare secret hygiene

`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` SHALL be referenced only in the deploy step of `release.yml` and SHALL NOT be referenced in `ci.yml`, `codeql.yml`, `auto-merge.yml`, `auto-release.yml`, `contribution-update.yml`, or `contribution-reset.yml`.

#### Scenario: Secrets isolated to release deploy

- **WHEN** any non-release workflow is reviewed
- **THEN** it contains no reference to `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ACCOUNT_ID`

### Requirement: Changeset configuration for a private package

The repository SHALL include a `.changeset/config.json` based on the chessboard configuration (changelog generator `@changesets/cli/changelog`, `commit: false`, `baseBranch: "main"`, `updateInternalDependencies: "patch"`, empty `fixed`/`linked`/`ignore`) AND SHALL set `privatePackages: { "version": true, "tag": true }` so that the private site package is versioned and tagged. The repository SHALL include `@changesets/cli` as a `devDependency`.

#### Scenario: Config drives release behavior

- **WHEN** `release.yml` runs `changesets/action@v1`
- **THEN** the action reads `.changeset/config.json` and applies its settings to the version PR, changelog, and tagging

#### Scenario: Private package gets versioned and tagged

- **WHEN** a changeset is applied to the private site package and the Version PR is merged
- **THEN** `package.json#version` is bumped, a Git tag is created, and `npm publish` is not invoked

### Requirement: Site package release scripts

`package.json` SHALL define the scripts the release workflow calls:

- `changeset:version` running `changeset version && npm install && npm run format && git add --all`.
- `changeset:publish` running `changeset publish` (no custom JSON-line shim is required; the documented Changesets behavior with `privatePackages.tag: true` produces the tag-emit line that `changesets/action@v1` parses).

`package.json` SHALL NOT introduce any deploy-staging script (e.g. `release:stage-deploy`). The deploy step deploys `./site/build/` directly.

#### Scenario: Publish script does not run npm publish

- **WHEN** `changeset:publish` runs against the private site package
- **THEN** it does not invoke `npm publish` and does not require `NPM_TOKEN`

#### Scenario: Publish script signals release to changesets/action

- **WHEN** `changeset:publish` runs after a `changeset:version`
- **THEN** it emits the `🦋  New tag: @mirasen/main-website@<version>` line on stdout, causing `changesets/action@v1` to set `published=true` and create a GitHub Release

#### Scenario: No staging script

- **WHEN** `package.json` is reviewed
- **THEN** there is no `release:stage-deploy` (or equivalent) script and no workflow step copies build output into `./deploy-site/`

