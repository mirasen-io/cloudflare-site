## MODIFIED Requirements

### Requirement: PR and push validation pipeline

The repository SHALL provide a `ci.yml` workflow that runs lint, type-check, build, and unit + e2e tests on every pull request and on every push to `main` and `contribution`. The pipeline SHALL use a single-repo checkout layout — only this repository is checked out, at the workflow root or at `./site` — and `@mirasen/chessboard` SHALL be installed from the npm registry as declared in `package.json`. The `check` and `test` jobs MAY run from the workflow root or from `./site`, but the `install-script` and `run-script` MUST match the chosen working directory: from workflow root use `npm ci --prefix site` / `npm run build --prefix site` etc.; from `./site` use `npm ci` / `npm run build` etc. The `package.json` dependency `"@mirasen/chessboard"` SHALL declare a registry semver range (e.g. `"^1.3.2"`); `file:`, `link:`, and other local-path strategies SHALL NOT be used for this dependency.

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

### Requirement: kt-workflows wrappers used for install/build/test

The `check` job SHALL use `kt-workflows/actions/npm-ci-check@main` with `checkout: false` and the `test` job SHALL use `kt-workflows/actions/npm-ci-test@main` with `checkout: false`. A workflow-level checkout of this repository SHALL precede the wrapper invocation; no second `actions/checkout` of `mirasen-io/chessboard` is performed. **Dependency installation SHALL be expressed inside the wrapper's `install-script` input** (not as a separate run step) so the wrapper's package-lock cache key includes this repository's lockfile. The `working-directory` chosen on the wrapper (workflow root or `./site`) MUST match the prefix style used in `install-script` and `run-script`.

#### Scenario: kt-workflows wrappers drive validation

- **WHEN** `ci.yml` runs the `check` or `test` job
- **THEN** the job invokes `kt-workflows/actions/npm-ci-check@main` (for `check`) or `npm-ci-test@main` (for `test`) with `checkout: false`, expressing the install via `install-script` and the build/test via `run-script`
- **AND** there is no `actions/checkout` step targeting `mirasen-io/chessboard`

## REMOVED Requirements

### Requirement: Sibling-checkout layout

**Reason:** `@mirasen/chessboard` is now consumed from the npm registry via a semver range. The release artifact published to npm already contains the built distribution, so CI no longer needs to check out and build the chessboard source tree alongside the site.

**Migration:** Workflows now do a single `actions/checkout` of this repository, run `npm ci`, and build via `npm run build`. The published `@mirasen/chessboard` tarball replaces the role previously played by the local sibling build. See the modified "PR and push validation pipeline" and "kt-workflows wrappers used for install/build/test" requirements for the new shape.
