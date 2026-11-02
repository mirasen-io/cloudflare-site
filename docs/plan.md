# mirasen libraries site transition plan

Status: the library-site migration is implemented on the five existing PR branches. The owner renamed the existing Worker to `mirasen` and manually saved the organization and four repository Website fields; all seven settings values have now been independently verified with GitHub GET APIs. The site config and active links now use `https://mirasen.k-tarmyshov.workers.dev`. All five PRs remain open. Local validation and CI/preview checks for the pushed migration changes have passed. Merges, releases, production smoke tests, and SEO/indexing follow-up remain open.
Updated: 2026-11-02.

## Goal and decisions

Convert the current chess-learning product landing site into a small, durable **mirasen open-source libraries** site. Keep the existing Cloudflare Workers Static Assets hosting and GitHub Actions deployment, using the existing Cloudflare Worker named `mirasen`.

The site should present only these three published packages:

1. [`@mirasen/chessboard`](https://github.com/mirasen-io/chessboard) — framework-agnostic core chessboard library.
2. [`@mirasen/react-chessboard`](https://github.com/mirasen-io/react-chessboard) — React integration, distinct from the core package.
3. [`@mirasen/license-gate`](https://github.com/mirasen-io/license-gate) — npm license policy tool.

Do **not** advertise Chess Lore as an active product, structured chess learning, planned training workflows, or the product slogan **"Become Dangerous"**. Preserve `mirasen` as the lowercase brand and existing npm scope and GitHub organization names. This is a site repositioning and link migration, not a request to delete other project repositories or rename library packages.

## Already completed — do not repeat

- `mirasen.io` Registrar auto-renewal is off; registration ends **2027-03-11**.
- Historical deployment: the existing Worker was first renamed from `cloudflare-site` to `chessboard`; PR #193 set `wrangler.jsonc` to that name. The [v1.4.2 deployment](https://github.com/mirasen-io/cloudflare-site/actions/runs/41410706342) printed `https://chessboard.k-tarmyshov.workers.dev`. These records describe the earlier state.
- The owner has since renamed that **same existing Worker** from `chessboard` to `mirasen`, preserving its deployment history and existing `mirasen.io` route. The owner confirmed the new URL works. This branch now sets `wrangler.jsonc` `name` to `mirasen` while retaining the static assets directory, HTML handling, compatibility date/flags, and Workers deployment architecture.
- A read-only HTTP check on 2026-11-02 returned 200 for the new origin, all seven library/example paths, `robots.txt`, and `sitemap.xml`. `/chess-lore` also returned 200 on the currently published service, so retirement is not yet confirmed on production and must be checked after the approved cutover.
- The owner manually saved GitHub organization profile fields and the four repository Website fields. Current values were independently verified with GET APIs; see section 4.

**Final canonical origin:** `https://mirasen.k-tarmyshov.workers.dev`. Keep existing working routes at this origin. `https://chessboard.k-tarmyshov.workers.dev` is a superseded deployment hostname, not a current target. Keep the existing `mirasen.io` binding until the owner separately approves any DNS/route changes; the domain registration currently ends **2027-03-11**.

## 0. Mandatory discovery and impact audit — completed before implementation

The discovery audit below was completed before implementation. The initial inventory remains a record of pre-change findings; the completed audit and verified outcomes follow it.

- [x] Establish the actual current publishing surface: routes, layouts, navigation, shared components, public/static assets, generated SvelteKit output, Cloudflare configuration and scripts, README/docs, CI/release configuration, and links exposed by the three npm packages and the GitHub organization.
- [x] Search all **active** site source/config, the `.github` organization profile, and the three library repositories for variations of `mirasen.io`, `cloudflare-site`, `chess-lore` / `Chess Lore`, `Become Dangerous`, `structured chess learning`, marketing promises about an upcoming trainer/product, and related copy. Record file path, current behavior, and required action for each occurrence; distinguish user-facing copy from legitimate history and identifiers.
- [x] Inventory _every_ absolute URL and external presentation surface: HTML title/description, canonical links, Open Graph / Twitter metadata if present, structured data, navigation/footer, GitHub repository About/Homepage and organization settings, npm package homepages and README demo URLs. Do not assume a GitHub code-search query is exhaustive; inspect actual live source and compiled page output.
- [x] Audit crawl/index entry points and legacy addresses: `robots.txt`, `sitemap.xml` or sitemap generation **if present**, metadata in prerendered output, Cloudflare bindings/redirects, and URLs previously indexed for `mirasen.io`. Check whether `/chess-lore` should return 404/410 or redirect to an appropriate surviving page; do not blindly redirect product traffic to an unrelated library page.
- [x] Audit the distinct role of each library: core `@mirasen/chessboard`, React wrapper `@mirasen/react-chessboard`, and `@mirasen/license-gate`. Use accurate descriptions on the website and record outdated external organization copy as a follow-up.
- [x] Produce a concrete audit inventory (file/location → current text or metadata → change/keep/delete → validation) and resolve any additional findings **before** implementing migration. Extend this plan with newly verified paths; preserve historical releases, archived specs, and audit logs as historical records.
- [x] Decide on the final information architecture and SEO strategy (homepage as library catalog, routes for three libraries, existing chessboard demos, retired Chess Lore URL), including a consistent canonical hostname `https://mirasen.k-tarmyshov.workers.dev`.

### Pre-implementation audit findings verified in repository (2026-11-02)

- `src/routes/+page.svelte`: product-focused hero, "Become Dangerous", Chess Lore marketing; inline `Organization` and `WebSite` JSON-LD plus canonical and Open Graph.
- `src/routes/chessboard/+page.svelte`: Chess Lore/product-ecosystem positioning; inline **two** `SoftwareSourceCode` nodes (core and React), publisher `Organization` references, live-example URLs, canonical and Open Graph.
- `src/routes/license-gate/+page.svelte`: `SoftwareSourceCode` JSON-LD with publisher `Organization`; canonical and Open Graph.
- `src/routes/chess-lore/+page.svelte`: old product page with `SoftwareApplication` JSON-LD, old-domain URL and product metadata; this route is to be retired.
- `src/routes/chessboard/examples/+page.svelte` and the four example pages (`minimal`, `chessjs`, `promotion`, `live-games-grid`): hardcoded old-domain canonical/OG URLs, though no JSON-LD was found in those examined files.
- `src/routes/+layout.svelte`: old product slogan in footer. `src/lib/nav/links.ts`: Chess Lore navigation link. `README.md`: old-domain site description.
- Outside site source: old domain occurs in library `package.json` homepages and core/React README demo links; `mirasen-io/.github/profile/README.md` still presents Chess Lore as a product. Public GitHub repository homepage fields for core and React also use old domain.
- JSON-LD is **constructed inline inside `.svelte` files**, via `JSON.stringify` and injected `<script type="application/ld+json">` strings; it is not a separately maintained collection of `.json` files.

### Discovery audit completed for this website-repository change (2026-11-02)

The active publishing surface was inspected before implementation: `src/routes/**`, shared navigation and layout, active CSS, `static/**`, `README.md`, `wrangler.jsonc`, Vite/adapter setup, `.changeset/config.json`, and CI/release workflows. The sitemap is a hand-maintained static file (no generator); `robots.txt` allowed crawling but did not advertise the sitemap. At the initial inspection the Worker config targeted `chessboard` and `./build` with `html_handling: drop-trailing-slash`; the active PR now changes only the Worker name to `mirasen`; release CI uses the existing repository slug as a guard, which remains valid and is intentionally unchanged. Historical `openspec/changes/archive/**`, release records, and this plan retain old references as history and are not active website output.

| File/location                                                | Pre-change finding                                       | Implemented action                                                                        | Verified outcome                                                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/routes/+page.svelte`                                    | Product story, old host and Organization/WebSite JSON-LD | Three-library catalog, Worker metadata, stable entity IDs, lowercase brand                | Built root HTML has aligned canonical/OG and two parseable JSON-LD scripts                           |
| `src/routes/chess-lore/+page.svelte`, `src/lib/nav/links.ts` | Product route, JSON-LD and shared nav entry              | Deleted route/nav entry; selected 404                                                     | Preview returns 404; desktop/mobile nav expose the surviving library pages                           |
| `src/routes/chessboard/+page.svelte`                         | Core and React entities mixed with product positioning   | Separate core and React roles and links; keep demos                                       | Built graph parses and preserves distinct repository/npm identities                                  |
| `src/routes/license-gate/+page.svelte`                       | Useful technical page with old metadata                  | Preserve technical content and move metadata to Worker origin                             | Built JSON-LD parses and canonical/OG match                                                          |
| `src/routes/chessboard/examples/**/+page.svelte`             | Working examples with old canonical/OG host              | Preserve routes and update metadata and brand casing                                      | Preview E2E passes; generated canonical/OG uses target origin                                        |
| Layout, navigation and active styles                         | Old slogan, retired nav item and obsolete style          | Library footer/nav; remove stale CSS                                                      | Visual check at 1440×900 and 390×844; mobile menu works without overflow                             |
| `static/sitemap.xml`, `static/robots.txt`                    | Old host and retired URL; no sitemap declaration         | Update surviving URLs, omit retired route and declare sitemap                             | XML has eight unique target-origin URLs; preview serves both files                                   |
| `README.md`, Changesets config and website changelog         | Old site description and generated changelog             | Update README, disable changelog output, remove website changelog and add patch changeset | Changesets resolves 1.4.3; temporary version check did not regenerate changelog                      |
| `wrangler.jsonc`, `vite.config.ts`, CI/release workflows     | Existing Worker/static assets and deployment path        | Keep hosting and workflow setup unchanged                                                 | Final-host CI and Cloudflare preview passed on the pushed PR code head; no production deployment ran |

External read-only audit at the start of this migration found stale organization/profile and library links. The follow-up PRs documented below have corrected the active repository files. The initial findings remain a historical record; current independently verified settings and branch results are listed in sections 3 and 4. Published npm metadata remains unchanged until a future approved package release. The three packages' roles remain distinct as documented above.

The focused audit also found pre-migration content in the unarchived OpenSpec files `openspec/specs/license-gate-page/spec.md`, `openspec/specs/chessboard-examples-minimal/spec.md`, and `openspec/specs/chessboard-examples-live-grid/spec.md`. They retain old `mirasen.io` canonical examples, uppercase `Mirasen`, and former Chess Lore navigation requirements. These specifications are not included in the website build and describe the earlier site state; they are preserved as historical records rather than mechanically rewritten. The five PR heads are clear of obsolete host/product/brand references in active public files. Until the PRs merge, each default `main` branch still reflects its pre-PR state: the website main branch retains the former product site; core, React, and License Gate main branches retain old links/uppercase branding; and the organization profile main branch retains the former product copy.

- The live Worker origin and example index returned HTTP 200 during discovery. The currently deployed `/chess-lore` still serves the old page (also HTTP 200); that is the existing deployment, not evidence for the post-migration route. The new static build omits the page, and the PR preview returned 404 for it. Verify its retirement again after the approved production cutover.
- Sitemap generation is not present, and there is no website redirect configuration to preserve. Removing the Svelte route therefore selects the framework's retired-route/404 behavior; no unrelated redirect is added.

## 1. Reposition the website as a library catalog

Repository: [`mirasen-io/cloudflare-site`](https://github.com/mirasen-io/cloudflare-site).

- [x] `src/routes/+page.svelte`: replace product-oriented hero, "Become Dangerous", trainer/learning features, Chess Lore promotion, and "ecosystem/future product" sections with an accurate, concise landing page for the **three libraries**. Provide GitHub and npm links for each; direct chessboard users to the live examples.
- [x] `src/routes/chess-lore/+page.svelte`: remove this product marketing route and its structured data. Check for internal references and remove them; keep unrelated chess learning source repositories untouched.
- [x] `src/lib/nav/links.ts`: remove `/chess-lore` from `pageNavCommon` and link the surviving Chessboard and License Gate pages in desktop/mobile navigation. The homepage catalog links all three packages; the Chessboard page also links the React integration.
- [x] `src/routes/chessboard/+page.svelte`: remove assertions that chessboard exists to support Chess Lore or a learning-product ecosystem, as well as links back to Chess Lore. Present the core and React integration on their own merits, with clear separate npm/GitHub links. Preserve existing functional examples and accurate API descriptions.
- [x] `src/routes/license-gate/+page.svelte`: retain the useful technical page; adjust only common site framing/metadata and URL.
- [x] `src/routes/+layout.svelte`: remove the product tagline ("Structured chess learning. Become Dangerous."); keep a minimal, library-oriented footer and navigation.
- [x] Recheck `src/lib/components/AppBar.svelte`, the shared navigation, styling, and responsive E2E expectations after removing a nav item. Do not rebrand library code or overhaul design unnecessarily.
- [x] `README.md`: describe the site as a mirasen libraries/demo site on Workers rather than the former `mirasen.io` product landing site. Keep current development/release instructions accurate.

## 2. Update hardcoded domain and metadata references

Initial source paths recorded before the migration (each contained `https://mirasen.io`):

- [x] `src/routes/+page.svelte` — canonical/OG URLs, JSON-LD organization/website URLs; rewrite SEO descriptions around libraries, not Chess Lore.
- [x] `src/routes/chessboard/+page.svelte` — `pageUrl`, `examplesUrl`, `orgUrl`, JSON-LD publisher and descriptions.
- [x] `src/routes/license-gate/+page.svelte` — `pageUrl`, `orgUrl`, canonical/OG/JSON-LD.
- [x] `src/routes/chessboard/examples/+page.svelte` — canonical/OG.
- [x] `src/routes/chessboard/examples/minimal/+page.svelte` — canonical/OG.
- [x] `src/routes/chessboard/examples/chessjs/+page.svelte` — canonical/OG.
- [x] `src/routes/chessboard/examples/promotion/+page.svelte` — canonical/OG.
- [x] `src/routes/chessboard/examples/live-games-grid/+page.svelte` — canonical/OG.
- [x] Remove obsolete metadata for the deleted `/chess-lore` page.
- [x] Search remaining live source/config/docs for `mirasen.io`, `Chess Lore`, `Become Dangerous`, the superseded workers.dev hostname, and old Worker names used as active deployment identifiers. Do **not** mechanically rewrite archived specifications, release history, or other historical records that accurately describe the past.

Preserve the working route structure under `/chessboard`, `/chessboard/examples`, and `/license-gate` to avoid needless broken links. Check both `.html` and extensionless demo links (both forms exist in current package READMEs), since Workers Static Assets uses `html_handling: drop-trailing-slash`.

## 2a. JSON-LD / Google Knowledge Graph and structured data audit

Google's understanding of the brand and its products must reflect **real open-source libraries**, not the abandoned learning-product narrative. Treat structured data as a separate review, not just string replacement.

- [x] `src/routes/+page.svelte`: revisit both `organizationLd` (`@type: Organization`) and `websiteLd` (`@type: WebSite`). Replace `url` and misleading learning-product `description`; keep factual `sameAs` links to mirasen GitHub/npm. Decide whether consistent, stable `@id` references would improve entity identification; do not invent claims or markup solely for search ranking.
- [x] `src/routes/chessboard/+page.svelte`: audit the complete `@graph`: core and React `SoftwareSourceCode` entities, `codeRepository`, `sameAs`, `subjectOf`, `isBasedOn`, `publisher` `Organization` node, descriptions, page/example URLs. Remove misleading references to the training-product ecosystem. Keep **core and React distinct**; link each to its actual repo/npm page.
- [x] `src/routes/license-gate/+page.svelte`: verify the `SoftwareSourceCode` object, publisher, `url`, and `subjectOf` README/changelog references against the published License Gate project and new URL.
- [x] `src/routes/chess-lore/+page.svelte`: delete/retire the `SoftwareApplication` JSON-LD and product metadata together with the old page; ensure it cannot still be emitted by prerendered files or referenced from active site markup.
- [x] Audit JSON-LD **consistency across pages**: canonical URL and `og:url` match structured-data `url` values, organization identity/name and links stay consistent, and no dangling `@id`, `subjectOf`, `publisher`, `sameAs`, or references to retired routes remain.
- [x] Verify the built HTML contains valid parseable `application/ld+json` script content (not double-escaped, duplicated, or missing after prerender). Inspect structured data in output, not only Svelte source.
- [ ] Validate relevant page URLs/markup with Google's [Rich Results Test](https://search.google.com/test/rich-results) **where applicable** and [Schema Markup Validator](https://validator.schema.org/). The former checks Google's supported rich-result features, **not** a guarantee of Knowledge Graph inclusion or search placement.
- [ ] Review the current public indexing/Google Search Console situation, if accessible, after the hostname change. Reindexing and knowledge-graph behavior cannot be inferred from passing JSON syntax validation; plan to verify indexed URLs and outdated snippets later.

## 3. Update the three library repositories

Each repository should have a **separate, focused change** following its own `AGENTS.md` and validation workflow.

| Repository                                                           | Initial audit findings (before the follow-up PRs)                                                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [`chessboard`](https://github.com/mirasen-io/chessboard)             | `package.json` homepage and four README demos used `mirasen.io`; README and GitHub About description used uppercase `Mirasen`.            |
| [`react-chessboard`](https://github.com/mirasen-io/react-chessboard) | `package.json` homepage and four README demos used `mirasen.io`; README used uppercase `Mirasen`.                                         |
| [`license-gate`](https://github.com/mirasen-io/license-gate)         | `package.json` homepage used `mirasen.io`; GitHub repository About → Website was empty when checked. README live links still need review. |

### Chessboard library follow-up — 2026-11-02

- [x] `chessboard`: updated package homepage to `https://mirasen.k-tarmyshov.workers.dev/chessboard`, all four active README demo URLs, and lowercase maintained brand copy; preserved the existing patch changeset. [PR #150](https://github.com/mirasen-io/chessboard/pull/150) remains open against `main`.
- [x] `react-chessboard`: updated package homepage to the `/chessboard` route, all four active README demo URLs, and lowercase maintained brand copy; preserved the existing patch changeset and the distinct React integration identity. [PR #123](https://github.com/mirasen-io/react-chessboard/pull/123) remains open against `main`.
- [x] `license-gate`: updated the package homepage to `https://mirasen.k-tarmyshov.workers.dev/license-gate`; active README has no website/demo URL to replace and its copyright brand is lowercase. Preserved the patch changeset and historical changelogs. [PR #46](https://github.com/mirasen-io/license-gate/pull/46) remains open against `main`.
- [x] Independently verified core and React About → Website as `https://mirasen.k-tarmyshov.workers.dev/chessboard`; License Gate as `https://mirasen.k-tarmyshov.workers.dev/license-gate`. The core About description remains `mirasen chessboard — open-source TypeScript chessboard library.`

Validation: after the hostname updates, formatting, lint, TypeScript checks, package builds/publint, Changesets status, and unit suites passed for all three packages. Core tests: 1,618; React: 21; License Gate: 173. Website validation results are in section 6. Package homepages take effect on npm only with a future approved package release; no release was created.

### License Gate follow-up — 2026-11-02

- [x] Updated `@mirasen/license-gate` package homepage to the Worker `/license-gate` route and lowercased the package author and README copyright. The README has no stale website or former-product copy; historical changelog content was preserved. Added a patch changeset. [PR #46](https://github.com/mirasen-io/license-gate/pull/46) is open against `main`.
- [x] Verified the License Gate GitHub About description remains accurate and its Website is `https://mirasen.k-tarmyshov.workers.dev/license-gate`; no manual description change was needed.
- [x] `npm run lint`, `npm run check`, `npm test`, `npm run build`, and `npx changeset status` pass; all 173 License Gate tests pass and publint validates the package.

- [x] Reviewed organization and library About/Website metadata; the owner manually updated the organization fields and the four repository Website fields. Their current API values are independently verified in section 4. Do not rename package repositories.
- Note: changing source `package.json` does not retroactively edit npm metadata of already-published versions. New `homepage` metadata reaches npm when the library is next published; avoid gratuitous releases solely for metrics.
- [x] Searched the public `mirasen-io` repository list and GitHub code-search results for stale host/product links. No additional public repositories beyond these five active PR targets were found. The default `main` branch of `chessboard` still contains the previous `mirasen.io` package/demo links until PR #150 merges; this task updates only the existing PR branch. No unrelated repository changes were made.

## 4. GitHub organization profile and settings

- [x] Updated `profile/README.md` to a lowercase `mirasen` catalog of the three libraries, with final Worker, GitHub, and npm links and no former product positioning. [PR #1](https://github.com/mirasen-io/.github/pull/1) remains open against `main`.
- [x] The owner manually saved organization **Settings → Profile**. Independent GET `/orgs/mirasen-io` verification on 2026-11-02 returned **Name** `mirasen`, **Description** `Open-source chessboard libraries and npm license tooling from mirasen.`, and **Website/blog** `https://mirasen.k-tarmyshov.workers.dev`; all three match the requested values. The earlier values (`Mirasen`, product description, and `https://mirasen.io`) are preserved here as initial-audit history only.
- [x] Independently verified repository Website values with GET `/repos/mirasen-io/{repo}` on 2026-11-02: `cloudflare-site` → `https://mirasen.k-tarmyshov.workers.dev`; `chessboard` and `react-chessboard` → `https://mirasen.k-tarmyshov.workers.dev/chessboard`; `license-gate` → `https://mirasen.k-tarmyshov.workers.dev/license-gate`. All four match. The owner manually saved these fields; no Settings were modified in this task.
- [x] Verified the core repository About description is `mirasen chessboard — open-source TypeScript chessboard library.`; React and License Gate descriptions remain accurate and product-free. `.github` and `cloudflare-site` About descriptions are blank. Keep repository/org identifiers unchanged.

### Final Worker hostname and coordinated PRs — 2026-11-02

- [x] Set the final canonical origin to `https://mirasen.k-tarmyshov.workers.dev`. The former `chessboard.k-tarmyshov.workers.dev` target is superseded; retain it only in historical deployment/audit records.
- [x] Owner-confirmed: renamed the **existing** Cloudflare Worker from `chessboard` to `mirasen`; no second Worker was requested. `wrangler.jsonc` on PR #194 now names `mirasen` and preserves the existing static assets configuration, compatibility settings, and deployment architecture. The GitHub repository remains `cloudflare-site` and all repository identifier guards remain intact.
- [x] Read-only HTTP check of the final origin returned HTTP 200 for `/`, `/chessboard`, `/chessboard/examples`, each of the four examples, `/license-gate`, `robots.txt`, and `sitemap.xml`. The currently published `/chess-lore` also returned HTTP 200; retirement must be verified on the PR preview and after the approved production cutover.
- [x] Updated active website metadata, JSON-LD URLs/entity references, sitemap, robots, README, library package homepages and demos, and organization profile links across the existing PR heads.
- [x] Updated all five existing PR branches, without creating replacements: cloudflare-site #194 (`migrate/library-only`), chessboard #150, react-chessboard #123, license-gate #46, and `.github` #1. Current head SHAs are in the task report; CI and preview outcomes are recorded below.
- [x] Independently verified organization and repository settings through GitHub GET APIs; exact values are in section 4. No organization or repository Settings were changed in this task.
- [ ] Merge the five reviewed PRs only after the owner approves them. Package releases, website version/tag/release, and production deployment remain pending and are not part of this task.
- [ ] After the approved production deployment, verify the existing `mirasen` Worker deployment, the `mirasen.io` binding, all public routes, and retired `/chess-lore` behavior. Do not assume the former workers.dev hostname redirects.

### Final pushed-head CI and Cloudflare preview — 2026-11-02

- [x] cloudflare-site PR #194: `check`, Node 22/24/26 tests, `cloudflare`, `required-contribution`, `required-main`, and CodeQL passed. The preview job ran `wrangler versions upload --preview-alias pr-194 --tag 054f0ade16028960f08adb6f7525ee6fa945d38c`, reported `Uploaded mirasen`, and produced `https://efd6b3be-mirasen.k-tarmyshov.workers.dev` plus alias `https://pr-194-mirasen.k-tarmyshov.workers.dev`. E2E against that preview passed; preview routes and metadata were also checked, including `/chess-lore` → 404. Wrangler output explicitly described `versions deploy` as the production step; it was not run.
- [x] chessboard PR #150: CI check, tests on Node 22/24/26, required-contribution/main, CodeQL, and Snyk status passed.
- [x] react-chessboard PR #123: CI check, tests on Node 22/24/26, required-contribution/main, CodeQL, and Snyk status passed.
- [x] license-gate PR #46: CI check, tests on Node 22/24/26, required-contribution/main, and CodeQL passed.
- [x] `.github` PR #1 has no configured CI workflow; `git diff --check` and link checks passed.
- [x] The subsequent plan-only cloudflare-site commit `ba8e86b` also passed `check`, Node 22/24/26 tests, the Cloudflare preview/E2E, required-contribution, and CodeQL. Its preview log ran `wrangler versions upload --preview-alias pr-194 --tag ba8e86be5d4b4437a769edcf6afd21aa41555866`, reported `Uploaded mirasen`, and returned `https://0520c7f5-mirasen.k-tarmyshov.workers.dev` plus the `pr-194-mirasen` alias; production `versions deploy` was not run.

All PRs remain open. The follow-up changes in this plan are documentation-only and do not change the validated site source or deployment configuration. No PR was merged, no package published, no GitHub Release created, and no production deployment performed.

## 5. Website changelog and repository identity

- [x] Remove `CHANGELOG.md` **from the website repository only**, as requested. Keep library changelogs.
- [x] In website `.changeset/config.json`, change `"changelog": "@changesets/cli/changelog"` to **`"changelog": false`** so future version bumps do not recreate it (official Changesets config supports this). Keep `privatePackages.version: true`, `privatePackages.tag: true`, GitHub Releases and existing release/deploy behavior.
- [x] Verify Changesets status/version handling and confirm the configured version step does not regenerate `CHANGELOG.md` (verified in a temporary copy).
- [ ] Verify Git tags, GitHub Release creation, and Wrangler deployment in the later release workflow; this remains pending until an approved production cutover.
- [x] Keep the GitHub repository name `cloudflare-site`; this migration does not rename it. Preserve its existing CI/release identifier guards (`mirasen-io/cloudflare-site`).

## 6. Validation and cutover

- [x] Confirm the discovery/impact audit above is complete, all new findings are documented, and the intended structure for retired product routes is explicitly resolved.
- [x] Inspect **generated** HTML for JSON-LD validity and alignment with title, canonical, and OG metadata; verify no references to Chess Lore or old hostname remain on active pages.
- [ ] After the owner-approved production deployment, test the homepage, package GitHub/npm links, License Gate page, all four interactive chessboard examples, and desktop/mobile navigation at `https://mirasen.k-tarmyshov.workers.dev`. Confirm `/chess-lore` is retired in the deployed output.
- [ ] After cutover, verify production canonical, OG, and JSON-LD URLs resolve to the final origin and no active page advertises Chess Lore or the former slogan. Run Rich Results Test/Schema Markup Validator where applicable and check Search Console/indexed URLs and stale snippets.
- [x] Website checks passed: `npm run format`, `npm run lint`, `npm run check`, `npm run build`, `npm run test:unit -- --run` (11 passed), E2E (4 passed), and `npx changeset status`. Generated HTML has matching canonical/OG URLs and parseable JSON-LD; the sitemap has eight unique final-origin URLs and robots.txt points to it. A local Wrangler Static Assets run reports Worker `mirasen`, serves all retained routes, and returns 404 for `/chess-lore`. Desktop (1440×900) and mobile (390×844) navigation were checked; links are available and no horizontal overflow occurs. CI and the Cloudflare PR preview passed on migration source commit `054f0ad`; the subsequent plan-only commit's CI and preview are recorded above.
- [ ] Pending owner action: merge the five open PRs, then use the existing Changesets → GitHub Release → Wrangler workflow for the website and publish package releases when desired. Confirm production deploy targets the existing `mirasen` Worker in logs; no merge, release, or production deploy was run here.
- [ ] After cutover, the owner should verify the existing Cloudflare `mirasen.io` binding/route and other consumers before the domain registration expires; do not remove the live site, DNS, or Worker for this migration.
- [ ] Confirm the final destination remains reachable independently of `mirasen.io` before **2027-03-11**.

## Out of scope

No deletion of the GitHub organization, library packages, or historical GitHub releases. No new Cloudflare application. No architectural refactor or replacement deployment system. No migration of archived documents simply to erase historical mention of the former domain.
