## ADDED Requirements

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
