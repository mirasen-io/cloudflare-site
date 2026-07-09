## ADDED Requirements

### Requirement: /license-gate route renders the License Gate landing page

The site SHALL expose a `/license-gate` route that renders a single Svelte page in the same visual language as `/chessboard` (using the existing `page-shell` / `hero` / `site-section` / `card` / `card-grid` / `spotlight` / `section-actions` / `numbered-list` / `theme-list` / `badge` / `inner-panel` class contracts).

#### Scenario: Route resolves to a rendered page

- **WHEN** a visitor navigates to `https://mirasen.io/license-gate`
- **THEN** the site SHALL respond with prerendered HTML containing a `<main class="page-shell">` root and the section skeleton described below
- **AND** the same `AppBar` and footer that wrap `/chessboard` SHALL wrap this page.

#### Scenario: Page section order

- **WHEN** the page renders
- **THEN** it SHALL contain, in order, the following top-level sections: (1) a `section.hero` block, (2) an Overview `section.site-section`, (3) a Quick Start `section.site-section`, (4) a How-it-works policy-model `section.site-section`, (5) a "What it will not do" `section.site-section`, (6) a Links `section.site-section`.

### Requirement: Hero content and calls to action

The `/license-gate` hero SHALL frame the tool as a Mirasen open-source engineering tool without positioning it as a peer product of the chess learning products.

#### Scenario: Hero copy

- **WHEN** the page renders
- **THEN** the hero SHALL contain, in order: an eyebrow line naming Mirasen as the publisher, an `h1.hero-title` reading `"Mirasen License Gate"`, and a lead paragraph containing the sentence `"A strict, local, default-deny license policy gate for npm projects — single package, workspaces, and monorepos."`.

#### Scenario: Hero calls to action

- **WHEN** the hero renders
- **THEN** the `.hero-actions` row SHALL contain exactly two external links: one primary-preset button linking to `https://github.com/mirasen-io/license-gate`, and one tonal-preset button linking to `https://www.npmjs.com/package/@mirasen/license-gate`
- **AND** both links SHALL open in a new browsing context with `rel` containing `noopener` and `noreferrer`.

#### Scenario: Hero side card

- **WHEN** the hero renders
- **THEN** an `aside.card.hero-side` SHALL be rendered next to `.hero-copy` with the card title `"Built to fail closed"` and a bullet list of exactly four items: `npm dependency graphs`, `workspaces and monorepos`, `CI policy checks`, `explicit override review`.

### Requirement: Quick Start section contains one runnable snippet

The Quick Start section SHALL contain exactly one code block whose four commands, executed in order in a clean npm project, produce a working License Gate check.

#### Scenario: Quick Start snippet content

- **WHEN** the Quick Start section renders
- **THEN** a `<pre><code>` element SHALL contain, in order, four command lines: an `npm install -D @mirasen/license-gate` line, a `mkdir -p licenses` line, a line writing the literal string `MIT` into `licenses/allowed-hard.txt`, and an `npx license-gate check` line.

#### Scenario: Quick Start caption

- **WHEN** the Quick Start section renders
- **THEN** the section SHALL include the sentence `"Run it after npm ci. Unknown or unapproved license strings fail the build."` positioned adjacent to the code block
- **AND** the section SHALL include one anchor pointing at the License Gate README on GitHub for the full command reference.

#### Scenario: Quick Start declares the Node.js runtime prerequisite

- **WHEN** the Quick Start section renders
- **THEN** the section SHALL include the literal factual line `"Requires Node.js ≥ 22.9.0."` inside the same `.card` as the code block, positioned adjacent to the code block
- **AND** this line SHALL NOT be rendered as a section header or a heading element; it is a plain paragraph.

#### Scenario: Quick Start does not duplicate the README

- **WHEN** the page renders
- **THEN** the Quick Start section SHALL contain exactly one code block; additional command matrices, flag tables, or expanded CLI reference material SHALL NOT be embedded on the page.

