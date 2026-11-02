# mirasen libraries site transition plan

Status: planning only — no implementation changes in this branch beyond this document.
Updated: 2026-11-02.

## Goal and decisions

Convert the current chess-learning product landing site into a small, durable **mirasen open-source libraries** site. Keep the existing Cloudflare Workers Static Assets hosting and GitHub Actions deployment, now using the Worker named `chessboard`.

The site should present only these three published packages:

1. [`@mirasen/chessboard`](https://github.com/mirasen-io/chessboard) — framework-agnostic core chessboard library.
2. [`@mirasen/react-chessboard`](https://github.com/mirasen-io/react-chessboard) — React integration, distinct from the core package.
3. [`@mirasen/license-gate`](https://github.com/mirasen-io/license-gate) — npm license policy tool.

Do **not** advertise Chess Lore as an active product, structured chess learning, planned training workflows, or the product slogan **"Become Dangerous"**. Preserve `mirasen` as the lowercase brand and existing npm scope and GitHub organization names. This is a site repositioning and link migration, not a request to delete other project repositories or rename library packages.

## Already completed — do not repeat

- `mirasen.io` Registrar auto-renewal is off; registration ends **2027-03-11**.
- The **existing** Cloudflare Worker was renamed from `cloudflare-site` to `chessboard` in the dashboard, preserving its deployment history and the `mirasen.io` route.
- [PR #193](https://github.com/mirasen-io/cloudflare-site/pull/193) set `wrangler.jsonc` `name` to `chessboard` on `main`. PR previews and E2E passed.
- The [v1.4.2 release deployment](https://github.com/mirasen-io/cloudflare-site/actions/runs/41410706342) succeeded and printed `https://chessboard.k-tarmyshov.workers.dev`.

**Target origin:** `https://chessboard.k-tarmyshov.workers.dev`. Keep existing working paths when replacing the origin, subject to URL verification. The old `mirasen.io` URL can remain active until expiry; do not remove its routing prematurely.

## 0. Mandatory discovery and impact audit — BEFORE implementation

**Do this first.** The file inventory below is a verified starting point, **not** a claim that all obsolete product references or SEO surfaces have already been found. Investigate the entire active website and its public-facing integrations before changing pages or publishing new library metadata.

- [ ] Establish the actual current publishing surface: routes, layouts, navigation, shared components, public/static assets, generated SvelteKit output, Cloudflare configuration and scripts, README/docs, CI/release configuration, and links exposed by the three npm packages and the GitHub organization.
- [ ] Search all **active** site source/config, the `.github` organization profile, and the three library repositories for variations of `mirasen.io`, `cloudflare-site`, `chess-lore` / `Chess Lore`, `Become Dangerous`, `structured chess learning`, marketing promises about an upcoming trainer/product, and related copy. Record file path, current behavior, and required action for each occurrence; distinguish user-facing copy from legitimate history and identifiers.
- [ ] Inventory _every_ absolute URL and external presentation surface: HTML title/description, canonical links, Open Graph / Twitter metadata if present, structured data, navigation/footer, GitHub repository About/Homepage and organization settings, npm package homepages and README demo URLs. Do not assume a GitHub code-search query is exhaustive; inspect actual live source and compiled page output.
- [ ] Audit crawl/index entry points and legacy addresses: `robots.txt`, `sitemap.xml` or sitemap generation **if present**, metadata in prerendered output, Cloudflare bindings/redirects, and URLs previously indexed for `mirasen.io`. Check whether `/chess-lore` should return 404/410 or redirect to an appropriate surviving page; do not blindly redirect product traffic to an unrelated library page.
- [ ] Audit the distinct role of each library: core `@mirasen/chessboard`, React wrapper `@mirasen/react-chessboard`, and `@mirasen/license-gate`. Ensure the redesign and organization descriptions accurately represent published packages rather than product hypotheses or planned features.
- [ ] Produce a concrete audit inventory (file/location → current text or metadata → change/keep/delete → validation) and resolve any additional findings **before** implementing migration. Extend this plan with newly verified paths; preserve historical releases, archived specs, and audit logs as historical records.
- [ ] Decide on the final information architecture and SEO strategy (homepage as library catalog, routes for three libraries, existing chessboard demos, retired Chess Lore URL), including a consistent canonical hostname `https://chessboard.k-tarmyshov.workers.dev`.

### Preliminary audit findings verified in repository (2026-11-02)

- `src/routes/+page.svelte`: product-focused hero, "Become Dangerous", Chess Lore marketing; inline `Organization` and `WebSite` JSON-LD plus canonical and Open Graph.
- `src/routes/chessboard/+page.svelte`: Chess Lore/product-ecosystem positioning; inline **two** `SoftwareSourceCode` nodes (core and React), publisher `Organization` references, live-example URLs, canonical and Open Graph.
- `src/routes/license-gate/+page.svelte`: `SoftwareSourceCode` JSON-LD with publisher `Organization`; canonical and Open Graph.
- `src/routes/chess-lore/+page.svelte`: old product page with `SoftwareApplication` JSON-LD, old-domain URL and product metadata; this route is to be retired.
- `src/routes/chessboard/examples/+page.svelte` and the four example pages (`minimal`, `chessjs`, `promotion`, `live-games-grid`): hardcoded old-domain canonical/OG URLs, though no JSON-LD was found in those examined files.
- `src/routes/+layout.svelte`: old product slogan in footer. `src/lib/nav/links.ts`: Chess Lore navigation link. `README.md`: old-domain site description.
- Outside site source: old domain occurs in library `package.json` homepages and core/React README demo links; `mirasen-io/.github/profile/README.md` still presents Chess Lore as a product. Public GitHub repository homepage fields for core and React also use old domain.
- JSON-LD is **constructed inline inside `.svelte` files**, via `JSON.stringify` and injected `<script type="application/ld+json">` strings; it is not a separately maintained collection of `.json` files.

### Discovery audit completed for this website-repository change (2026-11-02)

The active publishing surface was inspected before implementation: `src/routes/**`, shared navigation and layout, active CSS, `static/**`, `README.md`, `wrangler.jsonc`, Vite/adapter setup, `.changeset/config.json`, and CI/release workflows. The sitemap is a hand-maintained static file (no generator); `robots.txt` allowed crawling but did not advertise the sitemap. The Worker config already targets `chessboard` and `./build` with `html_handling: drop-trailing-slash`; release CI uses the existing repository slug as a guard, which remains valid and is intentionally unchanged. Historical `openspec/changes/archive/**`, release records, and this plan retain old references as history and are not active website output.

| File/location                                                                        | Audited current content or behavior                                                                                         | Action for this repository                                                                                                                          | Validation                                                                                       |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/routes/+page.svelte`                                                            | Product/trainer story, Chess Lore promotion, old domain, Organization and WebSite JSON-LD                                   | Replace with three accurately described library cards; canonical/OG and stable organization/site IDs use the Worker origin                          | Inspect built root HTML, links, metadata and parse both JSON-LD scripts                          |
| `src/routes/chess-lore/+page.svelte`, `src/lib/nav/links.ts`                         | Product page, SoftwareApplication JSON-LD, and shared desktop/mobile link                                                   | Delete route and remove nav entry; choose a 404 for the retired product URL rather than sending visitors to an unrelated library                    | Confirm generated assets omit the route and preview behavior; inspect both nav layouts           |
| `src/routes/chessboard/+page.svelte`                                                 | Core and React SoftwareSourceCode nodes existed but mixed the packages with Chess Lore/product-ecosystem positioning        | Keep the examples route; describe core and React separately and provide each GitHub/npm pair; use matching Worker canonical/OG and organization IDs | Parse graph and verify repository/package identities and example URLs                            |
| `src/routes/license-gate/+page.svelte`                                               | Useful technical documentation and SoftwareSourceCode metadata; old canonical, OG and publisher URL                         | Preserve technical content; move metadata/publisher identity to the Worker origin                                                                   | Parse JSON-LD and compare canonical/OG/page URL                                                  |
| `src/routes/chessboard/examples/**/+page.svelte` (index and four examples)           | Existing examples and working paths; canonical/OG URLs used `mirasen.io`                                                    | Preserve routes and behavior; update metadata origin                                                                                                | Check generated HTML for each canonical and OG URL                                               |
| `src/routes/+layout.svelte`, `src/lib/nav/links.ts`, `src/routes/mirasen-styles.css` | Slogan in footer; Chess Lore nav entry; a Chess Lore CSS comment and unused theme-list rule                                 | Use minimal library footer; make Chessboard and License Gate reachable in shared desktop/mobile nav; remove stale label/rule                        | Review rendered header/footer and active CSS references                                          |
| `static/sitemap.xml`, `static/robots.txt`                                            | Old host in all sitemap entries, retired `/chess-lore` listed; robots did not name the sitemap                              | Publish surviving routes on Worker host, omit retired path, declare the sitemap in robots                                                           | Parse generated XML, check uniqueness and route set                                              |
| `README.md`, `.changeset/config.json`, `CHANGELOG.md`                                | README described old domain; Changesets generated a changelog; repository changelog duplicated GitHub release history       | Describe Worker-hosted library/demo site; disable Changesets changelog generation and remove this repository's changelog only                       | Run Changesets status/version workflow checks and confirm release config/workflow remains intact |
| `wrangler.jsonc`, `vite.config.ts`, `.github/workflows/{ci,release}.yml`             | Existing Worker name, static assets directory, build adapter, preview/production deployment workflows and repository guards | Keep hosting and deployment architecture and workflow guards unchanged                                                                              | Build and inspect workflow/config diff; do not deploy                                            |

External read-only audit was also completed to honor the discovery requirement while keeping this task scoped to `cloudflare-site`:

- GitHub About/Website currently points to the Worker origin for `mirasen-io/cloudflare-site`, `chessboard`, `react-chessboard`, and `license-gate`. The organization profile README still describes Chess Lore and links to `mirasen.io`; organization description/blog settings also still describe the former product and old hostname. These are external follow-ups only and are not changed here.
- Current library source metadata and/or README demo links remain on the old hostname: core `package.json` homepage and four `.html` demo links; React `package.json` homepage and four extensionless demo links; License Gate `package.json` homepage. The published npm metadata will not change until a package is next published. The three packages' current descriptions confirm the distinct roles documented above. These repositories are not changed here.
- The live Worker origin and example index returned HTTP 200 during discovery. The currently deployed `/chess-lore` still serves the old page (also HTTP 200); that is the existing deployment, not evidence for the post-migration route. The new static build must omit the page and the PR preview must be checked before any later production cutover.
- Sitemap generation is not present, and there is no website redirect configuration to preserve. Removing the Svelte route therefore selects the framework's retired-route/404 behavior; no unrelated redirect is added.

## 1. Reposition the website as a library catalog

Repository: [`mirasen-io/cloudflare-site`](https://github.com/mirasen-io/cloudflare-site).

- [ ] `src/routes/+page.svelte`: replace product-oriented hero, "Become Dangerous", trainer/learning features, Chess Lore promotion, and "ecosystem/future product" sections with an accurate, concise landing page for the **three libraries**. Provide GitHub and npm links for each; direct chessboard users to the live examples.
- [ ] `src/routes/chess-lore/+page.svelte`: remove this product marketing route and its structured data. Check for internal references and remove them; keep unrelated chess learning source repositories untouched.
- [ ] `src/lib/nav/links.ts`: remove `/chess-lore` from `pageNavCommon`. Make the three libraries reachable in desktop and mobile navigation (avoid unnecessary top-level routes if an anchor or existing page works).
- [ ] `src/routes/chessboard/+page.svelte`: remove assertions that chessboard exists to support Chess Lore or a learning-product ecosystem, as well as links back to Chess Lore. Present the core and React integration on their own merits, with clear separate npm/GitHub links. Preserve existing functional examples and accurate API descriptions.
- [ ] `src/routes/license-gate/+page.svelte`: retain the useful technical page; adjust only common site framing/metadata and URL.
- [ ] `src/routes/+layout.svelte`: remove the product tagline ("Structured chess learning. Become Dangerous."); keep a minimal, library-oriented footer and navigation.
- [ ] Recheck `src/lib/components/AppBar.svelte`, the shared navigation, styling, and responsive E2E expectations after removing a nav item. Do not rebrand library code or overhaul design unnecessarily.
- [ ] `README.md`: describe the site as a mirasen libraries/demo site on Workers rather than the former `mirasen.io` product landing site. Keep current development/release instructions accurate.

## 2. Update hardcoded domain and metadata references

Verified source paths in the website (each currently contains `https://mirasen.io`):

- [ ] `src/routes/+page.svelte` — canonical/OG URLs, JSON-LD organization/website URLs; rewrite SEO descriptions around libraries, not Chess Lore.
- [ ] `src/routes/chessboard/+page.svelte` — `pageUrl`, `examplesUrl`, `orgUrl`, JSON-LD publisher and descriptions.
- [ ] `src/routes/license-gate/+page.svelte` — `pageUrl`, `orgUrl`, canonical/OG/JSON-LD.
- [ ] `src/routes/chessboard/examples/+page.svelte` — canonical/OG.
- [ ] `src/routes/chessboard/examples/minimal/+page.svelte` — canonical/OG.
- [ ] `src/routes/chessboard/examples/chessjs/+page.svelte` — canonical/OG.
- [ ] `src/routes/chessboard/examples/promotion/+page.svelte` — canonical/OG.
- [ ] `src/routes/chessboard/examples/live-games-grid/+page.svelte` — canonical/OG.
- [ ] Remove obsolete metadata for the deleted `/chess-lore` page.
- [ ] Search remaining live source/config/docs for `mirasen.io`, `Chess Lore`, `Become Dangerous`, and old `cloudflare-site.*.workers.dev` references. Do **not** mechanically rewrite archived specifications, release history, or other historical records that accurately describe the past.

Preserve the working route structure under `/chessboard`, `/chessboard/examples`, and `/license-gate` to avoid needless broken links. Check both `.html` and extensionless demo links (both forms exist in current package READMEs), since Workers Static Assets uses `html_handling: drop-trailing-slash`.

## 2a. JSON-LD / Google Knowledge Graph and structured data audit

Google's understanding of the brand and its products must reflect **real open-source libraries**, not the abandoned learning-product narrative. Treat structured data as a separate review, not just string replacement.

- [ ] `src/routes/+page.svelte`: revisit both `organizationLd` (`@type: Organization`) and `websiteLd` (`@type: WebSite`). Replace `url` and misleading learning-product `description`; keep factual `sameAs` links to mirasen GitHub/npm. Decide whether consistent, stable `@id` references would improve entity identification; do not invent claims or markup solely for search ranking.
- [ ] `src/routes/chessboard/+page.svelte`: audit the complete `@graph`: core and React `SoftwareSourceCode` entities, `codeRepository`, `sameAs`, `subjectOf`, `isBasedOn`, `publisher` `Organization` node, descriptions, page/example URLs. Remove misleading references to the training-product ecosystem. Keep **core and React distinct**; link each to its actual repo/npm page.
- [ ] `src/routes/license-gate/+page.svelte`: verify the `SoftwareSourceCode` object, publisher, `url`, and `subjectOf` README/changelog references against the published License Gate project and new URL.
- [ ] `src/routes/chess-lore/+page.svelte`: delete/retire the `SoftwareApplication` JSON-LD and product metadata together with the old page; ensure it cannot still be emitted by prerendered files or referenced from active site markup.
- [ ] Audit JSON-LD **consistency across pages**: canonical URL and `og:url` match structured-data `url` values, organization identity/name and links stay consistent, and no dangling `@id`, `subjectOf`, `publisher`, `sameAs`, or references to retired routes remain.
- [ ] Verify the built HTML contains valid parseable `application/ld+json` script content (not double-escaped, duplicated, or missing after prerender). Inspect structured data in output, not only Svelte source.
- [ ] Validate relevant page URLs/markup with Google's [Rich Results Test](https://search.google.com/test/rich-results) **where applicable** and [Schema Markup Validator](https://validator.schema.org/). The former checks Google's supported rich-result features, **not** a guarantee of Knowledge Graph inclusion or search placement.
- [ ] Review the current public indexing/Google Search Console situation, if accessible, after the hostname change. Reindexing and knowledge-graph behavior cannot be inferred from passing JSON syntax validation; plan to verify indexed URLs and outdated snippets later.

## 3. Update the three library repositories

Each repository should have a **separate, focused change** following its own `AGENTS.md` and validation workflow.

| Repository                                                           | Verified changes needed                                                                                                                                                                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`chessboard`](https://github.com/mirasen-io/chessboard)             | `package.json` `homepage: https://mirasen.io/chessboard`; four demo links in `README.md` (currently `.html` URLs); GitHub repository **About → Website** currently `https://mirasen.io/chessboard`.                    |
| [`react-chessboard`](https://github.com/mirasen-io/react-chessboard) | `package.json` `homepage: https://mirasen.io/chessboard`; four demo links in `README.md` (currently extensionless URLs); GitHub repository **About → Website** currently `https://mirasen.io/chessboard`.              |
| [`license-gate`](https://github.com/mirasen-io/license-gate)         | `package.json` `homepage: https://mirasen.io/license-gate`; GitHub repository About → Website was empty when checked — set to the verified new license-gate URL if useful. Check README for other outdated live links. |

- [ ] Update each library `homepage` and all user-facing demo links to the working Worker origin, keeping correct paths.
- [ ] Update GitHub repository About/Website settings and relevant descriptions, without renaming the three package repositories.
- [ ] Remember: changing source `package.json` does not retroactively edit npm metadata of already-published versions. New `homepage` metadata reaches npm when the library is next published; avoid gratuitous releases solely for metrics.
- [ ] Search other active repositories in `mirasen-io` for live links; target only confirmed instances, not historical snapshots.

## 4. GitHub organization profile and settings

- [ ] [`mirasen-io/.github/profile/README.md`](https://github.com/mirasen-io/.github/blob/main/profile/README.md) currently says "structured chess learning" and "Products", lists Chess Lore, and links to `mirasen.io`. Replace with a concise **Libraries** profile featuring core chessboard, React integration and License Gate, GitHub/npm, and the new demo site.
- [ ] Review [GitHub organization public profile](https://github.com/mirasen-io) settings: the publicly displayed description currently talks about structured chess learning/Chess Lore, and the public website link points to `mirasen.io`. Change both to library-focused information and the Worker URL. These organization settings are **not** stored in the profile README.
- [ ] Review other repo About/Website settings for deprecated links, including `cloudflare-site`, and keep the GitHub/npm organization identities unchanged.

## 5. Website changelog and optional repository renaming

- [ ] Remove `CHANGELOG.md` **from the website repository only**, as requested. Keep library changelogs.
- [ ] In website `.changeset/config.json`, change `"changelog": "@changesets/cli/changelog"` to **`"changelog": false`** so future version bumps do not recreate it (official Changesets config supports this). Keep `privatePackages.version: true`, `privatePackages.tag: true`, GitHub Releases and existing release/deploy behavior.
- [ ] Test the Changesets version/publish flow so no regenerated changelog, missing Git tags or skipped production deploy slips through. Existing release history stays available in GitHub Releases.
- [ ] **Optional, not needed for the Worker migration:** decide whether to rename the GitHub repository `cloudflare-site` to something more descriptive like `chessboard-site` (do not use `chessboard`, already taken by the core library).
- [ ] If renamed, update the hard-coded repository guards in `.github/workflows/ci.yml` and `.github/workflows/release.yml`, verify any workflow/docs links, integrations, GitHub App access, secrets, and GitHub Actions after the rename. The Cloudflare Worker is **already** named `chessboard`; no additional Cloudflare project rename is needed.

## 6. Validation and cutover

- [ ] Confirm the discovery/impact audit above is complete, all new findings are documented, and the intended structure for retired product routes is explicitly resolved.
- [ ] Inspect **generated** HTML for JSON-LD validity and alignment with title, canonical, and OG metadata; verify no references to Chess Lore or old hostname remain on active pages.
- [ ] Test the production homepage, core/React GitHub/npm links, License Gate page, all four interactive chessboard examples, and mobile navigation at `https://chessboard.k-tarmyshov.workers.dev`.
- [ ] Verify canonical, OG, and JSON-LD URLs resolve to that domain and no active page advertises Chess Lore or the old slogan.
- [ ] Run repository-required checks (`npm run format`, `npm run lint`, `npm run check`, `npm run build`, appropriate unit/E2E tests) and verify PR Cloudflare preview.
- [ ] Merge/release via existing Changesets → GitHub Release → Wrangler workflow; confirm the production deployment and Worker name in logs.
- [ ] After updating live links, review Cloudflare `mirasen.io` bindings/redirects and other consumers (including the website's canonical links) before expiration. Do not destroy the live site, DNS or Worker for the sake of this migration.
- [ ] Confirm that the final destination works independently of `mirasen.io` before **2027-03-11**.

## Out of scope

No deletion of the GitHub organization, library packages, or historical GitHub releases. No new Cloudflare application. No architectural refactor or replacement deployment system. No migration of archived documents simply to erase historical mention of the former domain.
