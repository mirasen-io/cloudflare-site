# Mirasen migration plan: SvelteKit 2 → SvelteKit 3

Research date: October 24, 2026. Branch: `migrate/sk-3`.
Baseline commit: `5abbdd406b3faf6d2a5dfc1c658ff174085beb8d`.

Status: the user created the sibling minimal scaffold and committed it as
`95c0b67fda6937868a26bad8035b08b6bf52cbbf` (`initial commit`). Scaffold review is
complete. The user then committed package/editor updates as `3bdab0f` and step 2
as `77c6c45`, step 3 as `f6f6df3`, and OpenSpec setup as `5d79b1c`.
Steps 1–4 are complete; the user committed step 4 as `eb2319e`.
The user committed browser tooling/guidance as `ba58ecc`. Step 5 registry-mode,
visual, interaction and local hosting checks passed. The optional local-link runtime
check is WON'T DO by user decision and is not outstanding work. Step 6 is now
complete and committed by the user as `0d1c1d5`. The user also committed the
always-dark theme fix as `07d8ed5` and native Skeleton menu links as `e9edd07`.
PR #185 is open and ready for review. CI and Cloudflare preview verification
passed for `42c2929`; the migration changeset is prepared locally. Production
release/deployment verification remains pending.
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

Step 2 checkpoint (October 24, 2026; subsequently committed by the user as `77c6c45`):

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
repository only received the plan update. No agent commit was created; the user
reviewed and committed the sibling changes as `77c6c45` before authorizing step 3.

### 3. Port configuration and infrastructure

- [x] Restore package name/version/private (completed by the user in `3bdab0f`).
- [x] Restore Changesets, `postinstall`, product dependencies, Wrangler, and existing
      Playwright configuration. Preserve the scaffold imports and aligned Playwright packages.
- [x] Port `server.fs.allow: ['../..']` from the current Vite config for the local chessboard link.
- [x] Configure `sveltekit({...})`, adapter-static, and runes; avoid two active configurations.
- [x] Update tsconfig/ESLint/Prettier while preserving `tailwindStylesheet` and project rules.
- [x] Copy `scripts/` before installing with the restored `postinstall` hook.
- [x] Preserve `wrangler.jsonc`: Worker name, `./build`, slash handling, compatibility date,
      observability, and flags. Keep the existing hosting setup during this migration.
- [x] Port `.npmrc`, `.gitignore`, `.prettierignore`, `.github/`, `.githooks/`,
      `.changeset/`, `CHANGELOG.md`, OpenSpec, Sonar configs, and editor/agent settings.
      Preserve existing formatting exclusions; add new ones only when necessary.
- [x] Do not copy secrets, local `.env`/`.dev.vars` files, generated artifacts, or caches.

Step 3 checkpoint (October 24, 2026; subsequently committed by the user as `f6f6df3`):

- Copied 111 tracked infrastructure files: workflows/Dependabot, hooks, pending
  changesets and their configuration, release history, shell scripts, OpenSpec,
  Sonar configuration, npm settings, Wrangler, and editor/OpenSpec integration files.
  All copied regular files match the original byte for byte, including permissions.
  The `sonar-project.properties` symlink points to `.sonarcloud.properties`, as in
  the source repository. An initial copy dereferenced this link; it was restored
  after the user identified the file-type difference. All 111 entries were then
  rechecked for file type, link target, regular-file contents, and permissions.
- Merged `.vscode/settings.json`: retained the scaffold's CSS association and the
  user's formatting/XML settings, and restored explicit import organization.
- Merged `.claude/settings.json`: retained the generated Svelte plugin/marketplace
  and restored the original permissions object. Generated Svelte agents/skills and
  the scaffold AGENTS instructions remain intact.
- Restored the original `.gitignore` and `.prettierignore` exclusions, retaining
  the generated Svelte skills exclusion from step 2.
- Restored Changesets/postinstall scripts and the original direct product dependency
  ranges. Kept Kit 3, adapter-static 4, enhanced-img, the user's updated tooling,
  and `#lib` imports. Did not restore `@eslint/compat`, since the new ESLint config
  already imports `includeIgnoreFile` from `eslint/config`.
- Preserved the new TypeScript/ESLint/Prettier setup and added `e2e` to TypeScript
  coverage. Restored Vite filesystem access for sibling package development.
- Restored the existing local/Cloudflare-preview Playwright configuration. Product
  test files remain for step 4.
- Installed dependencies and resolved newly added packages to the original direct
  versions: Lucide `1.60.0`, chessboard `1.5.1`, chess.js `1.4.0`, Skeleton packages
  `5.0.1`, Changesets `3.0.3`, and Wrangler `4.151.3`. Framework/test stack versions
  remained unchanged from the user-prepared scaffold.
