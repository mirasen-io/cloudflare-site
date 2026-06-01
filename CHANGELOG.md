# @mirasen/main-website

## 1.0.3

### Patch Changes

- 3edcbe4: Switch `@mirasen/chessboard` from a local `file:../chessboard` dependency to the npm registry, and simplify CI accordingly.
  - Consume `@mirasen/chessboard@^1.3.2` from the npm registry instead of `file:../chessboard`.
  - Add a `postinstall` hook that invokes a rewritten `scripts/npm-link.sh` for opt-in local development against an in-progress chessboard checkout (`npm link` in the chessboard repo). The hook is a no-op on CI and on machines without a global link, secured by the empty intersection of declared, direct, and globally-linked package sets — no `$CI` guard required.
  - Drop the sibling `mirasen-io/chessboard` checkout from `ci.yml` (3 jobs) and `release.yml` (1 job); checkout this repository at the workflow root and remove `path: site`, `--prefix site`, `cwd: site`, and `workingDirectory: ./site` from all install/build/changeset/wrangler steps.
  - Remove `build:full` and `build:chessboard` scripts from `package.json`; site builds now run plain `npm run build`.
  - Unblock `@mirasen/chessboard` in `.github/dependabot.yml` so it joins the existing `minor-and-patch` and `major` groups.
  - Add `README.md` documenting the local development workflow for switching between the registry copy and a locally-linked chessboard.

## 1.0.2

### Patch Changes

- 14b47e3: dependabot: directory '/', update @sveltejs/kit
- 14b47e3: dependabot: directory '/', update typescript-eslint
- 14b47e3: dependabot: directory '/', update wrangler
- d2bfb5c: dependabot: directory '/', update eslint-plugin-svelte
- d2bfb5c: dependabot: directory '/', update eslint
- d2bfb5c: dependabot: directory '/', update svelte

## 1.0.1

### Patch Changes

- 8c284a4: sitemap added

## 1.0.0

### Major Changes

- 406b78f: Add GitHub Actions validation and Cloudflare release deployment workflows.

  This release introduces the production workflow setup for the SvelteKit/Cloudflare Mirasen site:
  - add CI validation for lint, type checking, build, and tests;
  - add CodeQL analysis;
  - add Dependabot auto-merge and scheduled auto-release workflows;
  - add contribution branch sync/reset workflows;
  - add a Changesets-driven release workflow that creates GitHub releases;
  - deploy released builds to Cloudflare through `cloudflare/wrangler-action`;
  - deploy the SvelteKit build output from `./build`;
  - preserve no-trailing-slash canonical URL behavior through Cloudflare Workers Static Assets `html_handling`;
  - keep the local sibling `../chessboard` dependency workflow supported in CI.

  The site release flow now treats GitHub Actions as the source of truth for validation and release deployment.

### Minor Changes

- 406b78f: Add GitHub Actions workflows for CI, CodeQL, Dependabot automation, contribution branch maintenance, and Changesets-driven release with Cloudflare Workers deployment.
