---
'@mirasen/main-website': patch
---

Switch `@mirasen/chessboard` from a local `file:../chessboard` dependency to the npm registry, and simplify CI accordingly.

- Consume `@mirasen/chessboard@^1.3.2` from the npm registry instead of `file:../chessboard`.
- Add a `postinstall` hook that invokes a rewritten `scripts/npm-link.sh` for opt-in local development against an in-progress chessboard checkout (`npm link` in the chessboard repo). The hook is a no-op on CI and on machines without a global link, secured by the empty intersection of declared, direct, and globally-linked package sets — no `$CI` guard required.
- Drop the sibling `mirasen-io/chessboard` checkout from `ci.yml` (3 jobs) and `release.yml` (1 job); checkout this repository at the workflow root and remove `path: site`, `--prefix site`, `cwd: site`, and `workingDirectory: ./site` from all install/build/changeset/wrangler steps.
- Remove `build:full` and `build:chessboard` scripts from `package.json`; site builds now run plain `npm run build`.
- Unblock `@mirasen/chessboard` in `.github/dependabot.yml` so it joins the existing `minor-and-patch` and `major` groups.
- Add `README.md` documenting the local development workflow for switching between the registry copy and a locally-linked chessboard.
