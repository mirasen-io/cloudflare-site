## 1. Rewrite the link helper script

- [x] 1.1 Rewrite `scripts/npm-link.sh` with hard-coded `LINK_PACKAGES=("@mirasen/chessboard")`, `npm ls -g --json | jq` parse, triple intersection (allowlist ∩ direct deps from `package.json` ∩ globally linked), and a final `npm link "${to_link[@]}"` invocation with the existing warning lines retained
- [x] 1.2 Verify the file remains executable (`chmod +x scripts/npm-link.sh`) and the shebang is `#!/bin/bash`
- [x] 1.3 Smoke test locally: with no global link present, run `./scripts/npm-link.sh` and confirm it prints "nothing to link" and exits 0
- [x] 1.4 Smoke test locally: with a global link present, run `./scripts/npm-link.sh` and confirm it invokes `npm link @mirasen/chessboard`

## 2. Switch package.json to the registry dependency

- [x] 2.1 In `package.json`, change `dependencies."@mirasen/chessboard"` from `"file:../chessboard"` to `"^1.3.2"`
- [x] 2.2 In `package.json#scripts`, remove `build:full` and `build:chessboard`
- [x] 2.3 In `package.json#scripts`, add `"postinstall": "./scripts/npm-link.sh"`
- [x] 2.4 Confirm `package.json#scripts.prepare` is unchanged (`svelte-kit sync || echo ''`) and does not invoke `scripts/npm-link.sh`

## 3. Regenerate the lockfile

- [x] 3.1 Run `rm -rf node_modules package-lock.json` from the site root
- [x] 3.2 Ensure no global `npm link @mirasen/chessboard` is active for this run (so the lockfile resolves cleanly to the registry tarball); if a link is present, run `npm unlink -g @mirasen/chessboard` first or run the install in a shell where the link is not visible
- [x] 3.3 Run `npm install` and verify the `postinstall` step prints "nothing to link" (because step 3.2 ensured no global link)
- [x] 3.4 Inspect the new `package-lock.json`: confirm the `@mirasen/chessboard` entry has a `resolved` field beginning with `https://registry.npmjs.org/`
- [x] 3.5 Inspect `node_modules/@mirasen/chessboard`: confirm it is a real directory, not a symlink (`ls -la node_modules/@mirasen/chessboard`)

## 4. Update CI workflow

- [x] 4.1 In `.github/workflows/ci.yml`, in the `check` job: remove the second `actions/checkout` for `mirasen-io/chessboard`; remove `path: site` from the remaining `actions/checkout`; remove `npm ci --prefix chessboard`; drop `--prefix site` from all `npm` calls; replace `build:full` with `build`
- [x] 4.2 In `.github/workflows/ci.yml`, in the `test` job: apply the same removals and replacement
- [x] 4.3 In `.github/workflows/ci.yml`, in the `cloudflare` (preview) job: apply the same removals and replacement; also remove `workingDirectory: ./site` from `cloudflare/wrangler-action@v4` and `working-directory: ./site` from the E2E run step
- [x] 4.4 Verify no `actions/checkout` step in `ci.yml` references `repository: mirasen-io/chessboard` after edits and no `path: site` remains
- [x] 4.5 Verify no `npm ci --prefix chessboard`, no `--prefix site`, and no `build:full` references remain in `ci.yml`

## 5. Update release workflow

- [x] 5.1 In `.github/workflows/release.yml`, in the release/build job: remove the second `actions/checkout` for `mirasen-io/chessboard`; remove `path: site` from the remaining `actions/checkout`; remove `npm ci --prefix chessboard`; drop `--prefix site`; replace `build:full` with `build`; drop `cwd: site` from `changesets/action@v1`; drop `workingDirectory: ./site` from `cloudflare/wrangler-action@v4`
- [x] 5.2 Remove or rewrite the comment that explains `build:full` reconciles the `file:` link (the comment becomes false after this change)
- [x] 5.3 Verify no `actions/checkout` step in `release.yml` references `repository: mirasen-io/chessboard` and no `path: site` remains
- [x] 5.4 Verify no `npm ci --prefix chessboard`, no `--prefix site`, no `cwd: site`, no `workingDirectory: ./site`, and no `build:full` references remain in `release.yml`

## 6. Update Dependabot config

- [x] 6.1 In `.github/dependabot.yml`, remove the line `- dependency-name: '@mirasen/chessboard'` from the `ignore` block
- [x] 6.2 Confirm the `groups` section is unchanged; chessboard will join `minor-and-patch` and `major` automatically

## 7. Confirm untouched workflows

- [x] 7.1 Diff `.github/workflows/auto-merge.yml` against its committed version — confirm zero changes
- [x] 7.2 Diff `.github/workflows/auto-release.yml` — confirm zero changes
- [x] 7.3 Diff `.github/workflows/codeql.yml` — confirm zero changes
- [x] 7.4 Diff `.github/workflows/contribution-reset.yml` — confirm zero changes
- [x] 7.5 Diff `.github/workflows/contribution-update.yml` — confirm zero changes

## 8. Document the developer workflow

- [x] 8.1 In `README.md` (or `CONTRIBUTING.md` if present), add a "Local development against in-progress @mirasen/chessboard" section
- [x] 8.2 The section MUST state that `cd ../chessboard && npm link` is required once per developer machine before linking takes effect
- [x] 8.3 The section MUST state that `npm install` in this repo will then auto-link via `postinstall`
- [x] 8.4 The section MUST advise the developer to verify `package-lock.json` resolves `@mirasen/chessboard` to a registry URL (not a `file:` path) before committing

## 9. Local validation before pushing

- [x] 9.1 With no global link active, run `npm ci` (using the freshly committed lockfile) and confirm it succeeds
- [x] 9.2 Run `npm run build` and confirm the site builds against the registry copy of `@mirasen/chessboard`
- [x] 9.3 Run `npm run lint && npm run check` and confirm no failures
- [x] 9.4 Run `npm run test:unit` and confirm no failures
- [x] 9.5 Set up the local-dev path end-to-end: `cd ../chessboard && npm link`, then `cd cloudflare-site && npm install`, then `ls -la node_modules/@mirasen/chessboard` and confirm it is now a symlink to `../chessboard`
- [x] 9.6 Tear down the link: `cd ../chessboard && npm unlink -g`, then in site `npm install` and confirm `node_modules/@mirasen/chessboard` is a real directory again

## 10. Push and verify CI

- [x] 10.1 Commit all changes with a descriptive message; do NOT commit while the local link is active (verify `package-lock.json` shows registry URL, not `file:`)
- [x] 10.2 Push to a feature branch and open a PR
- [x] 10.3 Verify all `ci.yml` jobs (`check`, `test`, `e2e` if separate, `required-main`) pass green
- [x] 10.4 If any job fails, fix and re-run; do not merge until all required CI checks are green
- [x] 10.5 After merge, monitor the next `release.yml` run (triggered by CI on `main`) and confirm the deploy step runs successfully against the registry-installed chessboard
- [x] 10.6 After merge, watch for Dependabot's next weekly run and confirm it begins picking up `@mirasen/chessboard` updates
