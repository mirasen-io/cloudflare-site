# contribution-branch-flow Specification

## Purpose
TBD - created by archiving change add-github-actions-workflows. Update Purpose after archive.
## Requirements
### Requirement: Update contribution branch from main

The repository SHALL provide a `contribution-update.yml` workflow that, on push to `main`, merges `origin/main` into `contribution` (creating `contribution` from `main` if it does not exist) and pushes the result, using a GitHub App token from `kt-workflows/actions/create-github-app-token@main`.

#### Scenario: Push to main updates contribution

- **WHEN** a commit lands on `main` that is not the merge commit of a `contribution → main` PR
- **THEN** `contribution-update.yml` merges `origin/main` into `contribution` and pushes

#### Scenario: Skip when push originated from contribution merge

- **WHEN** the push to `main` is the merge commit of a `contribution → main` PR
- **THEN** `contribution-update.yml` detects this via `kt-workflows/actions/get-associated-pr@main` and skips the merge

#### Scenario: Forks are excluded

- **WHEN** the workflow runs in a fork
- **THEN** the repo guard skips the job

### Requirement: Reset contribution after a contribution → main merge

The repository SHALL provide a `contribution-reset.yml` workflow that, when a PR from `contribution` to `main` is merged (squash), hard-resets `contribution` to `origin/main` and force-pushes with `--force-with-lease`.

#### Scenario: Squash-merge of contribution PR

- **WHEN** a PR with head `contribution` and base `main` is closed with `merged == true`
- **THEN** `contribution-reset.yml` resets `contribution` to `origin/main` and force-pushes

#### Scenario: Closed but not merged

- **WHEN** a `contribution → main` PR is closed without merging
- **THEN** the reset job does not run

### Requirement: CI duplicate-run avoidance on contribution branch

The `ci.yml` workflow SHALL include a `check-execution` job that skips downstream jobs when:

1. a push lands on `contribution` while an open PR `contribution → main` exists, or
2. a push to `contribution` produces a tree identical to `origin/main`.

#### Scenario: Open PR causes skip

- **WHEN** a push to `contribution` occurs and `gh pr list --head contribution --base main --state open` returns at least one PR
- **THEN** `check-execution` outputs `should-run=false` and downstream jobs are skipped

#### Scenario: Identical tree causes skip

- **WHEN** a push to `contribution` results in a tree SHA equal to `origin/main`'s tree SHA
- **THEN** `check-execution` outputs `should-run=false` and downstream jobs are skipped

