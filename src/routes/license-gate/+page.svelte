<script lang="ts">
	const githubHref = 'https://github.com/mirasen-io/license-gate';
	const npmHref = 'https://www.npmjs.com/package/@mirasen/license-gate';
	const readmeHref = 'https://github.com/mirasen-io/license-gate/blob/main/README.md';
	const changelogHref = 'https://github.com/mirasen-io/license-gate/blob/main/CHANGELOG.md';

	const pageTitle = 'Mirasen License Gate — Strict license policy gate for npm projects';
	const pageDescription =
		'Mirasen License Gate is a strict, local, default-deny license policy gate for npm projects — single package, workspaces, and monorepos. Licenses are compared verbatim; unknown or unapproved strings fail the build.';
	const ogDescription =
		'A strict, local, default-deny license policy gate for npm projects — single package, workspaces, and monorepos.';
	const pageUrl = 'https://mirasen.io/license-gate';
	const orgUrl = 'https://mirasen.io';

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareSourceCode',
		name: 'Mirasen License Gate',
		alternateName: '@mirasen/license-gate',
		description:
			'A strict, local, default-deny license policy gate for npm projects, workspaces, and monorepos. Reads the installed dependency graph via @npmcli/arborist and checks every package license verbatim against a local allowlist.',
		url: pageUrl,
		codeRepository: githubHref,
		programmingLanguage: 'TypeScript',
		runtimePlatform: 'Node.js',
		license: 'https://github.com/mirasen-io/license-gate/blob/main/LICENSE',
		keywords: ['npm', 'license policy', 'SPDX', 'CI', 'monorepo', 'open source', 'dev tool'],
		sameAs: [githubHref, npmHref],
		subjectOf: [
			{
				'@type': 'CreativeWork',
				name: '@mirasen/license-gate README',
				url: readmeHref
			},
			{
				'@type': 'CreativeWork',
				name: '@mirasen/license-gate changelog',
				url: changelogHref
			}
		],
		publisher: {
			'@type': 'Organization',
			name: 'Mirasen',
			url: orgUrl
		}
	});

	const jsonLdScript = `<` + `script type="application/ld+json">${jsonLd}</` + `script>`;

	const quickStart = `npm install -D @mirasen/license-gate
mkdir -p licenses
echo "MIT" > licenses/allowed-hard.txt
npx license-gate check`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={pageUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={ogDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript}
</svelte:head>

<main class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Open-source engineering tool by Mirasen</p>
			<h1 class="hero-title">Mirasen License Gate</h1>
			<p class="lead">
				A strict, local, default-deny license policy gate for npm projects — single package,
				workspaces, and monorepos.
			</p>
			<div class="hero-actions">
				<a
					class="btn preset-filled-primary-500"
					href={githubHref}
					target="_blank"
					rel="external noopener noreferrer"
				>
					View on GitHub
				</a>
				<a
					class="btn preset-tonal"
					href={npmHref}
					target="_blank"
					rel="external noopener noreferrer"
				>
					View on npm
				</a>
			</div>
		</div>

		<aside class="hero-side card p-6">
			<h2 class="card-title">Built to fail closed</h2>
			<ul class="hero-point-list">
				<li class="inner-panel">
					<p class="inner-panel-title">npm dependency graphs</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">workspaces and monorepos</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">CI policy checks</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">explicit override review</p>
				</li>
			</ul>
		</aside>
	</section>

	<section aria-labelledby="overview-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Overview</p>
			<h2 id="overview-heading" class="section-title">Strict by design</h2>
			<p class="section-lead">
				License Gate reads what is physically installed and enforces a local allowlist you control.
				It refuses to guess, and it makes every exception visible.
			</p>
		</header>

		<div class="card-grid two-up">
			<article class="card p-6">
				<h3 class="card-title">Local &amp; literal</h3>
				<p>
					License Gate reads what is physically installed via @npmcli/arborist and compares each
					package’s license string verbatim against your allowlist. Apache 2.0 is not Apache-2.0. It
					does not guess, infer, or normalise.
				</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Escape hatches, visible</h3>
				<p>
					Overrides live in <code>licenses/allowed-packages.txt</code>. They are allowed, but every
					matched override is surfaced in the report as <code>matchedPackageRule</code> — never a silent
					exclude.
				</p>
			</article>
		</div>
	</section>

	<section aria-labelledby="quickstart-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Quick start</p>
			<h2 id="quickstart-heading" class="section-title">Install and run</h2>
		</header>

		<div class="card p-6">
			<p>
				Run it after <code>npm ci</code>. Unknown or unapproved license strings fail the build.
			</p>
			<pre class="overflow-x-auto rounded bg-surface-100-900 p-4 text-sm">
        <code>{quickStart}</code>
      </pre>
			<p>Requires Node.js ≥ 22.9.0.</p>
			<p>
				See the
				<a href={readmeHref} target="_blank" rel="external noopener noreferrer">README</a>
				for the full command reference.
			</p>
		</div>
	</section>

	<section aria-labelledby="policy-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">How it works</p>
			<h2 id="policy-heading" class="section-title">Policy model</h2>
		</header>

		<div class="spotlight card p-6 md:p-10">
			<div class="spotlight-grid">
				<div class="spotlight-copy">
					<p>
						License Gate reads the installed dependency graph via @npmcli/arborist. Each package’s
						license string is checked verbatim against <code>licenses/allowed-hard.txt</code>. SPDX
						expressions are parsed only to enumerate leaves, and each leaf is then checked literally
						— everything not explicitly allowed is a violation. Packages whose license cannot be
						determined need an explicit entry in <code>licenses/allowed-packages.txt</code>, and
						every matched override stays visible in the report as <code>matchedPackageRule</code>.
					</p>
					<div class="theme-list" aria-label="Command surface">
						<span class="badge preset-filled-surface-50-950">check</span>
						<span class="badge preset-filled-surface-50-950">collect</span>
						<span class="badge preset-filled-surface-50-950">--workspace</span>
						<span class="badge preset-filled-surface-50-950">--cwd</span>
						<span class="badge preset-filled-surface-50-950">--json</span>
					</div>
				</div>

				<ul class="numbered-list">
					<li>
						<span class="badge-icon shrink-0 preset-filled-primary-500" aria-hidden="true">1</span>
						<p>Install <code>@mirasen/license-gate</code> as a dev dependency.</p>
					</li>
					<li>
						<span class="badge-icon shrink-0 preset-filled-primary-500" aria-hidden="true">2</span>
						<p>Add <code>licenses/allowed-hard.txt</code> with one license per line.</p>
					</li>
					<li>
						<span class="badge-icon shrink-0 preset-filled-primary-500" aria-hidden="true">3</span>
						<p>Run <code>license-gate check</code> after <code>npm ci</code>.</p>
					</li>
				</ul>
			</div>
		</div>
	</section>

	<section aria-labelledby="scope-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Scope boundaries</p>
			<h2 id="scope-heading" class="section-title">What it will not do</h2>
			<p class="section-lead">
				These are intentional boundaries, not gaps. Strictness is the point.
			</p>
		</header>

		<div class="card-grid three-up">
			<article class="card p-6">
				<h3 class="card-title">No license file reading</h3>
				<p>LICENSE, COPYING, and README are never opened.</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">No license normalization</h3>
				<p><code>Apache 2.0</code> is not the same as <code>Apache-2.0</code>.</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">No project-root walk-up</h3>
				<p><code>--cwd</code> is the only way to change the project root.</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">No silent excludes</h3>
				<p>Every package the gate considered is accounted for in the report.</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">npm-first scope</h3>
				<p>
					The tool is intentionally scoped to npm-installed graphs. pnpm, yarn, Gradle, and Maven
					are out of scope.
				</p>
			</article>
		</div>
	</section>

	<section aria-labelledby="links-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Links</p>
			<h2 id="links-heading" class="section-title">Use it from npm or inspect the source</h2>
			<p class="section-lead">
				Install the package from npm, review the README for the full command reference, or inspect
				the repository before adding it to CI.
			</p>
		</header>

		<div class="section-actions">
			<a
				class="btn preset-filled-primary-500"
				href={githubHref}
				target="_blank"
				rel="external noopener noreferrer"
			>
				Repository
			</a>
			<a class="btn preset-tonal" href={npmHref} target="_blank" rel="external noopener noreferrer">
				Package
			</a>
			<a
				class="btn preset-tonal"
				href={changelogHref}
				target="_blank"
				rel="external noopener noreferrer"
			>
				Changelog
			</a>
		</div>
	</section>
</main>
