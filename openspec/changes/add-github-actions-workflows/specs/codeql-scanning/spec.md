## ADDED Requirements

### Requirement: CodeQL scanning on push, PR, and weekly schedule

The repository SHALL provide a `codeql.yml` workflow that runs CodeQL analysis for the `actions` and `javascript-typescript` languages on push to `main`, on pull requests, and on a weekly cron schedule.

#### Scenario: Push to main triggers scan
- **WHEN** a commit is pushed to `main`
- **THEN** `codeql.yml` runs CodeQL `init` and `analyze` for `actions` and `javascript-typescript`

#### Scenario: Pull request triggers scan
- **WHEN** a pull request is opened or updated
- **THEN** `codeql.yml` runs CodeQL analysis on the PR head

#### Scenario: Weekly scheduled scan
- **WHEN** the configured weekly cron fires
- **THEN** `codeql.yml` runs CodeQL analysis on the default branch

### Requirement: CodeQL build mode

The CodeQL job SHALL use `build-mode: none` for `javascript-typescript` and SHALL NOT require the chessboard checkout, since CodeQL analyzes source without building.

#### Scenario: No chessboard checkout in CodeQL
- **WHEN** `codeql.yml` runs
- **THEN** it checks out only this repository and does not check out `mirasen-io/chessboard`

### Requirement: CodeQL permissions

The CodeQL job SHALL declare `permissions: { security-events: write, contents: read }` so it can upload SARIF results.

#### Scenario: Results uploaded to Security tab
- **WHEN** CodeQL analysis completes successfully
- **THEN** results appear under the repository's Security → Code scanning view
