## ADDED Requirements

### Requirement: PR and push validation pipeline

The repository SHALL provide a `ci.yml` workflow that runs lint, type-check, build, and unit + e2e tests on every pull request and on every push to `main` and `contribution`. The pipeline SHALL use a sibling-checkout layout with this repository at `./site` and `mirasen-io/chessboard` at `./chessboard`. The `check` and `test` jobs MAY run from the workflow root or from `./site`, but the `install-script` and `run-script` prefixes MUST match the chosen working directory: from workflow root use `npm ci --prefix chessboard` / `npm ci --prefix site` / `npm run build:full --prefix site` etc.; from `./site` use `npm ci --prefix ../chessboard` / `npm ci` / `npm run build:full` etc. The `"@mirasen/chessboard": "file:../chessboard"` local dependency strategy SHALL be preserved.

#### Scenario: Pull request validation
- **WHEN** a pull request is opened or updated against any branch
- **THEN** `ci.yml` runs `check-execution`, `config`, `check`, and `test` jobs
- **AND** `check` runs `npm run lint`, `npm run check`, and `npm run build` from `./site`
- **AND** `test` runs `npm run test` from `./site` across the configured Node matrix
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

### Requirement: Sibling-checkout layout

The CI jobs that run site commands SHALL check out this repository to `./site` and `mirasen-io/chessboard` to `./chessboard`, install both repos through the kt-workflows wrapper's `install-script` input, build the site via `npm run build:full` (which itself builds `../chessboard`, reconciles the file: link, and builds the site), and never invoke `npm publish`.

#### Scenario: Two-repo checkout and install-script
- **WHEN** a CI job runs site validation
- **THEN** it checks out the site to `./site` and chessboard to `./chessboard`
- **AND** the kt-workflows wrapper's `install-script` runs `npm ci --prefix chessboard` and `npm ci --prefix site` (or the `./site`-relative equivalents `npm ci --prefix ../chessboard` and `npm ci`, matching the wrapper's chosen working directory)
- **AND** the wrapper's `run-script` calls `npm run build:full --prefix site` (or `npm run build:full` if the wrapper runs from `./site`), which is responsible for building `../chessboard` before the site build runs

#### Scenario: Local file dependency preserved
- **WHEN** the site installs in CI
- **THEN** `package.json` still declares `"@mirasen/chessboard": "file:../chessboard"`
- **AND** the workflow does not rewrite the dependency to a published version

### Requirement: Node matrix configuration

The CI workflow SHALL expose a `MATRIX_NODE_VERSION` repository variable override with default `["22", "24"]`, and a `CACHE_RESET` override with default `false`.

#### Scenario: Default Node matrix
- **WHEN** `vars.MATRIX_NODE_VERSION` is not set
- **THEN** the `test` job runs on Node 22 and Node 24

#### Scenario: Override Node matrix
- **WHEN** `vars.MATRIX_NODE_VERSION` is set to a JSON array such as `["24"]`
- **THEN** the `test` job runs only on the listed versions

### Requirement: Stable required-* aggregate jobs

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

The `check` job SHALL use `kt-workflows/actions/npm-ci-check@main` with `checkout: false` and the `test` job SHALL use `kt-workflows/actions/npm-ci-test@main` with `checkout: false`. Workflow-level checkouts of `./site` and `./chessboard` SHALL precede the wrapper invocation. **Dependency installation for both repos SHALL be expressed inside the wrapper's `install-script` input** (not as a separate run step) so the wrapper's package-lock cache key includes both lockfiles. The `working-directory` chosen on the wrapper (workflow root or `./site`) MUST match the prefix style used in `install-script` and `run-script`.

#### Scenario: kt-workflows wrappers drive validation
- **WHEN** `ci.yml` runs the `check` or `test` job
- **THEN** the job invokes `kt-workflows/actions/npm-ci-check@main` (for `check`) or `npm-ci-test@main` (for `test`) with `checkout: false`, expressing the chessboard sibling install and build via `install-script` and `run-script`

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
