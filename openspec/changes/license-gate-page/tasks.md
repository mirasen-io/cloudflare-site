## 1. Navigation wiring

- [ ] 1.1 In `src/lib/nav/links.ts`, add a new exported `licenseGateNav: NavConfig` that reuses the existing `brand`, `githubLinkCommon`, and `npmLinkCommon`. `links` array: `Chess Lore` (internal, `prefix`), `Chessboard` (internal, `prefix`), GitHub at `https://github.com/mirasen-io/license-gate`, npm at `https://www.npmjs.com/package/@mirasen/license-gate`.
- [ ] 1.2 Confirm `rootNav.links` and `chessboardNav.links` are **not** modified in this file. `git diff` on `src/lib/nav/links.ts` shows only additions after the `chessboardNav` block.
- [ ] 1.3 Create `src/routes/license-gate/+layout.ts` returning `{ nav: licenseGateNav }`, mirroring `src/routes/chessboard/+layout.ts` exactly.

## 2. `/license-gate` page — skeleton

- [ ] 2.1 Create `src/routes/license-gate/+page.svelte` with a `<script lang="ts">` block declaring `pageTitle`, `pageDescription`, `ogDescription`, `pageUrl` (`https://mirasen.io/license-gate`), `githubHref`, `npmHref`, `readmeHref`, `changelogHref`, `orgUrl`, and any string helpers needed for JSON-LD.
- [ ] 2.2 Render `<svelte:head>` with `<title>`, `<meta name="description">`, `<link rel="canonical">`, OG tags, and one JSON-LD `SoftwareSourceCode` block matching the shape in design.md D6. Emit the JSON-LD via the same split-`<script>`-string pattern used in `src/routes/chessboard/+page.svelte`.
- [ ] 2.3 Render `<main class="page-shell">` containing the six sections described in design.md D2, in this order: hero, overview, quick start, how it works, what it will not do, status.

## 3. Hero

- [ ] 3.1 `section.hero > .hero-copy` with eyebrow `"Open-source engineering tool by Mirasen"`, `h1.hero-title` `"Mirasen License Gate"`, and a lead paragraph containing the sentence: `"A strict, local, default-deny license policy gate for npm projects — single package, workspaces, and monorepos."`.
- [ ] 3.2 `.hero-actions` row: `[View on GitHub]` (`preset-filled-primary-500`, external, `rel="external noopener noreferrer"`, `target="_blank"`), `[View on npm]` (`preset-tonal`, external).
- [ ] 3.3 `aside.card.hero-side.p-6` with `h2.card-title` `"Built to fail closed"` and a `ul.hero-point-list` of four `li.inner-panel` items: `npm dependency graphs`, `workspaces and monorepos`, `CI policy checks`, `explicit override review`. Each item has only an `.inner-panel-title` (no body), matching the shape used on `/chessboard`.

## 4. Overview section

- [ ] 4.1 `section.site-section` with a `.section-header` (kicker `"Overview"`, `h2 "Strict by design"`, one-sentence section lead).
- [ ] 4.2 `.card-grid.two-up` with two `article.card.p-6`:
  - **Local & literal**: reads what is physically installed, compares license strings verbatim, does not guess. Reference `@npmcli/arborist` in prose (not as a link).
  - **Escape hatches, visible**: overrides in `licenses/allowed-packages.txt` are allowed but every override is visible in the report as `matchedPackageRule`.

## 5. Quick Start section

- [ ] 5.1 `section.site-section` with `.section-header` (kicker `"Quick start"`, `h2 "Install and run"`).
- [ ] 5.2 One `.card.p-6` containing a caption paragraph `"Run it after \`npm ci\`. Unknown or unapproved license strings fail the build."` and a `<pre>` block with the four-line snippet (npm install, `mkdir -p licenses`, echo MIT into `allowed-hard.txt`, `npx license-gate check`).
- [ ] 5.3 Style the `<pre>` with Tailwind utilities `overflow-x-auto rounded bg-surface-100-900 p-4 text-sm` (per design.md D3). Do not add a copy-to-clipboard widget. During implementation, visually verify contrast in both light and dark themes; if the Skeleton `surface-100-900` background does not render with adequate contrast, either (a) switch the block into an `.inner-panel` / `.card`-compatible wrapper, or (b) add a single minimal `.code-block` rule in `mirasen-styles.css`. Do not introduce a broader code-block styling system, a copy button, or a syntax highlighter.
- [ ] 5.4 Inside the same `.card`, adjacent to the code block, add one short factual line: `"Requires Node.js ≥ 22.9.0."` This line is a plain paragraph, not a heading, and does not get its own section.
- [ ] 5.5 Below the code block, one short paragraph directing readers to the README for the full command reference, with an inline external link to the GitHub README URL.

