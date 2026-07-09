## Context

The site is a SvelteKit static-adapter marketing site. There is one existing product landing page, `/chessboard` (`src/routes/chessboard/+page.svelte`), rendered with a fixed section skeleton driven by classes from `layout.css` / `mirasen-styles.css`: `main.page-shell` → `section.hero` (with a `.hero-copy` and an `aside.card.hero-side`) → several `section.site-section` with `.section-header`, `.card-grid`, `.card.spotlight`, and `.section-actions`. Page-local navigation is wired via a `+layout.ts` that returns a `NavConfig` (`chessboardNav`) picked up by `+layout.svelte` at the app root.

`@mirasen/license-gate` (see `../license-gate/README.md`) is a released v1 npm package with two CLI subcommands (`check`, `collect`), a fixed policy-file layout (`licenses/allowed-hard.txt`, optional `licenses/allowed-packages.txt`), five allowed override forms, three exit codes (0/1/2), and a deliberately narrow scope (npm only in v1, no license-file reading, no normalisation, no root walk-up). It is used by Mirasen's own repositories in CI.

The user has directed that the landing page frame this tool as **internal Mirasen supply-chain hygiene released as OSS**, not as a second Mirasen product pillar next to the chess learning product.

## Goals / Non-Goals

**Goals:**

- One consistent landing page at `/license-gate` in the same visual language as `/chessboard`, extended with **one** Quick Start code block.
- Make License Gate discoverable from `/` via a small secondary mention, without altering the top nav or the chess-first product narrative.
- Establish page-local nav (`licenseGateNav`) so once the visitor is on `/license-gate`, GitHub / npm links in the header target the License Gate repo and package, not the org and not Chessboard.
- Encode the tool's trust story on the page: default-deny, literal string comparison, visible overrides, `--cwd` is explicit, `check` and `collect` are separate.
- Ship metadata sufficient for search + share: title, description, canonical, OG, `SoftwareSourceCode` JSON-LD linking npm + GitHub.

**Non-Goals:**

- Not a documentation page. Full reference stays in the README; the page links out.
- No global top-nav entry. No promotion to third product pillar. No home-page hero touch.
- No changes to `@mirasen/license-gate` package code, README, or CLI behavior.
- No JSON-LD vocabulary implying legal services or compliance certification.
- No page-load-time telemetry, no analytics events specific to this page beyond whatever the site already emits at the layout level.
- No Playwright e2e for the new page in this change (the site's existing e2e covers layout stability; content-only pages don't need per-route e2e — mirror how `/chessboard` was added).

## Decisions

### D1 — Reuse the `/chessboard` section skeleton verbatim

**Choice:** `main.page-shell` → `section.hero` + `section.site-section` × 5, using the existing `.card` / `.card-grid` / `.spotlight` / `.numbered-list` / `.theme-list` / `.section-actions` / `.badge` / `.inner-panel` classes.

**Why:** The site already has a working, tested visual language for a product landing page. Reusing it (a) keeps `/license-gate` visually coherent with `/chessboard`, (b) requires zero new CSS, and (c) lets us focus review on content and metadata correctness. Introducing a new template would multiply the surface area to maintain and risk visual drift.

**Alternatives considered:** A docs-first template (heavier code blocks, sidebar, TOC) — rejected, over-scoped for a v1 tool with a good README; a bare "one big README render" — rejected, undersells the tool and breaks visual consistency.

### D2 — Section skeleton for `/license-gate`

**Choice:** Six sections in this order.

