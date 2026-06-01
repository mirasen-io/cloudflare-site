# dependabot-automation Specification

## Purpose
TBD - created by archiving change add-github-actions-workflows. Update Purpose after archive.
## Requirements
### Requirement: Dependabot auto-merge on PRs

The repository SHALL provide an `auto-merge.yml` workflow that, on `pull_request` events authored by `dependabot[bot]`, uses `kt-workflows/actions/dependabot-auto-merge@main` with the `WORKFLOW_APP_*` and `APPROVE_APP_*` GitHub App secrets to approve and auto-merge eligible Dependabot PRs.

#### Scenario: Dependabot PR is auto-merged

- **WHEN** Dependabot opens a PR that satisfies merge requirements
- **THEN** `auto-merge.yml` approves the PR and enables auto-merge

#### Scenario: Non-Dependabot PR is ignored

- **WHEN** a PR is opened by a human or another bot
- **THEN** `auto-merge.yml` does not run merge logic

### Requirement: Scheduled Dependabot auto-release

The repository SHALL provide an `auto-release.yml` workflow that runs on a monthly cron and on `workflow_dispatch`, gated to the production repository, using `kt-workflows/actions/dependabot-auto-release@main` with the same App secrets.

#### Scenario: Monthly run

- **WHEN** the configured monthly cron fires
- **THEN** `auto-release.yml` invokes the `dependabot-auto-release` action

#### Scenario: Manual dispatch

- **WHEN** a maintainer triggers `workflow_dispatch`
- **THEN** `auto-release.yml` runs the same action

#### Scenario: Forks are excluded

- **WHEN** the workflow runs in a fork
- **THEN** the repo guard skips the job

### Requirement: No npm-token dependency in dependabot automation

Neither `auto-merge.yml` nor `auto-release.yml` SHALL reference `NPM_TOKEN`.

#### Scenario: Workflows do not reference NPM_TOKEN

- **WHEN** `auto-merge.yml` or `auto-release.yml` is reviewed
- **THEN** no `NPM_TOKEN` reference appears

### Requirement: `@mirasen/chessboard` is not on the Dependabot ignore list

`.github/dependabot.yml` SHALL NOT contain a `dependency-name: '@mirasen/chessboard'` entry under any `ignore` block. Dependabot SHALL be free to open update PRs for `@mirasen/chessboard` like any other npm dependency, picked up by the existing `minor-and-patch` and `major` groups and auto-merged by `auto-merge.yml` when eligible.

#### Scenario: Dependabot opens an update PR for @mirasen/chessboard

- **WHEN** a new version of `@mirasen/chessboard` is published to the npm registry that satisfies the semver range in `package.json`
- **THEN** Dependabot opens or updates a PR bumping the version
- **AND** the PR is grouped under `minor-and-patch` (for minor/patch) or `major` (for major) per the existing config
- **AND** `auto-merge.yml` evaluates the PR like any other Dependabot PR

#### Scenario: Ignore list reviewed

- **WHEN** `.github/dependabot.yml` is reviewed
- **THEN** the `ignore` block contains no entry whose `dependency-name` is `@mirasen/chessboard`