## 6. How it works / policy model

- [ ] 6.1 `section.site-section` with `.section-header` (kicker `"How it works"`, `h2 "Policy model"`).
- [ ] 6.2 `.card.spotlight.p-6.md:p-10` with a `.spotlight-grid` containing:
  - `.spotlight-copy` — 3–5 sentences: reads the installed graph via `@npmcli/arborist`; each package's license string is checked verbatim against `licenses/allowed-hard.txt`; SPDX expressions are parsed only to enumerate leaves, and each leaf is checked literally; unknown-license packages need an explicit entry in `licenses/allowed-packages.txt`; every matched override is visible in the report as `matchedPackageRule`. Do NOT enumerate the five override forms on the page — that reference stays README-only. Include a `.theme-list` with badges `check`, `collect`, `--workspace`, `--cwd`, `--json` styled `preset-filled-surface-50-950`.
  - `ul.numbered-list` — three items with `.badge-icon.preset-filled-primary-500.shrink-0` counters: (1) `Install \`@mirasen/license-gate\` as a dev dependency.`, (2) `Add \`licenses/allowed-hard.txt\` with one license per line.`, (3) `Run \`license-gate check\` after \`npm ci\`.`.

## 7. What it will not do

- [ ] 7.1 `section.site-section` with `.section-header` (kicker `"Scope boundaries"`, `h2 "What it will not do"`, one-sentence section lead noting these are intentional).
- [ ] 7.2 `.card-grid.three-up` with five `article.card.p-6` (three on the first row, two on the second):
  - `No license file reading` — LICENSE / COPYING / README are never opened.
  - `No license normalization` — `Apache 2.0` is not the same as `Apache-2.0`.
  - `No project-root walk-up` — `--cwd` is the only way to change project root.
  - `No silent excludes` — every considered package is accounted for in the report.
  - `npm-first in v1` — v1 is intentionally scoped to npm-installed graphs; pnpm / yarn / Gradle / Maven are out of scope for v1.

## 8. Status section

- [ ] 8.1 `section.site-section` with `.section-header` (kicker `"Status"`, `h2 "v1"`, section lead: `"v1 released. Used in Mirasen projects."`).
- [ ] 8.2 Re-inspect `../license-gate/CHANGELOG.md` at implementation time per design.md D6.1. Confirm it still contains substantive release content (the `## 1.0.0` entry describing the initial v1 surface). Record the outcome in the implementation report / task-completion note, not as a source-code comment.
- [ ] 8.3 If CHANGELOG inspection in 8.2 passes: `.section-actions` row contains three external links — `[Repository]` (`preset-filled-primary-500`, `github.com/mirasen-io/license-gate`), `[Package]` (`preset-tonal`, `npmjs.com/package/@mirasen/license-gate`), `[Changelog]` (`preset-tonal`, `github.com/mirasen-io/license-gate/blob/main/CHANGELOG.md`). If it fails: the `.section-actions` row contains only `[Repository]` and `[Package]`; the Changelog CTA is omitted, and JSON-LD `subjectOf` (task 2.2 / verification 10.2) drops the CHANGELOG entry accordingly. All present links external, `target="_blank"`, `rel="external noopener noreferrer"`.

## 9. Home-page secondary mention

