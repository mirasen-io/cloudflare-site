## ADDED Requirements

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
