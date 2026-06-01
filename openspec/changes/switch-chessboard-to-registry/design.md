## Context

The site declares `"@mirasen/chessboard": "file:../chessboard"`. This local path dep dictates a sibling-checkout shape that has propagated through CI, the release workflow, the build scripts, and the Dependabot ignore list:

- `ci.yml` and `release.yml` each do a second `actions/checkout` of `mirasen-io/chessboard`, then `npm ci --prefix chessboard` + `npm ci --prefix site` + `npm run build:full --prefix site` (where `build:full = build:chessboard && npm install && build`).
- `.github/dependabot.yml` ignores `@mirasen/chessboard` because the `file:` URL has no semver to bump.
- npm download counters for `@mirasen/chessboard` reflect only manual installs and external consumers; the project that consumes it most actively contributes nothing to its trace.

`@mirasen/chessboard` is published independently (25 versions across April–June, latest `1.3.2`) via its own changeset publish pipeline. The published artifact has been validated repeatedly through real installs.

The desire is twofold: (a) consume the registry version like a normal npm dep so Dependabot, download counts, and CI simplification all become free; (b) preserve the ability to test a local in-progress `chessboard` working tree against this site without permanently coupling them.

## Goals / Non-Goals

**Goals:**

- Replace `file:../chessboard` with a registry semver range so Dependabot updates flow naturally and npm download counters reflect real installs.
- Simplify CI to a single-repo checkout + single-repo `npm ci` + `npm run build`.
- Provide an explicit, opt-in, per-developer path to substitute a locally-developed `@mirasen/chessboard` for the registry copy during development without modifying `package.json`.
- Keep the substitution path safe-by-default: if no global link is present, the helper does nothing and the registry version is used as-is.

**Non-Goals:**

- Converting the two repositories into a monorepo (npm/pnpm workspaces, turborepo).
- Building a generic, cross-project `npm-link` tool. The script is per-project; its allowlist is hard-coded for this repo.
- Automating the `npm link` registration step inside the chessboard clone — that remains a one-time manual step per developer machine.
- Locking the link state into `package.json` or `package-lock.json`. Linking is a developer-machine state, never a project artifact.

## Decisions

### Decision 1: Registry semver range, not `file:` or `link:`

Use `"@mirasen/chessboard": "^1.3.2"` (caret range against the latest published version at the time of the change).

**Rationale:** Caret allows minor/patch updates which Dependabot will pick up via the existing `minor-and-patch` group. Major bumps will arrive through the `major` group as separate PRs. This matches how every other dependency in the project is already managed.

**Alternatives considered:**

- `link:../chessboard` — same problems as `file:` for Dependabot and downloads; just different syntax.
- Pinned exact version `"1.3.2"` — disables Dependabot minor/patch automation; rejected.
- `workspace:*` (npm workspaces) — would require restructuring the two repos as a monorepo. Larger change than the problem warrants.

### Decision 2: Per-project hard-coded allowlist in `scripts/npm-link.sh`

The new script declares:

```bash
LINK_PACKAGES=(
  "@mirasen/chessboard"
)
```

**Rationale:** Each project has different needs — some want chessboard linked, others (future) might want a different package, most want neither. A hard-coded allowlist makes the intent visible at the top of the file and means an empty list is a safe default. This is per-project configuration; it belongs to the project, not to a shared tool.

**Alternatives considered:**

- Auto-discover all globally linked packages that appear in `package.json` deps — risks accidentally linking unrelated packages a developer happened to link globally for a different reason. Rejected.
- Allowlist by scope (e.g. `@mirasen`, `@ktarmyshov`) — broader than necessary; one developer might want only some of those linked. Rejected per user direction.
- External config file (`.npmlinkrc`) or `package.json` field — over-engineering for a single-package allowlist that changes ~never. Rejected.

### Decision 3: Triple intersection — declared ∩ direct deps ∩ globally linked

The script links a package only if all three sets agree:

1. The package name appears in `LINK_PACKAGES`.
2. The package appears as a direct entry in `dependencies` or `devDependencies` of this project's `package.json` (no transitive walk).
3. The package is currently registered as a global npm link (`npm ls -g --link=true`).

**Rationale:**

- (1) is the per-project intent.
- (2) is defense-in-depth: copying this script to a new project without updating `LINK_PACKAGES` will silently no-op rather than link an unrelated package; also blocks linking transitive dependencies that the project doesn't directly own.
- (3) is the actual availability check.

**Alternatives considered:**

- Skip (2) and link any allowlisted package regardless of direct-dep status — risks linking transitive deps that another package controls; tighter coupling reduces surprise. Rejected.
- Skip (3) and always run `npm link` — fails noisily on any developer machine that hasn't pre-registered a global link. Rejected; the silent no-op is a feature, not a bug.

### Decision 4: `postinstall` lifecycle hook, no environment guard

Add to `package.json`:

```json
"postinstall": "./scripts/npm-link.sh"
```

The script has no `$CI` or `$NODE_ENV` early-exit guard. Safety is provided entirely by the triple intersection (Decision 3): on a CI runner, no global links exist, so `npm ls -g --link=true` returns an empty set, the intersection is empty, and the script exits 0 without invoking `npm link`.

