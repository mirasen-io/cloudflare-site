---
'@mirasen/main-website': patch
---

Regenerate `package-lock.json` on the earliest matrix Node before `dependabot-auto-merge` runs.

Dependabot generates lockfiles inside its own container on Node 24 / npm 11 (see `dependabot/dependabot-core`'s `npm_and_yarn/Dockerfile`). npm 11's resolver dedups more aggressively and strips nested entries (e.g. `node_modules/svelte-check/node_modules/picomatch@4.0.4`) that npm 10 still requires. CI on Node 22 then fails `npm ci` with `Missing: picomatch@4.0.4 from lock file` (PR #15 reproduced this).

`release.yml` already side-stepped the same issue by pinning its lockfile-generating step to the earliest matrix Node. We now do the same in `auto-merge.yml`: a pre-step checks out the PR branch, picks the earliest Node from `vars.MATRIX_NODE_VERSION` (fallback `["22", "24"]`), runs `npm install --package-lock-only --ignore-scripts`, and pushes the regenerated lockfile back to the PR branch with the default `GITHUB_TOKEN`. Pushes from `GITHUB_TOKEN` do not trigger downstream workflows, so this lands silently and the existing `dependabot-auto-merge` action picks it up via its own checkout.

The fix lives in this repo (not in the shared `kt-workflows/actions/dependabot-auto-merge` action) to avoid changing the action's input contract — every consumer would otherwise need a coordinated bump.