- [ ] 9.1 In `src/routes/+page.svelte`, add a new `section.site-section` **after** the existing `brand-heading` section (last section in the current file).
- [ ] 9.2 `.section-header`: kicker `"Open source"`, `h2 "Engineering tools"`, section lead `"Mirasen also publishes small infrastructure tools built for its own engineering workflow."`.
- [ ] 9.3 Single `article.card.p-6.max-w-2xl` (not a `.card-grid`, not `.spotlight`), containing `h3.card-title "Mirasen License Gate"` and one paragraph `"A strict local license policy gate for npm projects. Built for default-deny CI checks."`. The `max-w-2xl` cap is required so the single card renders visibly narrower than the three-up grid above it (per design.md D5).
- [ ] 9.4 `.section-actions` row with one CTA: `[View License Gate]` (`preset-tonal`, internal link to `/license-gate` resolved via `resolve('/license-gate')`).
- [ ] 9.5 Confirm no existing home-page copy is changed. `git diff src/routes/+page.svelte` shows only the new section.

## 10. Metadata / JSON-LD verification

- [ ] 10.1 Load `/license-gate` in `npm run dev` and view source. Confirm `<title>`, `<meta name="description">`, `<link rel="canonical">`, and OG tags are present with the values in design.md D6.
- [ ] 10.2 Extract the JSON-LD block and parse it with `JSON.parse`. Confirm `codeRepository` matches `https://github.com/mirasen-io/license-gate`; `sameAs` contains both the GitHub and npm URLs; `programmingLanguage` is `"TypeScript"`; `runtimePlatform` is `"Node.js"`; `publisher.name` is `"Mirasen"`. Confirm `subjectOf` contains a README entry unconditionally, and contains a CHANGELOG entry **iff** the CHANGELOG inspection in task 8.2 passed. Confirm no key in the JSON-LD implies legal services, compliance certification, or enterprise governance; specifically, `LegalService`, `ComplianceRegulation`, and `applicationCategory: "SecurityApplication"` MUST NOT appear.
- [ ] 10.3 Cross-check: values in the JSON-LD's `codeRepository`, `alternateName`, and `license` match the corresponding fields in `../license-gate/package.json` (`repository.url`, `name`, `license`).

## 11. Navigation / SEO regression

- [ ] 11.1 Visit `/` and confirm the top nav still contains exactly `Chess Lore`, `Chessboard`, `GitHub`, `npm`. **License Gate is not present in the top nav.**
- [ ] 11.2 Visit `/chessboard` and confirm the top nav still contains the same four links pointing at `mirasen-io/chessboard` / `@mirasen/chessboard`. **License Gate is not present.**
- [ ] 11.3 Visit `/license-gate` and confirm the top nav's GitHub and npm targets are `mirasen-io/license-gate` and `@mirasen/license-gate`. Internal peer links `Chess Lore` and `Chessboard` are still present.
- [ ] 11.4 Visit `/license-gate` on a viewport below 768px and confirm the hamburger menu (per the existing site-navigation spec) contains the same four `licenseGateNav` links in the same order and with the correct external targets.

## 12. Visual / accessibility spot-check

- [ ] 12.1 Load `/license-gate` on desktop and mobile viewports; confirm the section skeleton matches `/chessboard` in visual weight (spacing, hero balance, section-header rhythm). No section should visually overpower the others.
- [ ] 12.2 Confirm the Quick Start `<pre><code>` is legible in both light and dark themes (background contrast, monospace, no horizontal overflow at ≥ 360px viewport width).
- [ ] 12.3 Confirm every external link on the page has `target="_blank"` and `rel="external noopener noreferrer"`.
- [ ] 12.4 Confirm every heading level is used correctly: single `h1` in the hero; `h2` per section; `h3` inside `.card-title` for cards inside a grid.
- [ ] 12.5 Confirm no banned marketing vocabulary appears anywhere on the page (per design.md D7): "revolutionary", "complete", "enterprise", "all-in-one", "world-class", "cutting-edge", "actively maintained", or any wording implying legal/regulatory guarantees.

## 13. Home-page secondary mention — visual weight

- [ ] 13.1 Load `/` and confirm the new "Engineering tools" section appears **after** "One brand, multiple layers" and reads as a subordinate note, not an equal fourth product pillar. The single card is visibly narrower than the existing `.card-grid.three-up` (constrained by the `max-w-2xl` cap from task 9.3) and does not use `.spotlight`.
- [ ] 13.2 Confirm the existing three sections (Chess Lore, Chessboard, brand layers) are visually unchanged.

## 14. Build / lint / typecheck

