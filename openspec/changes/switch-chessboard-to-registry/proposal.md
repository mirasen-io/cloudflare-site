## Why

The site consumes `@mirasen/chessboard` via `"file:../chessboard"`, which forces every CI job to do a second `actions/checkout` of `mirasen-io/chessboard`, blocks Dependabot from updating the dependency, and prevents the published package from accumulating real-world download trace. Switching to a registry-pinned semver range solves all three at once and lets us keep a low-friction local development path through an opt-in `npm link` helper.

## What Changes

- **BREAKING** `package.json` dependency `@mirasen/chessboard` switches from `"file:../chessboard"` to a registry semver range (`^1.3.2`).
- **BREAKING** Remove `build:full` and `build:chessboard` scripts — site builds no longer drive a sibling chessboard build.
- Add `postinstall` script that invokes `scripts/npm-link.sh` to opt-in to local linking when a global npm link is present.
- Rewrite `scripts/npm-link.sh`:
  - hard-coded `LINK_PACKAGES` allowlist (per-project list of packages to link)
  - direct dependencies only (intersection of `LINK_PACKAGES` ∩ `package.json` direct deps + devDeps ∩ globally linked packages)
  - clean `npm ls -g --json | jq` parsing (replaces fragile `awk`/`sed` pipeline)
  - CI guard (`$CI` set ⇒ no-op exit 0)
- **BREAKING** `.github/workflows/ci.yml` (3 jobs) and `.github/workflows/release.yml` (1 job): remove the second `actions/checkout` of `mirasen-io/chessboard`, remove `npm ci --prefix chessboard`, remove the `--prefix site` indirection, and replace `npm run build:full` with `npm run build`.
- `.github/dependabot.yml`: remove the `dependency-name: '@mirasen/chessboard'` entry from `ignore` so Dependabot starts opening update PRs.
- Regenerate `package-lock.json` to reference the registry tarball for `@mirasen/chessboard`.
- Document the local development workflow (one-time `npm link` in the chessboard checkout; site `npm install` self-links via `postinstall`).
- Untouched: `auto-merge.yml`, `auto-release.yml`, `codeql.yml`, `contribution-reset.yml`, `contribution-update.yml`. None of these reference the chessboard sibling checkout.

## Capabilities

### New Capabilities
- `local-dev-link`: opt-in `scripts/npm-link.sh` helper, its allowlist semantics, the `postinstall` integration, and the documented local-development flow that pairs it with the registry dependency.

### Modified Capabilities
- `ci-validation`: drops the sibling-checkout requirement and the `file:../chessboard` invariant; jobs install only this repo and build via `npm run build`.
- `cloudflare-release`: same — release pipeline no longer checks out chessboard or runs `build:full`.
- `dependabot-automation`: `@mirasen/chessboard` is no longer in the Dependabot ignore list and SHALL flow through the existing `minor-and-patch` / `major` groups like any other dependency.

## Impact

- Affected files:
  - `package.json` (deps, scripts)
  - `package-lock.json` (regenerated)
  - `scripts/npm-link.sh` (rewritten)
  - `.github/workflows/ci.yml`, `.github/workflows/release.yml`
  - `.github/dependabot.yml`
  - `README.md` or `CONTRIBUTING.md` (developer docs)
- Affected behavior:
  - Production builds install a published `@mirasen/chessboard` tarball from npm; CI no longer needs the chessboard repo present at build time.
  - Dependabot will start opening PRs against `@mirasen/chessboard` like any other dependency, picked up by `auto-merge.yml`.
  - npm download counters for `@mirasen/chessboard` reflect actual project installs.
- Risks:
  - First `npm install` after the switch must complete in an environment where `chessboard@1.3.2` is reachable from the npm registry (it is — verified via `npm view`).
  - Lockfile drift if a developer commits while a local link is active: mitigated by `postinstall` self-healing the link on every install and by review discipline.
  - First-time setup cost: each developer who wants local linking runs `npm link` once inside their `chessboard` clone.
