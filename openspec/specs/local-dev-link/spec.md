# local-dev-link Specification

## Purpose
TBD - created by archiving change switch-chessboard-to-registry. Update Purpose after archive.
## Requirements
### Requirement: `@mirasen/chessboard` consumed from the npm registry

`package.json` SHALL declare `@mirasen/chessboard` under `dependencies` with a registry semver range (caret range against a published version, e.g. `"^1.3.2"`). `package.json` SHALL NOT use `file:`, `link:`, `workspace:`, or any other local-path or workspace specifier for `@mirasen/chessboard`. `package-lock.json` SHALL resolve `@mirasen/chessboard` to a registry tarball URL (a URL beginning with `https://registry.npmjs.org/`).

#### Scenario: package.json declares a registry range

- **WHEN** `package.json` is reviewed
- **THEN** `dependencies."@mirasen/chessboard"` matches a semver range (`^`, `~`, or pinned version)
- **AND** the value does not begin with `file:`, `link:`, `workspace:`, `git+`, or `http`

#### Scenario: lockfile resolves to registry

- **WHEN** `package-lock.json` is reviewed
- **THEN** the entry for `@mirasen/chessboard` has a `resolved` field beginning with `https://registry.npmjs.org/`

### Requirement: `scripts/npm-link.sh` opt-in local link helper

The repository SHALL provide `scripts/npm-link.sh` that conditionally links locally-developed packages into `node_modules` after `npm install` or `npm ci`. The script SHALL be executable, SHALL declare a hard-coded `LINK_PACKAGES` array at the top listing the exact package names eligible for linking in this project, and SHALL link a package only if all three of the following are true:

1. The package name appears in `LINK_PACKAGES`.
2. The package name is a key of `dependencies` or `devDependencies` in `package.json` (direct dependencies only — no transitive walk).
3. The package is currently registered as a global npm link (`npm ls -g --depth=0 --link=true`).

The script SHALL parse `npm ls -g --link=true` via its JSON output (`--json`) — not via `awk`/`sed` on the human-readable tree — and SHALL parse `package.json` via `jq`. The script SHALL exit `0` without performing any `npm link` if the intersection of the three sets above is empty (this is the safety mechanism on CI runners and any other environment where no global links exist; no separate environment-variable guard is required). When the intersection is non-empty, the script SHALL invoke `npm link "${to_link[@]}"` and SHALL emit a warning recommending the developer ensure linked packages are released and up to date before pushing.

#### Scenario: No global link present

- **WHEN** `scripts/npm-link.sh` runs in an environment where no allowlisted package is globally linked
- **THEN** the script prints a "nothing to link" message and exits `0`
- **AND** the script does not invoke `npm link`

#### Scenario: CI runner with no global links

- **WHEN** `scripts/npm-link.sh` runs on a CI runner where no global npm links are registered
- **THEN** `npm ls -g --link=true` yields an empty set, the triple intersection is empty, and the script exits `0`
- **AND** the script does not invoke `npm link`
- **AND** this safety is provided by the empty intersection alone — the script does not rely on `$CI`, `$NODE_ENV`, or any other environment variable

#### Scenario: Allowlisted package globally linked and declared

- **WHEN** `@mirasen/chessboard` is in `LINK_PACKAGES`, is a direct dependency in `package.json`, and is registered as a global npm link
- **THEN** the script invokes `npm link @mirasen/chessboard`
- **AND** prints a warning advising the developer to ensure the linked package is released before pushing

#### Scenario: Allowlisted package not in direct deps

- **WHEN** a package is in `LINK_PACKAGES` and globally linked, but is NOT listed in `dependencies` or `devDependencies` of `package.json`
- **THEN** the script does not link that package
- **AND** the script does not walk transitive dependencies

#### Scenario: Empty allowlist is a safe default

- **WHEN** `LINK_PACKAGES` is an empty array
- **THEN** the script exits `0` without invoking `npm link`

### Requirement: `postinstall` invokes the link helper

`package.json` SHALL define `scripts.postinstall` as `./scripts/npm-link.sh` so that every local `npm install` or `npm ci` self-heals link state. `package.json` SHALL NOT use the `prepare` lifecycle hook to invoke `scripts/npm-link.sh`.

#### Scenario: postinstall runs the helper after npm install

- **WHEN** `npm install` completes locally
- **THEN** `scripts/npm-link.sh` is invoked as the `postinstall` step
- **AND** any allowlisted package that meets the link conditions is re-linked into `node_modules`

#### Scenario: postinstall runs the helper after npm ci

- **WHEN** `npm ci` completes locally
- **THEN** `scripts/npm-link.sh` is invoked as the `postinstall` step
- **AND** any allowlisted package that meets the link conditions is re-linked into `node_modules`

#### Scenario: prepare hook does not invoke the helper

- **WHEN** `package.json` is reviewed
- **THEN** the `prepare` script does not include `scripts/npm-link.sh`
- **AND** `prepare` continues to run only `svelte-kit sync` (or its successor)

### Requirement: Documented developer workflow for local chessboard development

The repository SHALL document the local development workflow for switching between the registry-installed and locally-developed `@mirasen/chessboard` in `README.md` or `CONTRIBUTING.md`. The documentation SHALL state:

- That a one-time `npm link` inside the developer's `chessboard` working tree is required before linking will take effect.
- That after the one-time step, running `npm install` in this repository will automatically link the local copy via `postinstall`.
- That `package.json` and `package-lock.json` SHALL NOT be committed in a state that records a `file:` or symlinked entry for `@mirasen/chessboard`.

#### Scenario: Documentation describes the one-time setup

- **WHEN** the developer documentation is reviewed
- **THEN** it explains that `cd ../chessboard && npm link` is required once per developer machine
- **AND** it explains that `npm install` in this repo links automatically afterwards via `postinstall`

#### Scenario: Documentation warns about lockfile hygiene

- **WHEN** the developer documentation is reviewed
- **THEN** it advises the developer to verify that `package-lock.json` resolves `@mirasen/chessboard` to a registry URL (not a `file:` path) before committing