- [ ] 14.1 Run `npm run lint`. Expect clean.
- [ ] 14.2 Run `npm run check`. Expect clean.
- [ ] 14.3 Run `npm run build`. Expect the following to be present in the static output:
  - `build/license-gate/index.html` — the prerendered License Gate page.
  - `build/sitemap.xml` — the static-adapter-copied sitemap.
- [ ] 14.4 Grep `build/license-gate/index.html` for the literal string `Mirasen License Gate` (must be present) and for the canonical URL `https://mirasen.io/license-gate` (must be present).
- [ ] 14.5 Grep `build/sitemap.xml` for `https://mirasen.io/license-gate` (must be present). Additionally confirm the sitemap still contains the existing public routes listed in design.md D8 and contains no duplicate `<loc>` entries (a quick way: `grep -oE '<loc>[^<]+</loc>' build/sitemap.xml | sort | uniq -d` MUST print nothing).
- [ ] 14.6 Run `npm run test:unit -- --run`. Expect existing tests to pass; no new unit tests are added by this change. No new Playwright e2e is added for this content-only page.

## 15. Cleanup

- [ ] 15.1 Verify final `git diff` touches only the following files:
  - `src/lib/nav/links.ts` (additions only — `rootNav.links` and `chessboardNav.links` unchanged).
  - `src/routes/license-gate/+page.svelte` (new).
  - `src/routes/license-gate/+layout.ts` (new).
  - `src/routes/+page.svelte` (one appended section).
  - `static/sitemap.xml` (one added `<url>` block for `https://mirasen.io/license-gate` — the existing sitemap is edited in place per design.md D8; no new `+server.ts` endpoint is created).
  - `.changeset/license-gate-page.md` (new — see §17).
  - **Optionally** `src/routes/mirasen-styles.css` — the latter only if the Quick Start contrast verification in task 5.3 determined that the inline `overflow-x-auto rounded bg-surface-100-900 p-4 text-sm` classes were inadequate and a minimal `.code-block` rule had to be added there. Do not touch `mirasen-styles.css` if the inline classes render acceptably in both themes.
  - **Do not touch**: `src/lib/components/AppBar.svelte`, `static/robots.txt`, `package.json`'s `version` field, or `CHANGELOG.md`.
- [ ] 15.2 Update PR description to reference `openspec/changes/license-gate-page/`.
- [ ] 15.3 After merge, run `/opsx:archive` for `license-gate-page`.

## 16. Sitemap

- [ ] 16.1 Inspect `static/sitemap.xml` at implementation time to confirm it still matches the shape recorded in design.md D8 (hand-authored `<urlset>` with `<url><loc>...</loc></url>` blocks and no `<lastmod>`/`<changefreq>`/`<priority>`). If the shape has changed since proposal time, stop and re-open the design decision before adding the new entry.
- [ ] 16.2 Append one new `<url>` block to `static/sitemap.xml`, positioned after the existing `chessboard/examples/live-games-grid` entry and before the closing `</urlset>`:
  ```xml
  <url>
    <loc>https://mirasen.io/license-gate</loc>
  </url>
  ```
  Do not modify any other line. Do not add `<lastmod>`, `<changefreq>`, or `<priority>`. Do not reorder existing entries. Do not touch namespace declarations. Preserve existing indentation (two spaces).
- [ ] 16.3 Do not create `src/routes/sitemap.xml/+server.ts`. The static file is copied verbatim by `@sveltejs/adapter-static` — an endpoint would collide with the static file and buys nothing here (per design.md D8).
- [ ] 16.4 Do not modify `static/robots.txt`. It does not currently declare a `Sitemap:` directive, so there is no consistency requirement to preserve.

## 17. Changeset

- [ ] 17.1 Create a new file `.changeset/license-gate-page.md` with exactly this content (single quotes on the package key mirror the repo's existing changeset shape from e.g. `~76-@mirasen-main-website-vite.md`):
  ```md
  ---
  '@mirasen/main-website': patch
  ---

  Add the License Gate landing page, page-local navigation, sitemap entry, and a secondary home-page engineering tools link.
  ```
- [ ] 17.2 Do not manually edit `package.json`'s `version` field or `CHANGELOG.md`. Changesets will roll those up in a subsequent version PR.
- [ ] 17.3 Do not add a second changeset file. One repo-scope entry is sufficient (per design.md D9).
