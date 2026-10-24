# Mirasen migration plan: SvelteKit 2 → SvelteKit 3

Research date: October 24, 2026. Branch: `migrate/sk-3`.
Baseline commit: `5abbdd406b3faf6d2a5dfc1c658ff174085beb8d`.

Status: the user created the sibling minimal scaffold and committed it as
`95c0b67fda6937868a26bad8035b08b6bf52cbbf` (`initial commit`). Scaffold review is
complete. The user then committed package/editor updates as `3bdab0f`. Steps 1
(original-site baseline) and 2 (scaffold cleanup/prerendering) are complete;
porting application code has not started. Step 2 changes are uncommitted for user review.
Completed checks and remaining work are recorded below.

## Plan references

Follow the approach from [veche PR #15](https://github.com/veche-design/cloudflare-site/pull/15):
create a sibling project → port the site → verify → replace the current repository contents.

The deleted `docs/plan.md` was recovered from the PR history:

- [Original plan, `146380f`](https://github.com/veche-design/cloudflare-site/blob/146380f64af1cdfbb03738036e3166f40e1c4499/docs/plan.md).
- [Updated plan with migration results, `17dd350`](https://github.com/veche-design/cloudflare-site/blob/17dd3504977427a46a0077a20bee56e7c0ad281f/docs/plan.md).
- Subsequent plan removal: `707faad`; restoration of the missing `src/lib/index.ts`: `4e40d47`.

The local `../../veche/cloudflare-site` and `../../veche/cloudflare-site-new` projects
were inspected. Both declare Kit `^3.1.0`, adapter-static `^4.0.0`, and `#lib` imports
in `package.json`. Use them as configuration references; port Mirasen product code
and settings from this repository.

Technical changes were checked against the [Kit 3 migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
and the official Svelte MCP documentation.

## Approach and scope

```text
current cloudflare-site                 original site and Git history
        ↓ port
../cloudflare-site-new                  fresh Kit 3 scaffold + Mirasen code
        ↓ after verification
current cloudflare-site, migrate/sk-3    new project, existing history and automation
```

Create a separate local Git repository in the new directory: the first commit
contains the user-prepared scaffold, including their package adjustments, followed
by configuration, porting, and verification commits. Do not copy its `.git` back. Keep the original site available for comparison
until verification is complete.

Preserve appearance, copy, URLs, example behavior, navigation, and the release flow.
Redesigns, example rewrites, Storybook, i18n, enhanced-img, and chessboard library API
upgrades are outside this migration.

## Template choice: minimal

Use `--template minimal`. According to the [sv create documentation](https://svelte.dev/docs/cli/sv-create),
`minimal` creates a bare scaffold, while `demo` creates a showcase application with
a game. There is no separate `minimal demo` template. This site already has all its
pages and its own tests, so it does not need Sverdle, About, Counter, or the demo
styles used in the veche scaffold.

Application templates and add-on examples are separate choices:

- The [Vitest add-on](https://svelte.dev/docs/cli/vitest) configures unit/component
  projects and adds demo tests. Keep the configuration and replace the demos with
  our existing tests.
- The [Playwright add-on](https://svelte.dev/docs/cli/playwright) also adds a demo test.
  The user included it in the scaffold. Replace its generated demo and configuration
  with our existing `playwright.config.ts`, scripts, and `e2e/`. No `/demo/playwright`
  route is needed.
- Port and compare MCP/editor settings separately. The `ai-tools` add-on in the
  veche command is not required for Kit 3, but the user included it in this scaffold.
  Preserve its generated setup alongside existing instructions and OpenSpec.

Start with `minimal` and the required add-ons, using existing Mirasen tests to
verify the site.

## Current state

| Area              | State in this repository                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Application       | `@mirasen/main-website`, private, version `1.3.3`                                             |
| Framework         | Kit `2.70.3`, adapter-static `3.0.10`, Svelte `5.57.2` in the lockfile                        |
| Tooling           | TypeScript `^6.0.2`, Vite `^8.3.4`, vite-plugin-svelte `^7.3.1`                               |
| UI                | Tailwind 4, Skeleton `5.0.1`, `@lucide/svelte`, custom Mirasen theme                          |
| Chess             | `@mirasen/chessboard` `1.5.1` from npm, `chess.js` `^1.4.0`                                   |
| Rendering         | Root `prerender = true`, adapter-static, no server endpoints/hooks                            |
| Navigation        | Typed `RouteId`, `resolve`, `page` from `$app/state`, `goto` in the mobile menu               |
| Tests             | `src/lib/board/utils.spec.ts`: 11 unit tests; 4 Playwright example smoke tests                |
| Hosting           | Wrangler assets from `./build`, `html_handling: drop-trailing-slash`                          |
| CI                | build/lint/check, tests on Node 22/24/26; Cloudflare PR preview and e2e against it            |
| Releases          | Changesets → version/tag/GitHub Release → Wrangler deploy                                     |
| Local development | `postinstall` → `scripts/npm-link.sh`, optional chessboard substitution through a global link |

The README mentions Cloudflare Pages, but the current workflows use the Workers
commands `versions upload` and `deploy`. Preserve the actual deployment flow and
clarify the README. Older OpenSpec documents occasionally describe previous paths
or Actions versions; verify current configuration against the code without rewriting
the specification archive as part of this migration.

Preserve the following routes, including direct URL access:

| URL                                    | Source                                                        |
| -------------------------------------- | ------------------------------------------------------------- |
| `/`                                    | `src/routes/+page.svelte`                                     |
| `/chess-lore`                          | `src/routes/chess-lore/+page.svelte`                          |
| `/chessboard`                          | `src/routes/chessboard/+page.svelte`                          |
| `/chessboard/examples`                 | `src/routes/chessboard/examples/+page.svelte`                 |
| `/chessboard/examples/minimal`         | `src/routes/chessboard/examples/minimal/+page.svelte`         |
| `/chessboard/examples/promotion`       | `src/routes/chessboard/examples/promotion/+page.svelte`       |
| `/chessboard/examples/chessjs`         | `src/routes/chessboard/examples/chessjs/+page.svelte`         |
| `/chessboard/examples/live-games-grid` | `src/routes/chessboard/examples/live-games-grid/+page.svelte` |
| `/license-gate`                        | `src/routes/license-gate/+page.svelte`                        |

## Target versions and Kit 3 changes

Target stable Kit 3.x and adapter-static 4.x. The inspected veche reference uses
`^3.1.0` / `^4.0.0`; record exact resolved versions in the new `package-lock.json`.
Kit 3 requires at least Node 22.17, TypeScript 6, Svelte 5.57.1, Vite 8.0.12, and
vite-plugin-svelte 7. Current application ranges already meet these requirements,
apart from Kit and the adapter. Local versions observed: Node `24.21.0`, npm `11.19.0`.

Do not upgrade every dependency to latest simultaneously. Preserve product versions
and compatible tooling first; make changes beyond Kit/adapter only when needed.
Align `playwright` and `@playwright/test` versions. Verify the lockfile across the
CI Node matrix, accounting for npm 10/11 differences; the release workflow already
arranges lockfile generation on the oldest matrix version.

| Area               | Action                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `svelte.config.js` | Move the adapter and `compilerOptions` into `sveltekit({...})` in `vite.config.ts`; remove the old config                        |
| Runes              | Preserve the current `compilerOptions.runes` function that excludes `node_modules`                                               |
| `$lib`             | Add `imports` for `#lib` and `#lib/*`; replace imports and include explicit extensions                                           |
| `src/lib/index.ts` | Preserve it: the bare `#lib` alias points to `./src/lib/index.js`                                                                |
| TypeScript         | Use `extends: "$app/tsconfig"`, explicitly cover sources, e2e, and configs; include `$app/types` and `node` when setting `types` |
| ESLint             | Remove the deleted svelte.config import and `parserOptions.svelteConfig`; compare with the new scaffold                          |
| `@eslint/compat`   | Remove only if no longer needed; newer ESLint provides `includeIgnoreFile` from `eslint/config`                                  |
| Navigation         | Preserve `RouteId` and `resolve('/...')`: these strings are route IDs; do not strip `/` with a blanket replacement               |
| `$app/state`       | Already used; `page.url` is only read, so no stores migration is needed                                                          |
| `goto`             | The current call uses no changed options; verify mobile menu behavior on Kit 3                                                   |

For TypeScript modules, follow the veche convention of `.js` imports resolving to
`.ts` sources: `#lib/nav/links.js`, `#lib/board/utils.js`, and `#lib/board/use.svelte.js`.
Keep real `.svelte`, `.svg`, and `.ico` extensions for components and assets. Also
review relative imports, including `utils.spec.ts`, `LiveCard.svelte`, and e2e helpers.

Compare old tsconfig options with `$app/tsconfig` instead of copying them blindly;
preserve strictness and the necessary file coverage. Include `e2e/`, which veche
does not have. Review whether the old `lib`/`target` and emit options are necessary
with `noEmit`.

Current sources contain no `$app/stores`, `$app/environment`, `$env/*`, service worker,
form actions, remote functions, server hooks, or API routes. Those migration guide
sections need no separate porting work. Keep adapter-static for the existing static
deployment; do not add `adapter-cloudflare`.

## Intentional differences from the veche plan

Preserve:

- The `@mirasen/main-website` name, private status, current version, and `CHANGELOG.md`.
- `.changeset/`, including pending changesets, `@changesets/cli`, both `changeset:*`
  scripts, and the release workflow. Veche removed Changesets; deployment here depends on it.
- `scripts/npm-link.sh`, its executable bit, the list containing `@mirasen/chessboard`,
  and `postinstall`. Veche emptied the list; doing so here would break local development.
- The registry dependency and registry URL in the lockfile. Success with a local
  link does not demonstrate that the published package works.
- All of `src/`, `static/`, `e2e/`, OpenSpec, automation, instructions, and editor settings.
- Skeleton, all CSS files, and `data-theme="mirasen"` / `lang="en"` in `src/app.html`.
- The `html.app-started` marker, the `useBoard` lifecycle, and cleanup of boards,
  subscriptions, and timers.

## Implementation steps

Work one reviewable step at a time. Stop after each completed step so the user can
inspect the result before the next step begins. Do not combine the remaining
scaffold cleanup, configuration port, and application port into a single change.

### 1. Record the baseline

- [x] Check the branch and working tree: original repository on `migrate/sk-3` at
      `5abbdd406b3faf6d2a5dfc1c658ff174085beb8d`, with only untracked `docs/`;
      sibling repository clean at `3bdab0f2edf4cbb5ffcd93428006fc4fc37948ea`.
      No user changes were overwritten or committed.
- [x] Record the starting SHA and baseline results for build, lint, check, unit, and e2e.
      All checks passed; see the results below.
- [x] Capture all nine original pages at 1440×900 and 390×844 and check keyboard
      navigation on desktop/mobile.
- [x] Locate the user-created `../cloudflare-site-new`; its working tree was clean
      before and after review. Continue from this project without recreating it.

Step 1 checkpoint (October 24, 2026):

| Baseline check                        | Result                                                                                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                       | Passed: 0 errors, 0 warnings                                                                                                              |
| `npm run lint`                        | Passed                                                                                                                                    |
| `npm run build`                       | Passed; emitted a plugin timing diagnostic                                                                                                |
| `npm run test:unit -- --run`          | Passed: 1 file, 11 tests                                                                                                                  |
| `./node_modules/.bin/playwright test` | Passed: 4 tests                                                                                                                           |
| Desktop/mobile captures               | 18 screenshots; every page returned 200, no page errors or horizontal overflow                                                            |
| Keyboard navigation                   | Desktop Enter navigation and active link; mobile Enter/Space opening, Escape closing/focus restoration, ArrowDown/Enter navigation passed |

The initial E2E attempt failed because the sandbox blocked listening on port 4173
(`EPERM`); repeating outside the sandbox passed. Existing browsers were used, with
no browser installation or dependency changes. Screenshot capture used a temporary
preview server on port 4183, which was stopped afterward.

Local evidence is saved under `artifacts/migration-baseline/` (already ignored by
Git): `checks.json`, command logs, `pages.json`, and `screenshots/`. The page report
also records two automation assumptions corrected during keyboard verification:
direct item focus bypasses Zag highlighting, and trigger focus after route navigation
is distinct from Escape focus restoration. Neither required an application change.
Live board positions are dynamic; compare layout and appearance rather than expecting
identical pixels in animated board regions. The mobile home capture was visually inspected.

Step 1 was completed and reviewed before the user authorized step 2. Infrastructure
and application porting remain separate later steps.

### 2. Create the minimal scaffold

The user created this project manually and adjusted its package metadata before
committing. The generated README records this reproduction command:

```sh
# Run from the parent mirasen directory; recorded for reference, do not rerun
npx sv@1.1.1 create --template minimal --types ts \
  --add prettier eslint vitest="usages:unit,component" playwright="demo:yes" \
  tailwindcss="plugins:typography,forms" enhanced-img sveltekit-adapter="adapter:static" \
  ai-tools="ide:claude-code,vscode,other+delivery:plugin+tools:mcp,svelte-code-writer,svelte-core-bestpractices,svelte-file-editor+mcpSetup:remote" \
  --install npm cloudflare-site-new
```

- [x] Create the minimal scaffold and verify the actual Kit 3 / adapter-static 4 versions.
- [x] Create the local initial commit: `95c0b67fda6937868a26bad8035b08b6bf52cbbf`.
      It contains the user's package adjustments, so it is a prepared baseline rather
      than a guaranteed byte-for-byte untouched CLI output.

Initial scaffold review at `95c0b67` (before the subsequent user updates):

| Check                           | Result                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| Working tree                    | Clean before and after verification                                                       |
| Package ranges vs lockfile root | No mismatches found                                                                       |
| Locked vs installed core tools  | Matching versions for all tools inspected                                                 |
| Framework                       | Kit `3.1.0`, adapter-static `4.0.0`, Svelte `5.57.2`                                      |
| Build tools                     | Vite `8.3.5`, TypeScript `6.0.3`, ESLint `10.13.0`                                        |
| Test tools                      | Vitest/browser provider `4.1.12`, vitest-browser-svelte `2.2.1`, Playwright/test `1.64.1` |
| `npm run check`                 | Passed: 0 errors, 0 warnings                                                              |
| `npm run lint`                  | Passed, exit 0                                                                            |
| `npm run build`                 | Failed: adapter-static reports dynamic `/` and `/demo/playwright` routes                  |
| `npm run test:unit -- --run`    | Passed: 2 demo files, 2 tests, including the browser component test                       |
| E2E                             | Not run: its webServer build is blocked by the same static adapter error                  |

The initial build failure came from the missing root `prerender = true`; this is
resolved by the step 2 changes recorded below. Remove the generated Playwright demo when
porting the existing tests. Do not disable adapter strictness or add an SPA fallback.
The Vitest run also reports `transform_index_html_unsupported` for
`vitest:browser:transform-tester-html`; tests pass, but recheck this warning after
porting tests. No browser packages were installed during review.

The new scaffold correctly uses `#lib` imports, `$app/tsconfig`, configuration in
`vite.config.ts`, and ESLint without the old Svelte config import. Its Vitest 4
stack is internally aligned; the old site's Vitest 5 is a version difference to
resolve deliberately rather than an automatic reason to upgrade everything.
`enhanced-img` is already installed and configured by the user; preserve that
setup, while image conversion remains outside the porting scope.

User updates reviewed at `3bdab0f`:

- Package identity is already restored to `@mirasen/main-website`, private, version `1.3.3`.
- Kit is now declared as `^3.1.0`; the installed/locked version remains `3.1.0`.
- Vitest and its browser provider are both installed/locked at `5.0.5`, with
  vitest-browser-svelte `3.1.0`. Playwright and its test package both resolve to `1.64.1`.
- Package dependency ranges match the lockfile root. The core installed versions
  inspected match the lockfile. No reinstall was performed.
- VS Code formatting settings were added, including the XML formatter override.
  Preserve these when merging editor settings later.
- These changes are committed and the sibling working tree is clean. The earlier
  Vitest 4 review is historical; its test results do not validate the updated Vitest 5 setup.
- At this commit, the missing root prerender setting and generated demo contents
  were unchanged; step 2 subsequently addresses both.

Before the product port, restore product dependencies, Changesets, Wrangler, local
linking, the Mirasen theme, and the existing Playwright preview behavior. Add `e2e/` to TypeScript coverage when those tests are
copied. The generated demo routes, favicon, tests, and welcome page were removed
during step 2.

- [x] Remove generated demo tests/components before porting our own. No public demo
      page or floating DemoLinks widget remains.
- [x] Preserve the Vitest unit/component project configuration without dummy tests.
      Both projects load with `--passWithNoTests`; the original server suite will be
      ported and executed in step 4.
- [x] Add `src/routes/+layout.ts` with `export const prerender = true`.
- [x] Remove the scaffold favicon and welcome content; keep empty page/layout
      placeholders with the existing Tailwind stylesheet.
- [x] Exclude generated `.github/skills/` from Prettier. Its embedded documentation
      examples produced parser diagnostics despite lint exiting successfully; the
      exclusion removes this noise without editing generated skills.

Step 2 checkpoint (October 24, 2026; uncommitted changes on top of `3bdab0f`):

| Check                                          | Result                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| Svelte autofixer                               | Updated layout/page: no issues or suggestions                              |
| `npm run check`                                | Passed: 0 errors, 0 warnings                                               |
| `npm run lint`                                 | Passed, exit 0; clean after the generated-skills exclusion                 |
| `npm run build`                                | Passed; adapter-static wrote `build/index.html`                            |
| `npm run test:unit -- --run --passWithNoTests` | Passed configuration check; no test files remain at this intermediate step |
| Built preview                                  | `/` returns 200; `/demo/playwright` returns 404                            |
| Removed output                                 | No demo page output or demo/welcome/favicon markup in the root HTML        |
| Diff whitespace                                | `git diff --check` passed                                                  |

No application code, product tests, dependencies, package scripts, or lockfile were
ported or changed in this step. Unit and E2E test commands are intentionally
unchanged; until product tests are ported, ordinary runs may report no tests.
`--passWithNoTests` was used only for this intermediate verification, not added to
configuration or scripts. The preview server was stopped after the smoke check.

The sibling diff consists of `.prettierignore`, the root layout/page, the new
`+layout.ts`, and deletion of eight generated demo/favicon files. The current
repository only receives this plan update. No commit was created; stop here for
user review and commit before proceeding to step 3.

### 3. Port configuration and infrastructure

- [x] Restore package name/version/private (completed by the user in `3bdab0f`).
- [ ] Restore Changesets, `postinstall`, product dependencies, Wrangler, and existing
      Playwright configuration. Preserve the scaffold imports and aligned Playwright packages.
- [ ] Port `server.fs.allow: ['../..']` from the current Vite config for the local chessboard link.
- [ ] Configure `sveltekit({...})`, adapter-static, and runes; avoid two active configurations.
- [ ] Update tsconfig/ESLint/Prettier while preserving `tailwindStylesheet` and project rules.
- [ ] Copy `scripts/` before installing with the restored `postinstall` hook.
- [ ] Preserve `wrangler.jsonc`: Worker name, `./build`, slash handling, compatibility date,
      observability, and flags. Keep the existing hosting setup during this migration.
- [ ] Port `.npmrc`, `.gitignore`, `.prettierignore`, `.github/`, `.githooks/`,
      `.changeset/`, `CHANGELOG.md`, OpenSpec, Sonar configs, and editor/agent settings.
      Preserve existing formatting exclusions; add new ones only when necessary.
- [ ] Do not copy secrets, local `.env`/`.dev.vars` files, generated artifacts, or caches.

### 4. Port the site and tests

- [ ] Copy all assets and styles, `src/app.html`, `src/app.d.ts`, and `src/lib/index.ts`.
- [ ] Port AppBar, navigation configs, root/nested layouts, and all nine pages listed above.
- [ ] Port board helpers, `LiveCard.svelte`, and tests, changing only required imports/APIs.
- [ ] Port `static/robots.txt` and `static/sitemap.xml`; preserve the nine existing URLs.
- [ ] Preserve root `prerender = true`, SSR, and strict adapter-static validation.
      Do not replace static pages with an SPA fallback to bypass build failures.
- [ ] Verify that every route is emitted to `build/`; if crawling misses a page, fix
      the cause or add an explicit entry. Do not port veche demo routes.
- [ ] Port `playwright.config.ts` and `e2e/`: local build/preview on port 4173,
      `PLAYWRIGHT_BASE_URL` for Cloudflare preview, and the current `testMatch`.
- [ ] Run svelte-autofixer on changed Svelte components until all issues and suggestions are resolved.

### 5. Verify the port in the new directory

```sh
npm run format
npm run lint
npm run check
npm run build
npm run test:unit -- --run
npm run test:e2e
```

Currently, `test:e2e` runs `playwright install` followed by tests; without
`PLAYWRIGHT_BASE_URL`, its webServer builds the site and starts preview. Account
explicitly for browser installation; an already prepared environment may run the
local Playwright CLI directly.

- [ ] Run checks with the registry chessboard package in a clean environment without
      a global link. Verify the registry URL and that `npm ci` leaves the lockfile unchanged.
- [ ] Separately verify the optional local link and access to the sibling package;
      do not change the user's global npm links to test registry mode.
- [ ] Confirm that the existing 11 unit tests and 4 e2e tests pass and have not been
      replaced by demo tests.
- [ ] Compare all nine pages at 1440×900 and 390×844: theme, copy, links, favicon,
      footer, no overflow, and no new demo elements.
- [ ] Check desktop/mobile AppBar behavior: active links, mouse/Enter/Space, Escape,
      focus restoration, and external links. Verify navigation updates between sections.
- [ ] Check example controls: orientation, reset, promotion, chess.js status, and the
      12-board live grid; navigate away and back without errors or lingering timers.
- [ ] Run local Wrangler from devDependencies: all nine URLs and assets work, unknown
      URLs return 404, and trailing slash URLs redirect correctly to slashless URLs.
      Check direct access to nested pages as well as client navigation.
- [ ] Record actual commands, versions, and results, including differences from the baseline.

### 6. Copy the result back into this repository

- [ ] Confirm the original branch is still `migrate/sk-3`, no work is unsaved, and
      every original repository-specific file has been accounted for in the new tree.
- [ ] Prepare and review the replacement/deletion list. Preserve the original `.git`,
      local settings, and user files; do not use an unchecked `rsync --delete`.
- [ ] Replace tracked contents with the verified project tree, including this plan.
      Exclude `.git`, `node_modules`, `.svelte-kit`, `build`, `.wrangler`, test-results,
      browser reports, caches, and `.DS_Store`.
- [ ] Remove the old `svelte.config.js` and genuinely obsolete files; inspect the diff
      for lost changes, workflows, changesets, specifications, or executable bits.
- [ ] Run a clean `npm ci` and repeat lint/check/build/unit/e2e in the main directory:
      project location and local links may have affected earlier results.
- [ ] Update the README: Kit 3, Workers static assets, actual commands, and the existing
      local link/release flow.

### 7. Verify the PR and release

- [ ] Prepare the migration commit/PR after completing the local port; preserve repository history.
- [ ] Confirm CI passes on the actual Node matrix, including Node 22 at version 22.17 or later.
- [ ] Verify the Cloudflare PR preview, existing e2e tests against its deployment URL,
      direct URLs, slash redirects, and assets.
- [ ] Add a changeset for `@mirasen/main-website` through the established release flow;
      preserve pending changesets and do not reset the version to the scaffold's `0.0.1`.
- [ ] After merge, verify the normal version/tag/release/deploy flow and production smoke checks.
      Publishing and merging belong to the later implementation stage, not this research task.

## Completion criteria and rollback

The migration is ready when the new tree works after a clean install in the main
repository, all nine URLs and the UI are preserved, 11 unit tests and 4 e2e tests
pass, the build remains static, the PR preview is verified, and CI and the Changesets
release flow are preserved. Record unresolved failures and unavailable checks
explicitly; a missing result is not a passing check.

Before replacement, the original checkout remains the working fallback. After the
migration commit, roll back with a revert commit through the normal PR/CI/release
flow, preserving subsequent changes. If production deployment has already happened,
restore the previous verified Worker version through the normal Cloudflare rollback
process as well; a Git revert alone does not change the deployed site.

## Still to verify by execution

- Static builds and tests after the infrastructure/application port; the empty
  scaffold static build already passes at the step 2 checkpoint.
- Clean `npm ci` reproducibility: the review checked metadata consistency and used
  the existing installation; it did not reinstall dependencies.
- Compatibility of Skeleton/Zag/Svelte/Kit 3 during SSR and hydration. The installed
  Skeleton peer dependency (`svelte: ^5.40.0`) accepts our Svelte version, but that
  alone does not verify menu behavior.
- Registry mode, local linking, clean installation across the Node matrix, and Cloudflare preview.

Initial scaffold review left the sibling project unchanged. Step 1 completed
original-site baseline verification. Step 2 then changed only the sibling scaffold
cleanup/prerender files listed above and this plan, leaving its commits unchanged.
All step 2 changes remain uncommitted for the user's review. Infrastructure porting
and application porting have not started.