### Requirement: Policy-model section states the trust story

The How-it-works section SHALL state, in prose adjacent to a numbered install-and-run list, the core policy behavior: default-deny, literal license-string comparison, structural-only SPDX parsing with literal leaf comparison, and locally read installed dependency graph via `@npmcli/arborist`.

#### Scenario: Policy prose mentions the core behaviors

- **WHEN** the How-it-works section renders
- **THEN** the prose SHALL name at minimum: default-deny, literal comparison against `licenses/allowed-hard.txt`, SPDX leaves checked literally, and reading the installed graph via `@npmcli/arborist`.

#### Scenario: Command surface badges

- **WHEN** the How-it-works section renders
- **THEN** the section SHALL include a `.theme-list` of at least the following badges, each rendered as a `.badge`: `check`, `collect`, `--workspace`, `--cwd`, `--json`.

### Requirement: "What it will not do" section lists scope boundaries

A dedicated section SHALL list the tool's intentional scope boundaries, presented as boundaries rather than gaps.

#### Scenario: Boundary card set

- **WHEN** the "What it will not do" section renders
- **THEN** it SHALL contain at minimum five `.card` entries carrying the following boundary statements: `No license file reading`, `No license normalization`, `No project-root walk-up`, `No silent excludes`, `npm-first scope`
- **AND** the `npm-first scope` card SHALL frame the tool as intentionally scoped to npm-installed graphs (not as a limitation), using version-neutral wording (no `v1`).

### Requirement: Links section carries neutral outbound CTAs with no status/version framing

The final section SHALL be a neutral `Links` section that routes the reader to the authoritative sources (npm, GitHub, and optionally the changelog). It SHALL NOT assert version or maintenance status, so that package state is read from npm/GitHub rather than from static marketing copy.

#### Scenario: Links section copy

- **WHEN** the Links section renders
- **THEN** the section header SHALL use kicker `"Links"` and an `h2` reading `"Use it from npm or inspect the source"`
- **AND** the section lead SHALL read `"Install the package from npm, review the README for the full command reference, or inspect the repository before adding it to CI."`
- **AND** the section SHALL NOT contain the strings `"v1"`, `"v1 released"`, `"released"`, `"Status"`, `"actively maintained"`, `"enterprise"`, `"compliance"`, `"complete"`, `"revolutionary"`, `"all-in-one"`, `"world-class"`, or `"cutting-edge"`, and SHALL NOT claim legal or regulatory guarantees.

#### Scenario: No status/version copy anywhere on the page

- **WHEN** the full `/license-gate` page renders
- **THEN** no user-facing copy SHALL assert a release version or maintenance status (e.g. `"v1 released"`, `"Used in Mirasen projects"`), and no scope-boundary card SHALL carry version framing — the `npm-first scope` card uses version-neutral wording. The page carries no `"v1"` string in any user-facing copy.

#### Scenario: Links action row

- **WHEN** the Links section renders
- **THEN** its `.section-actions` row SHALL contain at minimum two external links: one primary-preset link to the GitHub repository at `https://github.com/mirasen-io/license-gate` labelled `"Repository"`, and one tonal-preset link to the npm package at `https://www.npmjs.com/package/@mirasen/license-gate` labelled `"Package"`
- **AND** it SHALL additionally contain a tonal-preset external link to the GitHub-hosted `CHANGELOG.md` labelled `"Changelog"` **iff** the `../license-gate/CHANGELOG.md` inspection at implementation time (per design.md D6.1) determines that the file contains substantive release content
- **AND** every present link SHALL open in a new browsing context with `rel` containing `noopener` and `noreferrer`.

### Requirement: Page-local nav retargets shared external links

The `/license-gate` route SHALL supply a page-local `NavConfig` such that when the AppBar renders on this page, its GitHub and npm links target the License Gate resources.

#### Scenario: licenseGateNav is loaded via +layout.ts