- The postinstall helper ran successfully with no global packages to link.
  Chessboard is a registry installation, not a symlink; its lockfile entry uses
  the registry tarball URL. Global npm links were not changed.

| Check                                          | Result                                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm ci --no-audit --no-fund`                  | Passed, including postinstall/prepare; lockfile hash unchanged                            |
| `npm run check`                                | Passed: 0 errors, 0 warnings                                                              |
| `npm run lint`                                 | Passed                                                                                    |
| `npm run build`                                | Passed; static output written to `build`                                                  |
| `npm run test:unit -- --run --passWithNoTests` | Passed configuration check; product tests are not ported yet                              |
| Wrangler deploy `--dry-run`                    | Passed with Wrangler `4.151.3`; read 21 static assets, exited without uploading           |
| Playwright config                              | Local mode uses port 4173 and build/preview; external base URL disables the local server  |
| Package/lockfile                               | Direct dependency ranges match; core framework/test versions preserved                    |
| Copied file parity                             | All 111 entries match: file types, symlink targets, regular-file contents and permissions |
| Shell syntax                                   | All copied scripts and pre-push hook passed syntax checks                                 |
| Diff scope                                     | No `src/` changes relative to `77c6c45`; whitespace check passed                          |

Local command logs and machine-readable results are saved in the original
repository's ignored `artifacts/migration-step3/` directory. Wrangler dry-run output
was written to `/private/tmp/mirasen-step3-worker`. No release, changeset versioning,
Git hook, push, or deployment command was executed. No secret/local environment
files, caches, or application sources were copied.

The user reviewed and committed the infrastructure port as `f6f6df3`, then installed
OpenSpec `1.15.0`, configured Claude/Codex integrations, and committed generated
files as `5d79b1c`. The existing specification history was retained. Step 4 starts
from that clean commit; no agent commit was created.

### 4. Port the site and tests

- [x] Copy all assets and styles, `src/app.html`, `src/app.d.ts`, and `src/lib/index.ts`.
- [x] Port AppBar, navigation configs, root/nested layouts, and all nine pages listed above.
- [x] Port board helpers, `LiveCard.svelte`, and tests, changing only required imports/APIs.
- [x] Port `static/robots.txt` and `static/sitemap.xml`; preserve the nine existing URLs.
- [x] Preserve root `prerender = true`, SSR, and strict adapter-static validation.
      Do not replace static pages with an SPA fallback to bypass build failures.
- [x] Verify that every route is emitted to `build/`; if crawling misses a page, fix
      the cause or add an explicit entry. Do not port veche demo routes.
- [x] Port `playwright.config.ts` (completed in step 3): local build/preview on port
      4173, `PLAYWRIGHT_BASE_URL` for Cloudflare preview, and the current `testMatch`.
- [x] Port `e2e/` and run the existing product tests against the migrated pages.
- [x] Run svelte-autofixer on changed Svelte components until all issues and suggestions are resolved.

Step 4 checkpoint (October 24, 2026; subsequently committed by the user as `eb2319e`):

- Ported all 39 tracked files under `src/`, `static/`, and `e2e/`, preserving assets,
  Mirasen styles/theme, app shell, navigation, all nine routes, the board lifecycle
  helper, and existing product tests.
- Replaced `$lib` imports with `#lib`, adding `.js` extensions for TypeScript modules,
  including `use.svelte.js`. Added explicit extensions to relative TypeScript imports
  in unit/E2E tests. Route IDs and `resolve('/...')` calls remain unchanged.
- Preserved `data-theme="mirasen"`, the original favicon, nested navigation data,
  `html.app-started`, root prerendering, SSR, and strict adapter-static behavior.
- Applied Svelte MCP suggestions in four board components: DOM references use simple
  assignment attachments, and five active-class directives in the chess.js page
  use class arrays. The `useBoard` helper, setup/cleanup callbacks, timers, game
  behavior, and page copy remain unchanged.
- Added `/.agents/skills/` to Prettier exclusions for the newly generated OpenSpec
  Codex skills. Initial lint found formatting differences in those five generated
  skill files; they were preserved verbatim rather than reformatted.
- CSS, asset, and static file contents match the original byte for byte. No
  dependency, package-script, lockfile, or OpenSpec skill changes were made.

