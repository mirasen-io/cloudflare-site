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

## 3. Update the three library repositories

Each repository should have a **separate, focused change** following its own `AGENTS.md` and validation workflow.

| Repository | Verified changes needed |
| --- | --- |
| [`chessboard`](https://github.com/mirasen-io/chessboard) | `package.json` `homepage: https://mirasen.io/chessboard`; four demo links in `README.md` (currently `.html` URLs); GitHub repository **About → Website** currently `https://mirasen.io/chessboard`. |
| [`react-chessboard`](https://github.com/mirasen-io/react-chessboard) | `package.json` `homepage: https://mirasen.io/chessboard`; four demo links in `README.md` (currently extensionless URLs); GitHub repository **About → Website** currently `https://mirasen.io/chessboard`. |
| [`license-gate`](https://github.com/mirasen-io/license-gate) | `package.json` `homepage: https://mirasen.io/license-gate`; GitHub repository About → Website was empty when checked — set to the verified new license-gate URL if useful. Check README for other outdated live links. |

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

- [ ] Test the production homepage, core/React GitHub/npm links, License Gate page, all four interactive chessboard examples, and mobile navigation at `https://chessboard.k-tarmyshov.workers.dev`.
- [ ] Verify canonical, OG, and JSON-LD URLs resolve to that domain and no active page advertises Chess Lore or the old slogan.
- [ ] Run repository-required checks (`npm run format`, `npm run lint`, `npm run check`, `npm run build`, appropriate unit/E2E tests) and verify PR Cloudflare preview.
- [ ] Merge/release via existing Changesets → GitHub Release → Wrangler workflow; confirm the production deployment and Worker name in logs.
- [ ] After updating live links, review Cloudflare `mirasen.io` bindings/redirects and other consumers (including the website's canonical links) before expiration. Do not destroy the live site, DNS or Worker for the sake of this migration.
- [ ] Confirm that the final destination works independently of `mirasen.io` before **2027-03-11**.

## Out of scope

No deletion of the GitHub organization, library packages, or historical GitHub releases. No new Cloudflare application. No architectural refactor or replacement deployment system. No migration of archived documents simply to erase historical mention of the former domain.