```
main.page-shell
├── section.hero
│   ├── .hero-copy
│   │     eyebrow : "Open-source engineering tool by Mirasen"
│   │     title   : "Mirasen License Gate"
│   │     lead    : "A strict, local, default-deny license policy gate
│   │               for npm projects — single package, workspaces,
│   │               and monorepos."
│   │     actions : [View on GitHub] [View on npm]
│   └── aside.card.hero-side
│         title   : "Built to fail closed"
│         list    : npm dependency graphs
│                   workspaces and monorepos
│                   CI policy checks
│                   explicit override review
│
├── section.site-section         ← Overview (card-grid two-up)
│         · Local & literal
│         · Escape hatches, visible
│
├── section.site-section         ← Quick start (single .card wrapping <pre><code>)
│         one code block + one-sentence caption
│
├── section.site-section         ← How it works / policy model
│         kicker : "How it works"
│         h2     : "Policy model"
│         .card.spotlight with .spotlight-grid:
│           spotlight-copy: 4–5 lines on default-deny + literal SPDX-leaf comparison.
│                           Page-level statement about overrides: overrides live in
│                           `licenses/allowed-packages.txt`; every matched override is
│                           visible in the report as `matchedPackageRule`. The five
│                           override forms are README-only and MUST NOT appear on the
│                           page.
│           numbered-list : 1. Install  2. Add allowed-hard.txt  3. Run check
│           theme-list    : [check] [collect] [--workspace] [--cwd] [--json]
│
├── section.site-section         ← What it will not do (card-grid three-up)
│         · No license file reading
│         · No license normalization
│         · No project-root walk-up
│         · No silent excludes
│         · npm-first scope
│
└── section.site-section         ← Links (section-actions row)
          kicker  : "Links"
          h2      : "Use it from npm or inspect the source"
          lead    : "Install the package from npm, review the README for the full
                     command reference, or inspect the repository before adding it to CI."
          actions : [Repository] [Package] [Changelog?]  ← Changelog conditional on
                                                           CHANGELOG.md content (see D6.1)
```

**Why this ordering:** hero establishes what and for whom; overview crystallises the two core mental hooks; Quick Start lets a technical reader validate in 30 seconds; policy model earns the trust; "will not do" reinforces the trust story (which is a _feature_ here); Links closes with the neutral outbound CTAs (npm / repo / changelog) so package state is read from npm and GitHub rather than from static marketing copy.

**Why "Links", not "Status":** an earlier draft closed with a `Status` section carrying `h2 "v1"` and the lead `"v1 released. Used in Mirasen projects."`. That framing creates maintenance debt — version/status copy goes stale, and package state is better represented by npm/GitHub than by static text on a marketing page. Replaced with a neutral `Links` section whose only job is to route the reader out to the authoritative sources. No status/version copy appears anywhere else on the page.

### D3 — Quick Start block: single `<pre><code>` inside a `.card`

**Choice:** One card wrapping a single fenced code block:

```
npm install -D @mirasen/license-gate
mkdir -p licenses
echo "MIT" > licenses/allowed-hard.txt
npx license-gate check
```

Plus two short factual lines adjacent to the code block, inside the same `.card`:

1. Caption sentence: **"Run it after `npm ci`. Unknown or unapproved license strings fail the build."**
2. Runtime prerequisite: **"Requires Node.js ≥ 22.9.0."**

The Node prerequisite does not get its own section header — it is one factual line inside the Quick Start card, sitting adjacent to the code block. Placing it here is the earliest point at which a reader would attempt to run the snippet; placing it any earlier (in the hero) would be marketing noise.

**Why:** The tool's value is CLI behavior; a runnable four-line snippet is the fastest possible credibility signal. One block, not a matrix — the README already carries the exhaustive command reference.

**Styling risk:** the site currently has no `/chessboard`-embedded code block, so no proven CSS path for `<pre><code>` inside `.card`. Tailwind v4 + Skeleton defaults render `<pre>` with a monospace font but no background/padding contract. Mitigation: add minimal utility classes on the `<pre>` (`overflow-x-auto`, `rounded`, `bg-surface-100-900`, `p-4`, `text-sm`) inline; if the result is visually poor, promote them into `mirasen-styles.css` under a `.code-block` class in the same change. Explicitly bounded — no full syntax highlighter, no copy-button widget.

### D4 — Page-local `licenseGateNav`, no global top-nav change

