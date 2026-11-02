<script lang="ts">
	import { resolve } from '$app/paths';

	const examplesHref = resolve('/chessboard/examples');
	const githubHref = 'https://github.com/mirasen-io/chessboard';
	const npmHref = 'https://www.npmjs.com/package/@mirasen/chessboard';
	const reactGithubHref = 'https://github.com/mirasen-io/react-chessboard';
	const reactNpmHref = 'https://www.npmjs.com/package/@mirasen/react-chessboard';
	const pageTitle = 'mirasen Chessboard — Core library and React integration';
	const pageDescription =
		'Explore the framework-agnostic @mirasen/chessboard library and its separate React integration, @mirasen/react-chessboard.';
	const pageUrl = 'https://mirasen.k-tarmyshov.workers.dev/chessboard';
	const examplesUrl = `${pageUrl}/examples`;
	const orgId = 'https://mirasen.k-tarmyshov.workers.dev/#organization';

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': orgId,
				name: 'mirasen',
				url: 'https://mirasen.k-tarmyshov.workers.dev',
				sameAs: ['https://github.com/mirasen-io', 'https://www.npmjs.com/org/mirasen']
			},
			{
				'@type': 'SoftwareSourceCode',
				'@id': `${pageUrl}#core`,
				name: '@mirasen/chessboard',
				description:
					'Framework-agnostic TypeScript chessboard library with built-in interaction, annotations, promotion UI, animation, DOM/SVG rendering, and extension-driven architecture.',
				url: pageUrl,
				codeRepository: githubHref,
				programmingLanguage: 'TypeScript',
				runtimePlatform: 'Web',
				license: `${githubHref}/blob/main/LICENSE`,
				sameAs: [githubHref, npmHref],
				subjectOf: [
					{
						'@type': 'CreativeWork',
						name: '@mirasen/chessboard README',
						url: `${githubHref}/blob/main/README.md`
					},
					{
						'@type': 'CreativeWork',
						name: '@mirasen/chessboard changelog',
						url: `${githubHref}/blob/main/CHANGELOG.md`
					},
					{ '@type': 'CreativeWork', name: 'Live examples', url: examplesUrl }
				],
				publisher: { '@id': orgId }
			},
			{
				'@type': 'SoftwareSourceCode',
				'@id': `${pageUrl}#react`,
				name: '@mirasen/react-chessboard',
				description:
					'React integration for @mirasen/chessboard, exposing the board as a React component.',
				url: pageUrl,
				codeRepository: reactGithubHref,
				programmingLanguage: 'TypeScript',
				runtimePlatform: 'React',
				license: `${reactGithubHref}/blob/main/LICENSE`,
				sameAs: [reactGithubHref, reactNpmHref],
				isBasedOn: { '@id': `${pageUrl}#core` },
				publisher: { '@id': orgId }
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
	<meta property="og:description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript}
</svelte:head>

<main class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Open-source chess libraries by mirasen</p>
			<h1 class="hero-title">Chessboard for TypeScript and React</h1>
			<p class="lead">
				A framework-agnostic core library and a separate React integration for interactive chess
				interfaces.
			</p>
			<div class="hero-actions">
				<a class="btn preset-filled-primary-500" href={examplesHref}>Try the live examples</a>
				<a
					class="btn preset-tonal"
					href={githubHref}
					target="_blank"
					rel="external noopener noreferrer">Core on GitHub</a
				>
			</div>
		</div>
		<aside class="hero-side card p-6">
			<h2 class="card-title">Choose an integration</h2>
			<ul class="hero-point-list">
				<li class="inner-panel">
					<p class="inner-panel-title">@mirasen/chessboard</p>
					<p class="inner-panel-body">Framework-agnostic core library.</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">@mirasen/react-chessboard</p>
					<p class="inner-panel-body">React component integration.</p>
				</li>
			</ul>
		</aside>
	</section>

	<section aria-labelledby="packages-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Packages</p>
			<h2 id="packages-heading" class="section-title">Core library and React integration</h2>
			<p class="section-lead">
				The core package works without a framework. The React package provides a React component and
				builds on the core library.
			</p>
		</header>

		<div class="card-grid two-up">
			<article class="card p-6">
				<h3 class="card-title">@mirasen/chessboard</h3>
				<p>
					TypeScript chessboard library with board interaction, annotations, promotion UI,
					animation, DOM/SVG rendering, and extension-driven features.
				</p>
				<div class="section-actions">
					<a
						class="btn preset-tonal"
						href={githubHref}
						target="_blank"
						rel="external noopener noreferrer">GitHub</a
					>
					<a
						class="btn preset-tonal"
						href={npmHref}
						target="_blank"
						rel="external noopener noreferrer">npm</a
					>
					<a class="btn preset-tonal" href={examplesHref}>Live examples</a>
				</div>
			</article>
			<article class="card p-6">
				<h3 class="card-title">@mirasen/react-chessboard</h3>
				<p>
					React wrapper for the core library, exposing chessboard interaction through a React
					component.
				</p>
				<div class="section-actions">
					<a
						class="btn preset-tonal"
						href={reactGithubHref}
						target="_blank"
						rel="external noopener noreferrer">GitHub</a
					>
					<a
						class="btn preset-tonal"
						href={reactNpmHref}
						target="_blank"
						rel="external noopener noreferrer">npm</a
					>
				</div>
			</article>
		</div>
	</section>

	<section aria-labelledby="examples-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Try it</p>
			<h2 id="examples-heading" class="section-title">Interactive examples</h2>
			<p class="section-lead">
				Explore standalone boards, chess.js integration, promotion choices, and a live games grid.
			</p>
		</header>
		<div class="section-actions">
			<a class="btn preset-filled-primary-500" href={examplesHref}>Browse all examples</a>
		</div>
	</section>
</main>