- **WHEN** a visitor navigates to any `/license-gate` route
- **THEN** the layout SHALL supply a `NavConfig` whose `brand` is the shared Mirasen brand
- **AND** whose `links` array contains, in order: `Chess Lore` (internal, `activeMatch: 'prefix'`), `Chessboard` (internal, `activeMatch: 'prefix'`), a GitHub external link targeting `https://github.com/mirasen-io/license-gate`, an npm external link targeting `https://www.npmjs.com/package/@mirasen/license-gate`.

#### Scenario: AppBar picks up the page-local NavConfig

- **WHEN** the AppBar renders on `/license-gate`
- **THEN** its GitHub link SHALL point at `https://github.com/mirasen-io/license-gate`
- **AND** its npm link SHALL point at `https://www.npmjs.com/package/@mirasen/license-gate`
- **AND** neither the `mirasen-io` organization GitHub URL nor the `@mirasen` npm organization URL SHALL appear as the target of a top-nav link on this page.

### Requirement: License Gate is not promoted in the global top nav

The site's global top nav SHALL NOT contain a `/license-gate` entry. License Gate remains discoverable via the home-page secondary mention and via direct navigation, but does not appear as a peer of `Chess Lore` or `Chessboard` in the top-nav link list.

#### Scenario: rootNav is unchanged

- **WHEN** the AppBar renders on `/`, `/chess-lore`, or any route whose `nav` falls through to `rootNav`
- **THEN** the top-nav link list SHALL contain exactly `Chess Lore`, `Chessboard`, `GitHub` (`mirasen-io` org), `npm` (`@mirasen` org), in that order
- **AND** no `/license-gate` link SHALL be present.

#### Scenario: chessboardNav is unchanged

- **WHEN** the AppBar renders on `/chessboard` or any route below it
- **THEN** the top-nav link list SHALL match the pre-change `chessboardNav` order and targets
- **AND** no `/license-gate` link SHALL be present.

### Requirement: Home-page secondary mention

The home page SHALL contain a single subordinate section referencing License Gate as a secondary engineering tool, placed after the existing brand-structure section.

#### Scenario: Secondary section placement and shape

- **WHEN** `/` renders
- **THEN** it SHALL contain a new `section.site-section` positioned after the existing `brand-heading` section
- **AND** the new section SHALL use kicker `"Open source"`, `h2` `"Engineering tools"`, and section lead `"Mirasen also publishes small infrastructure tools built for its own engineering workflow."`
- **AND** the section body SHALL be a single `article.card.p-6.max-w-2xl` (not a `.card-grid`, not `.spotlight`) with title `"Mirasen License Gate"` and one paragraph body reading `"A strict local license policy gate for npm projects. Built for default-deny CI checks."`
- **AND** the section SHALL contain a `.section-actions` row with exactly one CTA: an internal link to `/license-gate` labelled `"View License Gate"` resolved via `resolve('/license-gate')`.

#### Scenario: Secondary section does not compete with product pillars

- **WHEN** `/` renders
- **THEN** the new section SHALL NOT use the `.spotlight` treatment
- **AND** SHALL NOT introduce a `.card-grid.three-up` or `.card-grid.two-up` block
- **AND** the existing Chess Lore, Chessboard, and brand-structure sections SHALL render with the same copy and DOM structure as before this change.

### Requirement: Page metadata and JSON-LD

The `/license-gate` page SHALL emit `<svelte:head>` metadata and one JSON-LD `SoftwareSourceCode` block scoped to the License Gate tool, without vocabulary implying legal or compliance services.

#### Scenario: Head metadata

- **WHEN** `/license-gate` renders
- **THEN** the page SHALL emit `<title>` containing `"Mirasen License Gate"` and referencing strict license policy for npm projects, `<meta name="description">` describing strict local default-deny npm license policy checks, `<link rel="canonical" href="https://mirasen.io/license-gate">`, and the four OG tags `og:title`, `og:description`, `og:type="website"`, `og:url="https://mirasen.io/license-gate"`.