**Choice:** Add a third exported `NavConfig` in `src/lib/nav/links.ts`:

```ts
export const licenseGateNav: NavConfig = {
	brand,
	links: [
		{ href: '/chess-lore', label: 'Chess Lore', activeMatch: 'prefix' },
		{ href: '/chessboard', label: 'Chessboard', activeMatch: 'prefix' },
		{
			href: 'https://github.com/mirasen-io/license-gate',
			...githubLinkCommon
		},
		{
			href: 'https://www.npmjs.com/package/@mirasen/license-gate',
			...npmLinkCommon
		}
	]
};
```

Wired via `src/routes/license-gate/+layout.ts` (`load = () => ({ nav: licenseGateNav })`), mirroring `chessboardNav`. `rootNav` and `chessboardNav` gain **no** `/license-gate` entry.

**Why:** The user's product narrative decision is explicit — License Gate is not a peer product to Chess Lore / Chessboard in the top nav. Making it appear in `rootNav.links` would frame Mirasen as "chess learning + npm compliance," which the user has explicitly rejected. But once a visitor lands on `/license-gate`, the header's GitHub / npm links must target License Gate resources, not the org — otherwise clicking npm from the License Gate page sends you to `@mirasen/*` org listings, which is worse UX than the Chessboard page (which correctly retargets to `@mirasen/chessboard`).

**Alternatives considered:** (a) add License Gate to `rootNav.links` — rejected per user direction; (b) don't add a page-local nav at all and let `rootNav` render on `/license-gate` — rejected because then npm/GitHub links from the header point away from the tool the user is reading about; (c) hide the internal peer links (`Chess Lore`, `Chessboard`) from `licenseGateNav` — rejected, would strand the user on the tool page with no way back to the main product story.

### D5 — Home-page secondary mention: one small block below existing content

**Choice:** Append a new `section.site-section` to `src/routes/+page.svelte` **after** the existing "One brand, multiple layers" section, containing:

- Kicker: **"Open source"**
- Section title (`h2`): **"Engineering tools"**
- Section lead: one sentence — **"Mirasen also publishes small infrastructure tools built for its own engineering workflow."**
- A single `article.card.p-6.max-w-2xl` (not a `.card-grid`, not `.spotlight`) with title `"Mirasen License Gate"`, one-sentence body (`"A strict local license policy gate for npm projects. Built for default-deny CI checks."`), and a `.section-actions` row with one CTA: `"View License Gate"` linking internally to `/license-gate` via `resolve('/license-gate')`.

**Why the `max-w-2xl` cap:** the existing site CSS renders `article.card.p-6` full-width inside a `section.site-section`, which would make this single card visually equal to (or larger than) the three-up brand-layer grid above it — exactly the "equal fourth pillar" reading the user vetoed. Capping the card at `max-w-2xl` (≈ 42rem) makes it visibly narrower than the three-up grid and lets it read as a subordinate note. `max-w-2xl` is the same Tailwind utility used elsewhere on the site for "prose-width, not layout-width" content; introducing a bespoke class would be over-engineered for one card.

**Why this labelling:** The kicker `"Open source"` names the _category_ of the appendix; the h2 `"Engineering tools"` is a plain factual noun-phrase, not a decorative marketing headline. Together they read as "here is a category note, here is one entry" — matching the intended secondary-appendix weight. An earlier draft used `"Small tools from Mirasen's own workflow"` as the h2 and `"Engineering tools"` as the kicker; that was more decorative and made the section compete visually with the product blocks above. Reverted.

**Why:** The user explicitly wants this discoverable-but-secondary. A single card in its own section — visually smaller than the existing three-up "brand layers" grid — signals "additional item, not equal pillar." Placing it _after_ the brand-structure section, rather than between the existing product blocks, avoids the visual reading "Chess Lore → Chessboard → License Gate as peers."

