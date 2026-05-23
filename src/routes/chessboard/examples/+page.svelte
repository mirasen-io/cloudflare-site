<script lang="ts">
	import { resolve } from '$app/paths';

	const minimalHref = resolve('/chessboard/examples/minimal');
	const chessboardHref = resolve('/chessboard');

	const pageTitle = 'Mirasen Chessboard — Examples';
	const pageDescription = 'Live examples for the Mirasen Chessboard platform.';
	const pageUrl = 'https://mirasen.io/chessboard/examples';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={pageUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
</svelte:head>

<main class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Mirasen Chessboard</p>
			<h1 class="hero-title">Examples</h1>
			<p class="lead">Live examples for the Mirasen Chessboard platform.</p>
			<div class="hero-actions">
				<a class="btn preset-tonal" href={chessboardHref}>Back to Chessboard</a>
			</div>
		</div>
	</section>

	<section aria-labelledby="examples-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Available examples</p>
			<h2 id="examples-heading" class="section-title">Browse the current examples</h2>
		</header>

		<div class="card-grid two-up">
			<a class="card p-6" href={minimalHref}>
				<h3 class="card-title">Minimal</h3>
				<p>A minimal Mirasen Chessboard example showing free movement and orientation toggle.</p>
			</a>
		</div>
	</section>
</main>