**Rationale:** `postinstall` runs after every local `npm install` AND every `npm ci` (npm 7+ runs full lifecycle on `npm ci`), self-healing any link that npm dropped during dependency resolution — exactly the behavior we want. It does NOT run during `npm publish` (unlike `prepare`), which is irrelevant here (`"private": true`) but is the cleaner choice. An environment guard would be redundant defense-in-depth: the triple intersection already guarantees no-op behavior wherever links don't exist, and it works correctly even on CI systems that don't set `$CI` (which a guard would fail to handle anyway).

**Alternatives considered:**

- `prepare` instead of `postinstall` — runs on `npm publish` and on `npm install` from git URLs, neither of which we want triggering link logic. Rejected in favor of `postinstall`.
- `[ -n "$CI" ] && exit 0` guard — redundant with the triple intersection; not portable across all CI systems; adds a code path that has to be reasoned about. Rejected.
- No lifecycle hook; require manual `npm run link` after every `npm install` — every `npm install` / `npm ci` (e.g. `changeset:version`'s embedded install) drops the link, requiring constant manual re-linking. Rejected as user-hostile.

### Decision 5: `npm ls -g --json | jq` instead of `awk`/`sed` parsing

The current script's parsing pipeline (`npm ls -g | awk -F ' -> ' ... | awk -F '@' ... | sed ...`) only correctly handles scoped package names by accident; non-scoped names retain their version suffix and never match. Replace with:

```bash
npm ls -g --depth=0 --link=true --json 2>/dev/null \
  | jq -r '.dependencies // {} | keys[]'
```

**Rationale:** Authoritative parse, three lines, scope-agnostic, works whether or not `LINK_PACKAGES` ever grows to include non-scoped entries.

**Alternatives considered:**

- Patch the `awk`/`sed` pipeline — fragile; would still need re-validation if npm changes its output format. Rejected.

### Decision 6: Drop `build:full` / `build:chessboard` scripts and the sibling-checkout in CI

Delete both scripts from `package.json` and remove from CI workflows: the second `actions/checkout` of `mirasen-io/chessboard`, the `npm ci --prefix chessboard` step, the `--prefix site` indirection, and the `build:full` invocation. Replace with a normal `actions/checkout` + `npm ci` + `npm run build`.

**Rationale:** These scripts existed only to reconcile the `file:` link by rebuilding the sibling on each CI run. With the registry dep, the published tarball already contains the built artifact; the build is a single-repo operation.

**Alternatives considered:**

- Keep the sibling checkout behind a feature flag for emergencies — adds permanent complexity for a rarely-used escape hatch. Rejected; reverting this change via git is the escape hatch.

### Decision 7: Dependabot ignore entry removed; existing groups absorb it

Delete the `- dependency-name: '@mirasen/chessboard'` entry from `.github/dependabot.yml#ignore`. Leave `groups.minor-and-patch` and `groups.major` as-is.

**Rationale:** The existing groups apply to `*`, so chessboard automatically joins them once unblocked. Combined with `auto-merge.yml`, minor/patch chessboard updates will auto-merge like any other dependency.

## Risks / Trade-offs

- **Lockfile drift while a local link is active.** A developer with active linking who runs `npm install` and commits both `package.json` and `package-lock.json` could in principle commit a lock that points at a local symlink rather than a registry tarball. → Mitigation: `postinstall` self-heals the link from a clean install (the install resolves the registry tarball first, then the postinstall replaces the entry with a symlink without touching the lock); review discipline catches `file:` paths in the lockfile if any sneak through.

- **First-time developer onboarding requires one extra step.** A developer who wants local chessboard development must `cd ../chessboard && npm link` once. → Mitigation: documented in `README.md` (or `CONTRIBUTING.md`) under a "Local development against in-progress chessboard" heading. Without that step the project still works fine — the registry version is used.

- **Non-existent or yanked future chessboard versions could brick CI.** If a published `chessboard` version is later unpublished or has a broken artifact, CI installs will fail. → Mitigation: same risk applies to every other npm dep in this project; not a regression. The chessboard publish pipeline is itself protected by changesets.

- **Allowlist drift.** If a new package is added later that should be linkable, the allowlist must be updated by hand. → Mitigation: it's two extra characters in a list at the top of a 25-line file; the visibility of the list IS the documentation.

- **`build:full` removal is irreversible without revert.** If something in the published tarball turns out to differ from the local `chessboard` working tree, the simple `build:full` escape hatch is gone. → Mitigation: trust the existing chessboard publish pipeline (validated by 25 successful releases); if an issue arises, fix the tarball in chessboard and republish, do not re-introduce the local-build crutch here.

## Migration Plan

1. **Land the package.json + script changes first** on a feature branch.
2. **Regenerate the lockfile** (`rm -rf node_modules package-lock.json && npm install`) and verify the new lockfile resolves `@mirasen/chessboard` to a registry tarball URL.
3. **Update CI/release workflows** in the same branch — the workflows must change atomically with the package.json change, otherwise CI for the branch itself will fail (old workflows assume the sibling checkout, but the new package.json no longer needs it).
4. **Update Dependabot config** in the same branch.
5. **Update developer documentation** in the same branch.
6. Push, run CI, fix any unexpected breakage, merge.
7. **Rollback strategy**: revert the merge commit. The change is fully self-contained; there is no migration of data, secrets, or external state.

## Open Questions

None remaining at proposal time. (Pre-flight `npm pack` validation was considered and rejected as redundant given the chessboard publish pipeline's track record; the user explicitly confirmed.)