**Trade-off:** A visitor may still read three sections + one appendix as "four products." Mitigation is copy weight: eyebrow / lead / one-sentence body are all deliberately smaller and more prose-like than the existing product sections; no hero-height content; no repetition of "flagship" / "platform" / "foundation" language.

**Alternatives considered:** (a) footer-only mention — rejected, undersells the release and doesn't help SEO; (b) full three-up card grid alongside Chess Lore + Chessboard — rejected, that's the equal-third-pillar shape the user vetoed; (c) do nothing on `/` and rely on direct traffic — rejected, users won't discover the tool.

### D6 — Metadata and JSON-LD

**Choice:** Mirror the `/chessboard` `<svelte:head>` pattern.

- `<title>`: `Mirasen License Gate — Strict license policy gate for npm projects`
- `<meta name="description">`: one sentence about strict local default-deny npm license policy checks.
- `<link rel="canonical" href="https://mirasen.io/license-gate">`
- OG tags: `og:title`, `og:description`, `og:type=website`, `og:url`
- One JSON-LD `SoftwareSourceCode` object:
  - `name: "Mirasen License Gate"`
  - `alternateName: "@mirasen/license-gate"`
  - `programmingLanguage: "TypeScript"`
  - `runtimePlatform: "Node.js"`
  - `codeRepository: "https://github.com/mirasen-io/license-gate"`
  - `license: "https://github.com/mirasen-io/license-gate/blob/main/LICENSE"`
  - `sameAs: [githubHref, npmHref]`
  - `keywords: ["npm", "license policy", "SPDX", "CI", "monorepo", "open source", "dev tool"]`
  - `subjectOf`: README always; CHANGELOG conditional per **D6.1**.
  - `publisher`: `Organization` Mirasen with `url: "https://mirasen.io"`

**Why:** Consistent with `/chessboard`; Google's SoftwareSourceCode structured data guidance covers this shape; JSON-LD is emitted via the same `@html` pattern used on `/chessboard` (splitting the `<script>` tag string to avoid Svelte parsing complaints).

**Not used:** No `LegalService`, no `ComplianceRegulation`, no `applicationCategory: "SecurityApplication"` — these overclaim what the tool does. No Organization `@id` refactor in this change; the Mirasen `Organization` block stays as it is on `/chessboard` (no `@id`).

### D6.1 — Changelog CTA and JSON-LD `subjectOf` are conditional on real content

**Choice:** Both the `[Changelog]` CTA in the Links section and the `CHANGELOG` entry in JSON-LD `subjectOf` are only included if `../license-gate/CHANGELOG.md` contains real, useful release/history content. If the file is empty, a placeholder, or otherwise embarrassing, both are dropped.

**Inspection outcome for this change:** the file `../license-gate/CHANGELOG.md` was inspected during proposal review. It contains one substantive `## 1.0.0` entry authored by the initial-implementation changeset that lists the concrete v1 surface (CLI commands, project-root policy, Arborist graph discovery, workspace narrowing semantics, license-detection rules, literal-first + SPDX-leaf semantics, violation reasons and detail codes, exit-code / `--out` behavior, exported programmatic API, engines pin, `workspace`-field intentional absence). That qualifies as real content.

**Therefore, for this change:**

- The Links `.section-actions` row includes `[Changelog]` as a tonal-preset external link to `https://github.com/mirasen-io/license-gate/blob/main/CHANGELOG.md`.
- JSON-LD `subjectOf` includes both a README `CreativeWork` entry and a CHANGELOG `CreativeWork` entry, matching the `/chessboard` shape.

**Why the conditional gate is worth keeping in the design record:** if a future maintainer resets or scrubs the CHANGELOG before this page is re-inspected, we do not want a broken or empty release-notes link on a marketing page. The gate is: inspect at implementation time, keep the CTA and `subjectOf` entry only if the file still contains substantive release content. Verification tasks re-run this inspection at implementation time and adjust the page/JSON-LD accordingly.

### D7 — Copy tone: literal, boring in a good way, no marketing verbs

**Choice:** Every user-facing string on the page is one of:

