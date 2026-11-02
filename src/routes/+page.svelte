<script lang="ts">
	import { resolve } from '$app/paths';

	const chessboardHref = resolve('/chessboard');
	const examplesHref = resolve('/chessboard/examples');
	const licenseGateHref = resolve('/license-gate');
	const siteUrl = 'https://mirasen.k-tarmyshov.workers.dev';
	const pageTitle = 'mirasen — Open-source libraries';
	const pageDescription =
		'mirasen publishes open-source libraries for chess interfaces and npm license policy checks.';
	const pageUrl = siteUrl;

	const libraries = [
		{
			name: '@mirasen/chessboard',
			description:
				'A framework-agnostic TypeScript library for interactive chessboards, rendering, and board features.',
			repository: 'https://github.com/mirasen-io/chessboard',
			npm: 'https://www.npmjs.com/package/@mirasen/chessboard',
			pageLabel: 'Live examples',
			pageLink: examplesHref
		},
		{
			name: '@mirasen/react-chessboard',
			description:
				'A React integration for the core chessboard library, with a component-oriented API.',
			repository: 'https://github.com/mirasen-io/react-chessboard',
			npm: 'https://www.npmjs.com/package/@mirasen/react-chessboard',
			pageLabel: 'About the libraries',
			pageLink: chessboardHref
		},
		{
			name: '@mirasen/license-gate',
			description:
				'A local, default-deny license policy gate for npm projects, workspaces, and monorepos.',
			repository: 'https://github.com/mirasen-io/license-gate',
			npm: 'https://www.npmjs.com/package/@mirasen/license-gate',
			pageLabel: 'Documentation',
			pageLink: licenseGateHref
		}
	];

	const organizationLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': `${siteUrl}/#organization`,
		name: 'mirasen',
		url: pageUrl,
		description: 'mirasen publishes open-source libraries for chess interfaces and npm tooling.',
		sameAs: ['https://github.com/mirasen-io', 'https://www.npmjs.com/org/mirasen']
	});

	const websiteLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${siteUrl}/#website`,
		name: 'mirasen Libraries',
		url: pageUrl,
		publisher: { '@id': `${siteUrl}/#organization` }
	});

	const organizationLdScript =
		`<` + `script type="application/ld+json">${organizationLd}</` + `script>`;
	const websiteLdScript = `<` + `script type="application/ld+json">${websiteLd}</` + `script>`;
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
	{@html organizationLdScript}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html websiteLdScript}
</svelte:head>

<main class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Open-source libraries by mirasen</p>
			<h1 class="hero-title">Libraries for chess and npm tooling</h1>
			<p class="lead">
				Small, focused TypeScript packages for building chess interfaces and checking npm license
				policies.
			</p>
			<p class="hero-subcopy">
				Explore the libraries, read their source, or try the interactive chessboard examples.
			</p>
			<div class="hero-actions">
				<a class="btn preset-filled-primary-500" href={chessboardHref}>Explore chessboard</a>
				<a class="btn preset-tonal" href={licenseGateHref}>Explore License Gate</a>
			</div>
		</div>
		<aside class="hero-side card p-6">
			<h2 class="card-title">Published libraries</h2>
			<ul class="hero-point-list">
				{#each libraries as library (library.name)}
					<li class="inner-panel">
						<p class="inner-panel-title">{library.name}</p>
						<p class="inner-panel-body">{library.description}</p>
					</li>
				{/each}
			</ul>
		</aside>
	</section>

	<section aria-labelledby="libraries-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Open source</p>
			<h2 id="libraries-heading" class="section-title">Three focused libraries</h2>
			<p class="section-lead">
				Each package has its own repository and npm page. The chessboard packages share a demo site;
				License Gate has its own technical guide.
			</p>
		</header>

		<div class="card-grid three-up">
			{#each libraries as library (library.name)}
				<article class="flex flex-col items-start card p-6">
					<h3 class="card-title">{library.name}</h3>
					<p>{library.description}</p>
					<div class="section-actions mt-auto">
						<a class="btn preset-tonal" href={library.pageLink}>{library.pageLabel}</a>
						<a
							class="btn preset-tonal"
							href={library.repository}
							target="_blank"
							rel="external noopener noreferrer">GitHub</a
						>
						<a
							class="btn preset-tonal"
							href={library.npm}
							target="_blank"
							rel="external noopener noreferrer">npm</a
						>
					</div>
				</article>
			{/each}
		</div>
	</section>
</main>
