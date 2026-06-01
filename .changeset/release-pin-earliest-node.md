---
'@mirasen/main-website': patch
---

Pin `release.yml`'s build step to the earliest Node in the matrix (`matrix-node-version-earliest: true`).

After switching `@mirasen/chessboard` to a registry dependency, the first `Version Packages` PR (#12) failed CI on the `test (22)` job with `Missing: picomatch@4.0.4 from lock file`. Root cause: `release.yml` ran under Node 24 / npm 11, and `npm install` inside `changeset:version` stripped optional peer-dependency entries (`svelte-check/node_modules/picomatch@4.0.4`, `yaml@2.9.0`) from `package-lock.json`. The CI matrix then ran `npm ci` on Node 22 / npm 10, which reads the lockfile strictly and rejected it.

Pinning the release job to the earliest Node in the matrix (Node 22 / npm 10) makes the generated lockfile readable by every Node in the matrix — npm 10 lockfiles are forward-compatible with npm 11, the reverse is not always true.