- a fact about scope ("npm projects", "single package", "workspaces", "monorepos"),
- a fact about behavior ("default-deny", "literal", "exits non-zero"), or
- a neutral outbound instruction ("Install the package from npm, review the README… or inspect the repository before adding it to CI.").

**No status/version copy.** The page carries no "v1", "v1 released", "released", "actively maintained", or similar status/version framing anywhere — package state is read from npm and GitHub, not asserted in static marketing text. The closing section is a neutral `Links` section, not a `Status` section.

**Banned vocabulary** (do not appear on the page): "revolutionary", "complete compliance platform", "enterprise governance", "all-in-one", "world-class", "cutting-edge", any variant claiming legal or regulatory guarantees, "actively maintained" as a marketing claim (no ongoing commitment we can honor without a signal to point at).

**Why:** The tool's whole positioning — and the user's stated tone — is that it is intentionally narrow. Every marketing verb we add undermines the "strict, boring, fails-closed" trust story.

### D8 — Sitemap: edit the existing static `static/sitemap.xml`, do not introduce a `+server.ts` endpoint

**Inspection outcome at proposal time:** the repo already ships a sitemap as a plain static file at `static/sitemap.xml`. It is a hand-authored XML urlset listing the current public canonical URLs (`https://mirasen.io`, `.../chess-lore`, `.../chessboard`, `.../chessboard/examples`, `.../chessboard/examples/minimal`, `.../chessboard/examples/promotion`, `.../chessboard/examples/chessjs`, `.../chessboard/examples/live-games-grid`). The static adapter copies it verbatim into the build output at `build/sitemap.xml`. There is no existing `src/routes/sitemap.xml/+server.ts`, no dynamic generator, and no dependency on a sitemap framework.

**Choice:** Add one `<url>` entry for `https://mirasen.io/license-gate` to `static/sitemap.xml`, preserving the file's existing shape (no XML namespace changes, no `<lastmod>`, no `<changefreq>`, no `<priority>`, no whitespace churn on unrelated lines). Do **not** create `src/routes/sitemap.xml/+server.ts`; the earlier proposal-draft suggestion to create that endpoint was based on an unchecked assumption that no sitemap existed. Per the user's rule "if the repo already has a sitemap, update the existing one," the correct move is a one-`<url>`-block addition to the static XML.

**Why:** (a) matches the repo's actual current pattern; (b) avoids introducing a new server-endpoint concept for a static site whose adapter is `@sveltejs/adapter-static`; (c) zero risk of the endpoint/static file diverging at build time; (d) no `prerender = true` clarity issue because there is no endpoint to annotate. The static file is copied verbatim by the adapter — clarity is already maximal.

**Placement of the new entry:** append after the existing `chessboard/examples/live-games-grid` entry, at the tail of the `<urlset>`. This ordering is convention-only (the sitemap protocol does not order-sensitively rank URLs) but keeps the diff minimal and human-readable.

**Non-goals:** no dynamic generation, no filesystem-crawl auto-population, no current-date `lastmod` stamping, no robots.txt change (existing `static/robots.txt` does not reference a `Sitemap:` directive, so there is nothing to keep consistent), no new dep, no per-URL `<priority>` / `<changefreq>` metadata.

**Alternatives considered:**

- (a) Introduce `src/routes/sitemap.xml/+server.ts` as a prerendered endpoint that emits the URL list from a shared array — rejected. Adds a runtime concept for a static file, requires SvelteKit to prerender an endpoint that already exists as static content (would collide unless the static file is deleted, which is a wider refactor than this change), and buys nothing over the current pattern.
- (b) Generate the URL list from a filesystem crawl of `src/routes/` — rejected. Dynamic sitemap generation for a nine-URL marketing site is over-engineered; the maintenance cost of a hand-authored list at this scale is one line per new page.
- (c) Add `<lastmod>` with the current build date — rejected. The user explicitly asked for no dynamic date generation; also, `<lastmod>` on hand-authored sitemaps drifts from truth quickly.