| Check                                 | Result                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| Svelte MCP autofixer                  | All 12 components plus `use.svelte.ts`: no remaining issues or suggestions       |
| `npm run check`                       | Passed: 0 errors, 0 warnings                                                     |
| `npm run lint`                        | Passed                                                                           |
| `npm run build`                       | Passed with strict adapter-static                                                |
| Prerendered output                    | Exactly nine HTML pages matching the existing route inventory; no demo page      |
| `npm run test:unit -- --run`          | Passed: 1 file, 11 tests; no no-tests bypass                                     |
| `./node_modules/.bin/playwright test` | Passed: all 4 original product smoke tests; used installed browsers              |
| Source review                         | No `$lib` imports remain; asset/style/static parity and whitespace checks passed |

The four E2E tests verify mounting and controls for Minimal, Promotion, chess.js,
plus the 12-board grid and its client navigation to chess.js. Full desktop/mobile
visual comparison, navigation/cleanup checks beyond the existing tests, and Wrangler
hosting checks remain in step 5. No browser installation or deployment was performed.

Local command logs and route output inventory are saved in the original repository's
ignored `artifacts/migration-step4/` directory. The sibling diff is limited to
application/assets/tests and the generated-skills formatting exclusion; the original
repository only received the plan update. The user reviewed and committed the
sibling port as `eb2319e` before authorizing step 5.

### 5. Verify the port in the new directory

Pre-visual browser-tooling checkpoint (October 24, 2026):

- Before visual work started, a clean `npm ci --no-audit --no-fund`, lint, check,
  build, 11 unit tests, and 4 E2E tests passed at `eb2319e`. The lockfile was unchanged
  by the clean install. Logs are in ignored `artifacts/migration-step5/`.
- The user stopped the visual phase and requested the existing veche browser tooling
  and the full design-to-Svelte verification guidance be reviewed first.
- Added project-local `@playwright/cli` `^0.1.22`, resolving to `0.1.22`, matching
  veche. Verified the local executable's version/help, including `find`, targeted
  `snapshot`, depth limiting, and raw output. No browser was opened or installed.
- Copied both veche `playwright-cli` skill trees unchanged into `.agents/skills/`
  and `.claude/skills/` (22 files total); both copies match each other and the source.
- Added `.playwright-cli/` to `.gitignore` and `CLAUDE.md` containing `@AGENTS.md`.
  Updated the new project's AGENTS instructions for local CLI selection, autonomous
  dev-server lifecycle, targeted inspection, and economical CLI output.
- Reviewed the complete `design-to-svelte` skill on veche branch
  `feat/design-to-svelte-skill` at `82a715b`, including its earlier local-tooling
  guidance. Restored relevant rules absent from the shortened main-branch summary:
  fresh restart before final visual checks; wide/narrow and meaningful intermediate
  widths; different interaction states; rendered reference comparison at matching
  widths/states; scrolling/overflow/navigation access; no substitution of DOM snapshots
  for visual inspection; targeted fixes and rechecks; accurate claims about fidelity.
- Adapted these rules into Mirasen's `AGENTS.md`. Existing Mirasen tests remain part
  of validation; veche's test prohibition and project-specific design paths were
  not adopted. Reference-only artifact handling from the design skill does not
  change the current migration's authority: the existing Mirasen site is the baseline.
- Tooling setup passed formatting, lint, check, and build. A final instructions-only
  refinement passed formatting/lint. Stable Playwright/test `1.64.1`, Kit `3.1.0`,
  and Vitest `5.0.5` resolutions remain unchanged. Application code was not changed.
- No agent commit was created. The user committed this setup as `ba58ecc` before
  authorizing the final visual and hosting checks below.

Tooling validation logs are under ignored `artifacts/migration-browser-tooling/`.
Use the new project's local CLI and freshly started dev servers for the next visual
phase; reserve the already-built static output for Wrangler hosting verification.

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

- [x] Run checks with the registry chessboard package in a clean environment without
      a global link. Verify the registry URL and that `npm ci` leaves the lockfile unchanged.
- [x] **WON'T DO:** Actual optional local-link runtime check, excluded by user decision.
      Registry mode and the helper's no-link branch passed. The runtime check was
      not performed and is not required to complete this migration.
- [x] Confirm that the existing 11 unit tests and 4 e2e tests pass and have not been
      replaced by demo tests.
- [x] Compare all nine pages at 1440×900 and 390×844: theme, copy, links, favicon,
      footer, no overflow, and no new demo elements.
- [x] Check desktop/mobile AppBar behavior: active links, mouse/Enter/Space, Escape,
      focus restoration, and external links. Verify navigation updates between sections.
- [x] Check example controls: orientation, reset, promotion, chess.js status, and the
      12-board live grid; navigate away and back without errors or lingering timers.
