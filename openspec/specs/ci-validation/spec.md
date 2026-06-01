# ci-validation Specification

## Purpose
TBD - created by archiving change add-github-actions-workflows. Update Purpose after archive.
## Requirements
### Requirement: PR and push validation pipeline

The repository SHALL provide a `ci.yml` workflow that runs lint, type-check, build, and unit + e2e tests on every pull request and on every push to `main` and `contribution`. The pipeline SHALL use a single-repo checkout layout — only this repository is checked out, at the workflow root (no `path:` argument, no sibling checkout). `@mirasen/chessboard` SHALL be installed from the npm registry as declared in `package.json`. The `install-script` and `run-script` inputs to the kt-workflows wrappers SHALL invoke `npm ci`, `npm run build`, etc. without `--prefix` arguments. The `package.json` dependency `"@mirasen/chessboard"` SHALL declare a registry semver range (e.g. `"^1.3.2"`); `file:`, `link:`, and other local-path strategies SHALL NOT be used for this dependency.

#### Scenario: Pull request validation

- **WHEN** a pull request is opened or updated against any branch
- **THEN** `ci.yml` runs `check-execution`, `config`, `check`, and `test` jobs
- **AND** `check` runs `npm run lint`, `npm run check`, and `npm run build` from the workflow root
- **AND** `test` runs `npm run test` from the workflow root across the configured Node matrix
- **AND** the `required-main` aggregate job reports success when all required jobs pass

#### Scenario: Push to main

- **WHEN** a commit is pushed to `main`
- **THEN** `ci.yml` runs the same `check`/`test` jobs and reports `required-main`

#### Scenario: Push to contribution branch with open PR to main

- **WHEN** a commit is pushed to `contribution` and an open PR `contribution → main` exists
- **THEN** `check-execution` outputs `should-run=false` and `check`/`test` are skipped to avoid duplicate runs

#### Scenario: Push to contribution identical to main

- **WHEN** a commit is pushed to `contribution` whose tree is identical to `origin/main`
- **THEN** `check-execution` outputs `should-run=false` and `check`/`test` are skipped

### Requirement: Node matrix configuration

The CI workflow SHALL expose a `MATRIX_NODE_VERSION` repository variable override with default `["22", "24"]`, and a `CACHE_RESET` override with default `false`.

#### Scenario: Default Node matrix

- **WHEN** `vars.MATRIX_NODE_VERSION` is not set
- **THEN** the `test` job runs on Node 22 and Node 24

#### Scenario: Override Node matrix

- **WHEN** `vars.MATRIX_NODE_VERSION` is set to a JSON array such as `["24"]`
- **THEN** the `test` job runs only on the listed versions

### Requirement: Stable required-\* aggregate jobs

The CI workflow SHALL emit `required-main` and `required-contribution` aggregate jobs whose names remain stable across matrix changes, so branch protection can reference them without churn.

#### Scenario: Branch protection on main

- **WHEN** the `main` branch protection requires `required-main`
- **THEN** the rule is satisfied iff `check` and `test` succeed

#### Scenario: Branch protection on contribution

- **WHEN** the `contribution` branch protection requires `required-contribution`
- **THEN** the rule is satisfied iff `check` and `test` succeed

### Requirement: Concurrency cancellation

Each workflow SHALL cancel in-progress runs on new commits to the same ref via `concurrency.group: ${{ github.repository }}-${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true`.

#### Scenario: New commit cancels prior run

- **WHEN** a second commit is pushed to the same PR or branch while a prior run is in progress
- **THEN** the prior run is cancelled and the new run starts

### Requirement: kt-workflows wrappers used for install/build/test

The `check` job SHALL use `kt-workflows/actions/npm-ci-check@main` with `checkout: false` and the `test` job SHALL use `kt-workflows/actions/npm-ci-test@main` with `checkout: false`. A single workflow-level `actions/checkout` of this repository (without a `path:` argument) SHALL precede the wrapper invocation. **Dependency installation SHALL be expressed inside the wrapper's `install-script` input** (not as a separate run step) so the wrapper's package-lock cache key includes this repository's lockfile. The `install-script` and `run-script` SHALL NOT use `--prefix` arguments; the wrapper runs from the workflow root and `package.json` is at the workflow root.

#### Scenario: kt-workflows wrappers drive validation

- **WHEN** `ci.yml` runs the `check` or `test` job
- **THEN** the job invokes `kt-workflows/actions/npm-ci-check@main` (for `check`) or `npm-ci-test@main` (for `test`) with `checkout: false`
- **AND** the `install-script` is `npm ci` and the `run-script` invokes `npm run build`, `npm run lint`, `npm run check`, or `npm run test` without `--prefix`
- **AND** there is no `actions/checkout` step targeting `mirasen-io/chessboard` and no `actions/checkout` step uses a `path:` argument

### Requirement: Playwright browser cache via kt-workflows wrapper

The `test` job SHALL inherit the kt-workflows wrapper's `cache-additional-path` default which includes `~/.cache/ms-playwright`, so `playwright install` (called by `npm run test`) is a no-op on cache hits without a separate `actions/cache` step.

#### Scenario: Cache hit

- **WHEN** the npm cache key is unchanged from a prior successful run
- **THEN** `~/.cache/ms-playwright` is restored along with `node_modules` and `playwright install` does not re-download browsers

### Requirement: No npm publish in validation

The `ci.yml` workflow SHALL NOT invoke `npm publish` and SHALL NOT reference `NPM_TOKEN`.

#### Scenario: Workflow does not publish

- **WHEN** `ci.yml` is reviewed
- **THEN** it contains no `npm publish` invocation and no `NPM_TOKEN` reference

