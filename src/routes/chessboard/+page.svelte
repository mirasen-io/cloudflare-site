<script lang="ts">
	import { resolve } from '$app/paths';

	const homeHref = resolve('/');
	const chessLoreHref = resolve('/chess-lore');
	const examplesHref = resolve('/chessboard/examples');

	const githubHref = 'https://github.com/mirasen-io/chessboard';
	const npmHref = 'https://www.npmjs.com/package/@mirasen/chessboard';
	const reactGithubHref = 'https://github.com/mirasen-io/react-chessboard';
	const reactNpmHref = 'https://www.npmjs.com/package/@mirasen/react-chessboard';

	const pageTitle = 'Mirasen Chessboard — Open-source chessboard platform';
	const pageDescription =
		'Mirasen Chessboard is an open-source chessboard platform by Mirasen, built for real chess interaction, modern web chess applications, and the broader Mirasen learning ecosystem.';
	const ogDescription =
		'Open-source chessboard platform by Mirasen, built for real chess interaction, modern web chess applications, and the broader Mirasen learning ecosystem.';
	const pageUrl = 'https://mirasen.io/chessboard';
	const examplesUrl = 'https://mirasen.io/chessboard/examples';
	const orgUrl = 'https://mirasen.io';

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'SoftwareSourceCode',
				name: '@mirasen/chessboard',
				alternateName: 'Mirasen Chessboard',
				description:
					'Framework-agnostic TypeScript chessboard library with built-in interaction, annotations, promotion UI, animation, DOM/SVG rendering, and extension-driven architecture.',
				url: pageUrl,
				codeRepository: githubHref,
				programmingLanguage: 'TypeScript',
				runtimePlatform: 'Web',
				license: 'https://github.com/mirasen-io/chessboard/blob/main/LICENSE',
				sameAs: [githubHref, npmHref],
				subjectOf: [
					{
						'@type': 'CreativeWork',
						name: '@mirasen/chessboard README',
						url: 'https://github.com/mirasen-io/chessboard/blob/main/README.md'
					},
					{
						'@type': 'CreativeWork',
						name: '@mirasen/chessboard changelog',
						url: 'https://github.com/mirasen-io/chessboard/blob/main/CHANGELOG.md'
					},
					{
						'@type': 'CreativeWork',
						name: '@mirasen/chessboard live examples',
						url: examplesUrl
					}
				],
				publisher: {
					'@type': 'Organization',
					name: 'Mirasen',
					url: orgUrl
				}
			},
			{
				'@type': 'SoftwareSourceCode',
				name: '@mirasen/react-chessboard',
				alternateName: 'Mirasen React Chessboard',
				description:
					'React wrapper for Mirasen Chessboard, providing a React component with the same built-in chess interaction, annotations, promotion UI, animation, and chess.js integration.',
				url: pageUrl,
				codeRepository: reactGithubHref,
				programmingLanguage: 'TypeScript',
				runtimePlatform: 'React',
				license: 'https://github.com/mirasen-io/react-chessboard/blob/main/LICENSE',
				sameAs: [reactGithubHref, reactNpmHref],
				isBasedOn: {
					'@type': 'SoftwareSourceCode',
					name: '@mirasen/chessboard',
					codeRepository: githubHref
				},
				publisher: {
					'@type': 'Organization',
					name: 'Mirasen',
					url: orgUrl
				}
			}
		]
	});

	const jsonLdScript = `<` + `script type="application/ld+json">${jsonLd}</` + `script>`;
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
			<p class="eyebrow">Open-source chessboard platform by Mirasen</p>
			<h1 class="hero-title">Mirasen Chessboard</h1>
			<p class="lead">
				Mirasen Chessboard is built for real chess interaction, modern web chess applications, and
				the broader Mirasen learning ecosystem.
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
				<a class="btn preset-tonal" href={examplesHref}>View examples</a>
			</div>
		</div>

		<aside class="hero-side card p-6">
			<h2 class="card-title">What it is built for</h2>
			<ul class="hero-point-list">
				<li class="inner-panel">
					<p class="inner-panel-title">Modern web chess applications</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Real chess interaction and input</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Extension-driven board features</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Current and future Mirasen tools</p>
				</li>
			</ul>
		</aside>
	</section>

	<section aria-labelledby="overview-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Overview</p>
			<h2 id="overview-heading" class="section-title">A foundation, not a detached side project</h2>
			<p class="section-lead">
				Chessboard is not a separate product story competing with Mirasen Chess Lore. It is the
				foundation layer that supports richer learning workflows, interaction patterns, and future
				tools across the broader Mirasen ecosystem.
			</p>
		</header>

		<div class="card-grid two-up">
			<article class="card p-6">
				<h3 class="card-title">Built as infrastructure</h3>
				<p>
					Mirasen Chessboard exists to provide a modern platform layer for rendering, interaction,
					and extensibility. It is designed to support serious chess applications rather than remain
					only a visual board widget.
				</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Also a public platform</h3>
				<p>
					At the same time, Chessboard remains a distinct open-source platform with its own GitHub
					and npm presence. It can stand on its own while still fitting clearly into the broader
					Mirasen structure.
				</p>
			</article>
		</div>
	</section>

	<section aria-labelledby="why-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Why it matters</p>
			<h2 id="why-heading" class="section-title">Built for richer chess applications</h2>
			<p class="section-lead">
				The board layer matters because serious chess applications need more than static rendering.
				They need interaction, extensibility, and a foundation that can support more demanding
				workflows over time.
			</p>
		</header>

		<div class="card-grid three-up">
			<article class="card p-6">
				<h3 class="card-title">Rendering</h3>
				<p>
					A modern chessboard foundation for displaying positions, transitions, and board state
					clearly across web applications.
				</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Interaction</h3>
				<p>Built to support real board interaction rather than only static presentation.</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Extensibility</h3>
				<p>Designed to support richer features for current and future chess tools.</p>
			</article>
		</div>
	</section>

	<section aria-labelledby="ecosystem-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Inside Mirasen</p>
			<h2 id="ecosystem-heading" class="section-title">
				How Chessboard fits the broader ecosystem
			</h2>
			<p class="section-lead">
				Mirasen is building structured chess learning tools and systems. Chessboard is the
				infrastructure layer inside that work, while Chess Lore represents the current main product
				direction.
			</p>
		</header>

		<div class="spotlight card p-6 md:p-10">
			<div class="spotlight-grid">
				<div class="spotlight-copy">
					<p>
						This gives Chessboard a clear role: not just a technical asset, but a foundation that
						supports broader product and learning workflows over time.
					</p>
					<div class="theme-list" aria-label="Ecosystem structure">
						<span class="badge preset-filled-surface-50-950">Mirasen</span>
						<span class="badge preset-filled-surface-50-950">Chess Lore</span>
						<span class="badge preset-filled-surface-50-950">Chessboard</span>
						<span class="badge preset-filled-surface-50-950">foundation layer</span>
					</div>
				</div>

				<ul class="numbered-list">
					<li><p>Mirasen — brand and ecosystem</p></li>
					<li><p>Chess Lore — current main product direction</p></li>
					<li><p>Chessboard — open-source platform and foundation layer</p></li>
				</ul>
			</div>
		</div>

		<div class="section-actions">
			<a class="btn preset-filled-primary-500" href={chessLoreHref}>Explore Chess Lore</a>
			<a class="btn preset-tonal" href={homeHref}>Back to Mirasen</a>
		</div>
	</section>

	<section aria-labelledby="status-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Status</p>
			<h2 id="status-heading" class="section-title">Released and actively maintained</h2>
			<p class="section-lead">
				Mirasen Chessboard is available as an open-source TypeScript package, with the core board
				package and React wrapper published on npm. The project is actively maintained and continues
				to evolve as the foundation for Mirasen’s chess interfaces.
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
			<a class="btn preset-tonal" href={examplesHref}>Examples</a>
		</div>
	</section>
</main>