- [x] Run local Wrangler from devDependencies: all nine URLs and assets work, unknown
      URLs return 404, and trailing slash URLs redirect correctly to slashless URLs.
      Check direct access to nested pages as well as client navigation.
- [x] Record actual commands, versions, and results, including differences from the baseline.

Final step 5 checkpoint (October 24, 2026; verified `ba58ecc`):

- Clean install preserved the lockfile; lint/check/build, 11 unit tests and 4 E2E
  tests passed. The same 4 E2E tests passed against local Wrangler static hosting.
- Compared all nine routes at desktop/mobile sizes; no meaningful visual differences,
  page errors, overflow, geometry changes or main-content link changes were found.
  Reviewed comparison sheets and enlarged captures. Of 18 image pairs, 15 were
  exactly equal; remaining differences were negligible button-edge rasterization.
  Animated grid board/status regions were masked only for pixel comparison.
- Home/chess.js/live-grid pairs at 767, 768 and 1024px were also exactly equal.
  Menus, navigation, promotion controls and SPA board/timer cleanup passed targeted
  browser checks. This includes canceling a pending computer reply and all 12 grid
  timers, then remounting exactly 12 boards on browser Back.
- Wrangler 4.152.0 served every page and checked asset correctly; unknown/demo URLs
  returned 404, and non-root slash URLs redirected with 307. No remote upload occurred.
- The optional local-link runtime check is WON'T DO by user decision.
  Node 22/26 and Cloudflare PR preview remain CI/later-stage checks.
- Evidence and detailed limits: `artifacts/migration-step5/report.md`, screenshots,
  pixel comparisons, interaction reports, HTTP results and final check logs.
- The named browser session, both dev servers and Wrangler were stopped. New project
  working tree is clean; only this plan is changed in the original repository.

The user committed the step 5 plan/results as `bf73c07` and then authorized step 6.

### 6. Copy the result back into this repository

- [x] Confirm the original branch is still `migrate/sk-3`, no work is unsaved, and
      every original repository-specific file has been accounted for in the new tree.
- [x] Prepare and review the replacement/deletion list. Preserve the original `.git`,
      local settings, and user files; do not use an unchecked `rsync --delete`.
- [x] Replace tracked contents with the verified project tree, including this plan.
      Exclude `.git`, `node_modules`, `.svelte-kit`, `build`, `.wrangler`, test-results,
      browser reports, caches, and `.DS_Store`.
- [x] Remove the old `svelte.config.js` and genuinely obsolete files; inspect the diff
      for lost changes, workflows, changesets, specifications, or executable bits.
- [x] Run a clean `npm ci` and repeat lint/check/build/unit/e2e in the main directory:
      project location and local links may have affected earlier results.
- [x] Update the README: Kit 3, Workers static assets, actual commands, and the existing
      local link/release flow.

Step 6 checkpoint (October 24, 2026; uncommitted changes in the original checkout):

- Original checkout started clean on `migrate/sk-3` at `bf73c07`; the verified sibling
  checkout was clean at `ba58ecc`. Reviewed the full replacement manifest before
  copying: 44 added files, 35 replacements, 127 identical existing files, and only
  two deletions (`svelte.config.js` and `.prettierrc`). No collisions with untracked
  or ignored local files were found.
- Copied only tracked files from the sibling project, preserving regular-file modes
  and symlink targets. Kept the original `.git`, local files and evidence directory.
  Preserved the current `docs/plan.md`, which is not present in the sibling scaffold.
- Preserved `sonar-project.properties -> .sonarcloud.properties`, executable shell
  scripts/hooks, all pending changesets, workflows, release history and OpenSpec
  specifications. The updated Claude/Codex integrations and browser guidance are now
  available in the original checkout.
- Removed the unsupported Kit 2 `svelte.config.js` and the old `.prettierrc`;
  configuration now lives in `vite.config.ts` and `prettier.config.js`.
- Replaced the scaffold README with the original site's README, updating it for
  Kit 3, Workers static assets, actual verification commands, local Playwright CLI,
  and Changesets releases. Retained the chessboard development/release workflow and
  clarified that the linked package needs its exported `dist` entry points built.
  This documentation does not reintroduce the WON'T DO runtime link check.
- Confirmed parity with all sibling tracked files except the intentionally adapted
  README. The plan is retained as an additional original-repository file. No changes
  were made to the sibling checkout.