### D9 — Changesets entry for the private site package

**Context:** The site package is `@mirasen/main-website` (private, currently at `1.1.1`), versioned via Changesets. The existing `.changeset/*.md` entries in the repo follow a `~<number>-<package>-<short-slug>.md` naming convention (Dependabot-owned entries) but Changesets itself accepts any `.md` filename inside `.changeset/`. New human-authored entries in this repo have historically been added under short slugs; Changesets' own `changeset add` command uses random adjective-noun names.

**Choice:** Create one new `.changeset/*.md` entry declaring a `patch` bump for `@mirasen/main-website`. Filename: `license-gate-page.md` (short, descriptive, not colliding with the `~<n>-` Dependabot naming). Frontmatter uses single quotes per repo convention (mirrors the shape of `~76-@mirasen-main-website-vite.md`):

```md
---
'@mirasen/main-website': patch
---

Add the License Gate landing page, page-local navigation, sitemap entry, and a secondary home-page engineering tools link.
```

**Why patch:** the change is website/content only (new route, new nav config export, one new home-page section, one sitemap line, no public-package behavior change). No breaking change to any consumer; no minor-worthy new user-facing capability of the _package_ (the package is private, and the version bump is purely release-tracking).

**Not touched:** the site `package.json` `version` field, `CHANGELOG.md`, or any other release artifact. Changesets will roll all of that up in a subsequent version PR — this change only _drops the changeset entry_, matching how the repo has handled all other releases.

**Alternatives considered:**

- (a) No changeset — rejected; the existing release specs require a changeset for every user-facing site change.
- (b) `minor` bump — rejected; the site is private and the shipped surface area from a user perspective is one new URL under an already-existing brand. `patch` matches how Dependabot-owned changesets in the repo are graded.
- (c) Multiple changeset files (one per touched sub-area: page, nav, home, sitemap) — rejected; Changesets treats one repo-scope entry as one bump. Splitting across files inflates the changelog without a corresponding meaning gain.

## Risks / Trade-offs

- **[Risk]** The Quick Start `<pre><code>` may render inconsistently across light/dark theme without explicit styling (D3). → **Mitigation:** verification task exercises both themes; utility classes applied inline; promote to `mirasen-styles.css` if pattern is used elsewhere later.
- **[Risk]** JSON-LD claims must exactly match reality (repo URL, package name, license). → **Mitigation:** verification task compares JSON-LD values against `../license-gate/package.json` and the actual GitHub URL.
- **[Risk]** External links to `mirasen-io/license-gate` GitHub / `@mirasen/license-gate` npm assume both remain the canonical resources. → **Trade-off:** acceptable. Same trust model as `/chessboard`. If they move, the fix is a small copy update.
- **[Risk]** Home-page secondary mention still adds one more section to `/`, which is already section-heavy. → **Trade-off:** acceptable at one card. Non-goal to redesign the home page here.
- **[Risk]** No page-local Playwright coverage. → **Trade-off:** acceptable; content-only route; existing e2e infrastructure catches app-shell regressions.
- **[Risk]** `static/sitemap.xml` is hand-authored; adding pages in future requires remembering to update it (D8). → **Trade-off:** acceptable at current scale; converting to a generator is a separate change if the URL count grows meaningfully.

## Migration Plan

Pure content addition; no runtime behavior change for existing routes.

- **Deploy:** standard PR → main → static deploy. No flag; rollout is atomic.
- **Rollback:** revert the PR. `rootNav` / `chessboardNav` are untouched, so reverting removes the `/license-gate` route, the `licenseGateNav` export, and the home-page mention in one step, with zero effect on `/`, `/chess-lore`, `/chessboard`.

## Open Questions

- None blocking. `applicationCategory` vs. bare `SoftwareSourceCode` — chose the plain shape because there is no clean Schema.org category for "npm license policy gate" and forcing one would be an overclaim.
