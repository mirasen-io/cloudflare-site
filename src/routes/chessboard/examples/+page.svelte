<script lang="ts">
	import { resolve } from '$app/paths';

	const homeChessboardHref = resolve('/chessboard');
	const minimalHref = resolve('/chessboard/examples/minimal');
	const promotionHref = resolve('/chessboard/examples/promotion');
	const chessjsHref = resolve('/chessboard/examples/chessjs');
	const liveGamesGridHref = resolve('/chessboard/examples/live-games-grid');

	const githubHref = 'https://github.com/mirasen-io/chessboard';
	const npmHref = 'https://www.npmjs.com/package/@mirasen/chessboard';

	const pageTitle = 'Mirasen Chessboard Examples';
	const pageDescription =
		'Interactive examples for Mirasen Chessboard, the open-source chessboard platform by Mirasen.';
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
			<p class="eyebrow">Mirasen Chessboard examples</p>
			<h1 class="hero-title">Interactive board examples</h1>
			<p class="lead">
				Explore focused examples for Mirasen Chessboard interaction, rendering, annotations,
				promotion, and chess.js integration.
			</p>
			<div class="hero-actions">
				<a class="btn preset-filled-primary-500" href={chessjsHref}> Open chess.js game example </a>
				<a class="btn preset-tonal" href={homeChessboardHref}>Back to Chessboard</a>
			</div>
		</div>

		<aside class="hero-side card p-6">
			<h2 class="card-title">What examples cover</h2>
			<ul class="hero-point-list">
				<li class="inner-panel">
					<p class="inner-panel-title">Interactive board setup</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Movement and orientation controls</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Built-in circles and arrows</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Promotion and extension flows</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Rules-backed chess.js integration</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Parallel multi-board animations</p>
				</li>
			</ul>
		</aside>
	</section>

	<section aria-labelledby="examples-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Available examples</p>
			<h2 id="examples-heading" class="section-title">Start with a working board</h2>
			<p class="section-lead">
				The examples are organized as small pages focused on one scenario at a time. More examples
				will be added as the public surface grows.
			</p>
		</header>

		<div class="card-grid two-up">
			<article class="card p-6">
				<h3 class="card-title">Minimal interactive example</h3>
				<p>
					A compact board example with free movement, orientation toggle, reset position, and random
					move controls.
				</p>
				<div class="section-actions">
					<a class="btn preset-filled-primary-500" href={minimalHref}>Open example</a>
				</div>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Promotion flow</h3>
				<p>
					A focused example for promotion handling and deferred move resolution through first-party
					extensions.
				</p>
				<div class="section-actions">
					<a class="btn preset-tonal" href={promotionHref}>Open example</a>
				</div>
			</article>

			<article class="card p-6">
				<h3 class="card-title">chess.js game example</h3>
				<p>
					A rules-backed game example using the built-in chess.js adapter, legal destinations,
					built-in annotations, promotion, castling, en passant, and random computer replies.
				</p>
				<div class="section-actions">
					<a class="btn preset-tonal" href={chessjsHref}>Open example</a>
				</div>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Live games grid</h3>
				<p>
					A wide showcase of twelve independent boards animating in parallel — each with its own
					chess.js engine and randomized timer. Tap any board to open the chess.js example.
				</p>
				<div class="section-actions">
					<a class="btn preset-tonal" href={liveGamesGridHref}>Open example</a>
				</div>
			</article>
		</div>
	</section>

	<section aria-labelledby="library-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Library links</p>
			<h2 id="library-heading" class="section-title">Use the package in your own project</h2>
			<p class="section-lead">
				Mirasen Chessboard is published as an open-source package and developed in public on GitHub.
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
			<a class="btn preset-tonal" href={homeChessboardHref}>Chessboard overview</a>
		</div>
	</section>
</main>
