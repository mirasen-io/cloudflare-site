## MODIFIED Requirements

### Requirement: Release single-repo checkout, build via `npm run build`, deploy `./build/` directly

The release workflow SHALL use a single-repo checkout layout — only this repository is checked out, at the workflow root (no `path:` argument) — and SHALL install dependencies through the kt-workflows wrapper's `install-script` input (not as a separate run step). The `install-script` and `run-script` SHALL NOT use `--prefix` arguments. The build SHALL run via `npm run build`. `@mirasen/chessboard` SHALL be installed from the npm registry as declared in `package.json`. The release workflow SHALL deploy the resulting SvelteKit build output directly via `cloudflare/wrangler-action@v4` without a `workingDirectory` argument; `wrangler.jsonc` SHALL declare `assets.directory: ./build` (relative to the workflow root, where `package.json` and the build output now live), and `./deploy-site/` SHALL no longer be on the deployment path. No intermediate staging script (e.g. `release:stage-deploy`) SHALL be introduced.

#### Scenario: Install order

- **WHEN** `release.yml` runs
- **THEN** it executes `npm ci` from the workflow root before any build step
- **AND** there is no `actions/checkout` step targeting `mirasen-io/chessboard` and no `npm ci --prefix chessboard` step
- **AND** the single `actions/checkout` step does not use a `path:` argument

#### Scenario: Build via npm run build

- **WHEN** the build phase runs
- **THEN** it invokes `npm run build` from the workflow root and produces `./build/`
- **AND** the workflow does not invoke `npm run build:full` or `npm run build:chessboard`

#### Scenario: Deploy from `./build/`, not `./deploy-site/`

- **WHEN** the deploy step runs
- **THEN** `wrangler.jsonc#assets.directory` is `./build`
- **AND** `cloudflare/wrangler-action@v4` deploys what `vite build` produced from the workflow root — no `workingDirectory` argument is set
- **AND** no step copies, syncs, or otherwise stages files into `./deploy-site/`

### Requirement: Release uses `changesets/action@v1` directly (not `npm-release@main`)

`release.yml` SHALL invoke `changesets/action@v1` directly with `createGithubReleases: true` and SHALL NOT pass a `cwd` argument (the action runs at the workflow root where `package.json` is checked out). The release flow SHALL NOT use `kt-workflows/actions/npm-release@main` — the wrapper is technically capable (it supports `checkout: false`, `working-directory`, and a `published` output) but is semantically tied to npm publishing, which does not match this private, non-publishing site. Cloudflare deploy SHALL be gated on `steps.changesets.outputs.published == 'true'`. Workflow-root install + build SHALL be driven by `kt-workflows/actions/npm-run-script@main` (with `checkout: false` implied by the prior workflow-level checkout step), not by `npm-release@main`.

#### Scenario: Direct changesets/action invocation

- **WHEN** `release.yml` runs
- **THEN** the `changesets/action@v1` step is invoked directly (not through `npm-release@main`) with `version: npm run changeset:version`, `publish: npm run changeset:publish`, and `createGithubReleases: true`
- **AND** the step does not set a `cwd` argument
- **AND** the deploy step runs only if `steps.changesets.outputs.published == 'true'`

#### Scenario: No npm-release wrapper in release.yml

- **WHEN** `release.yml` is reviewed
- **THEN** there is no `kt-workflows/actions/npm-release@main` step
- **AND** there is no `steps.release.outputs.publish` or `steps.release.outputs.published` reference (no such step id exists in this design)

### Requirement: Cloudflare deploy via official action

The deploy step SHALL use `cloudflare/wrangler-action@v4` with `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}`, `accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`, and `command: deploy`. The action SHALL NOT set `workingDirectory` (the action defaults to the workflow root, where `wrangler.jsonc` lives after the single-repo checkout). `wrangler.jsonc` SHALL declare `assets.directory: ./build` relative to the workflow root. The deploy step SHALL be gated on `steps.changesets.outputs.published == 'true'`.

#### Scenario: Deploy uses official action

- **WHEN** the deploy step runs
- **THEN** it is `cloudflare/wrangler-action@v4` with `command: deploy`
- **AND** it does not set a `workingDirectory` argument

#### Scenario: Deploy gated on publish

- **WHEN** Changesets reports no publish (no changesets pending, or publish phase did not produce a tag)
- **THEN** the Cloudflare deploy step does not run