| Check in the original checkout        | Result                                                         |
| ------------------------------------- | -------------------------------------------------------------- |
| `npm ci --no-audit --no-fund`         | Passed; copied lockfile unchanged; no global packages to link  |
| `npm run format`                      | Passed                                                         |
| `npm run lint`                        | Passed                                                         |
| `npm run check`                       | Passed: 0 errors, 0 warnings                                   |
| `npm run build`                       | Passed with strict adapter-static; all nine HTML pages emitted |
| `npm run test:unit -- --run`          | Passed: 1 file, 11 tests                                       |
| `./node_modules/.bin/playwright test` | Passed: all 4 product E2E tests from the new location          |
| Tree/type/mode parity                 | Matches sibling tree except the adapted README                 |
| Git preservation                      | Branch and HEAD unchanged; no staged changes or agent commits  |
| Documentation and diff                | Local README links resolve; whitespace check passed            |

Manifest, check logs and results are under ignored `artifacts/migration-step6/`.
No browser packages were installed, no Git hooks or release/version commands were
invoked, and nothing was pushed or deployed. Stop here for user review and commit.
PR/CI/Cloudflare preview/release verification remains step 7.

### 7. Verify the PR and release

- [x] Prepare the migration commit/PR after completing the local port; preserve repository history.
- [x] Confirm CI passes on the actual Node matrix, including Node 22 at version 22.17 or later.
- [x] Verify the Cloudflare PR preview, existing e2e tests against its deployment URL,
      direct URLs, slash redirects, and assets.
- [x] Add a changeset for `@mirasen/main-website` through the established release flow;
      preserve pending changesets and do not reset the version to the scaffold's `0.0.1`.
- [ ] After merge, verify the normal version/tag/release/deploy flow and production smoke checks.
      Publishing and merging are separate later actions after local migration review.

Step 7 checkpoint (October 24, 2026; PR head `42c2929`):

- Opened [PR #185](https://github.com/mirasen-io/cloudflare-site/pull/185) and marked
  it ready for review at the user's request. No agent commit, push or merge occurred.
- [CI run 40101620913](https://github.com/mirasen-io/cloudflare-site/actions/runs/40101620913)
  passed: check, tests on Node 22/24/26, Cloudflare and both required aggregate jobs.
  The Node 22 job used v22.23.3 and passed all 11 unit tests and 4 E2E tests.
  CodeQL also passed.
- Cloudflare uploaded version `5cbd3b21-1703-4790-887a-ab47d9fd319f`. All 4 existing
  E2E tests passed against the immutable preview URL in CI.
  [Preview alias](https://pr-185-cloudflare-site.k-tarmyshov.workers.dev).
- Independently checked the immutable preview: all 9 direct routes and 28 linked
  assets returned 200; all 8 non-root slash URLs redirected to slashless paths;
  unknown and removed demo URLs returned 404.
- Inspected the preview at 390x844 and 1440x900, including the open mobile menu
  with a light system preference: dark color scheme, native menu anchors, no
  horizontal overflow and no page errors in the checked state. HTTP results and
  screenshots are retained under ignored `artifacts/migration-step7/`.
- Prepared `.changeset/sveltekit-3-migration.md` locally with a minor bump for
  `@mirasen/main-website`. `changeset status` accepts it and proposes 1.4.0 while
  preserving all pending patch changesets. It still needs the user's commit/push;
  the current PR head does not contain it, so the changeset bot warning is expected.
- Formatting and whitespace checks passed. Production release/deployment and
  post-merge smoke checks remain pending; no production deployment was performed.

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

- Commit and push the prepared migration changeset, then verify checks on the new
  PR head. The current `42c2929` head passed CI and preview checks.
- The normal Changesets version/tag/release/deploy flow and production smoke checks
  after the migration is reviewed and merged.
- The optional local-link runtime check is WON'T DO by user decision; it is not
  outstanding work. Registry-mode clean installation, SSR/hydration, UI behavior,
  static output and product tests passed in both the sibling and original checkout.

Steps 1–6 are complete locally. The user committed step 6 as `0d1c1d5` in the
original repository on `migrate/sk-3`, followed by the always-dark theme fix
(`07d8ed5`) and native Skeleton menu links (`e9edd07`). These follow-up changes
passed format/lint/check/build, and the menu change passed all 11 unit tests,
all 4 existing E2E tests, Svelte autofixer and targeted desktop/mobile browser
checks for keyboard navigation, focus restoration and native link activation.
The working tree was clean when this status was reviewed. The sibling project
remains unchanged. Step 7 PR/CI/preview checks passed for `42c2929`. The migration changeset and
updated plan remain local for user review and commit. Post-merge release and
production checks remain pending. No agent commit, push, merge or production
deployment occurred; the PR workflow uploaded only a preview version.