#### Scenario: JSON-LD shape

- **WHEN** `/license-gate` renders
- **THEN** the page SHALL emit exactly one `application/ld+json` script whose parsed JSON SHALL be a `SoftwareSourceCode` object with `name: "Mirasen License Gate"`, `alternateName: "@mirasen/license-gate"`, `programmingLanguage: "TypeScript"`, `runtimePlatform: "Node.js"`, `codeRepository: "https://github.com/mirasen-io/license-gate"`, `sameAs` containing both the GitHub and npm URLs, and a `publisher` `Organization` for Mirasen at `url: "https://mirasen.io"`
- **AND** the JSON SHALL contain a `subjectOf` entry for the README at `https://github.com/mirasen-io/license-gate/blob/main/README.md`
- **AND** the JSON SHALL contain a `subjectOf` entry for the CHANGELOG at `https://github.com/mirasen-io/license-gate/blob/main/CHANGELOG.md` **iff** the `../license-gate/CHANGELOG.md` inspection at implementation time (per design.md D6.1) determines that the file contains substantive release content.

#### Scenario: JSON-LD does not overclaim

- **WHEN** the JSON-LD is parsed
- **THEN** it SHALL NOT contain `LegalService`, `ComplianceRegulation`, `applicationCategory: "SecurityApplication"`, or any other value implying legal, regulatory, or compliance certification services.

### Requirement: License Gate is discoverable through the sitemap

The site SHALL expose a static sitemap that includes the canonical `/license-gate` URL alongside the existing public canonical pages, with no duplicate URL entries.

#### Scenario: Sitemap is present in the static build output and includes the new page

- **WHEN** the site is built with `npm run build`
- **THEN** the static output SHALL include a file at `build/sitemap.xml` that is a well-formed XML `urlset` per the `http://www.sitemaps.org/schemas/sitemap/0.9` schema
- **AND** the sitemap SHALL include a `<url>` entry whose `<loc>` is exactly `https://mirasen.io/license-gate`
- **AND** the sitemap SHALL include `<url>` entries for every existing public canonical route: `https://mirasen.io`, `https://mirasen.io/chess-lore`, `https://mirasen.io/chessboard`, `https://mirasen.io/chessboard/examples`, `https://mirasen.io/chessboard/examples/minimal`, `https://mirasen.io/chessboard/examples/promotion`, `https://mirasen.io/chessboard/examples/chessjs`, `https://mirasen.io/chessboard/examples/live-games-grid`
- **AND** the sitemap SHALL NOT contain duplicate `<loc>` values.

#### Scenario: Sitemap changes are limited to adding the one new entry

- **WHEN** the change diff is reviewed
- **THEN** the sitemap change SHALL be limited to adding one `<url>` entry for `https://mirasen.io/license-gate`
- **AND** SHALL NOT introduce dynamic date generation, `<lastmod>`, `<changefreq>`, or `<priority>` metadata on any entry
- **AND** SHALL NOT introduce a filesystem-crawl or sitemap-framework dependency
- **AND** SHALL NOT modify `static/robots.txt` (which does not currently declare a `Sitemap:` directive).

### Requirement: Changesets entry for the site package

The change SHALL include exactly one Changesets `.md` entry declaring a `patch` bump for the private `@mirasen/main-website` package, matching the release workflow the repo already uses.

#### Scenario: A changeset entry exists and does not touch versioning artifacts directly

- **WHEN** the change diff is reviewed
- **THEN** the diff SHALL contain exactly one new file under `.changeset/*.md`
- **AND** its YAML frontmatter SHALL declare `'@mirasen/main-website': patch`
- **AND** its body SHALL summarise the change in a single sentence naming the License Gate landing page, page-local navigation, sitemap entry, and secondary home-page engineering-tools link
- **AND** the diff SHALL NOT modify `package.json`'s `version` field, `CHANGELOG.md`, or any other release artifact directly — Changesets will roll those up in a subsequent version PR.
