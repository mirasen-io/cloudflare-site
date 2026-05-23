<script lang="ts">
	import { resolve } from '$app/paths';
	import LiveCard, { type Meta } from './LiveCard.svelte';

	const examplesHref = resolve('/chessboard/examples');
	const chessjsHref = resolve('/chessboard/examples/chessjs');

	const pageTitle = 'Live games grid — Mirasen Chessboard examples';
	const pageDescription =
		'Twelve independent Mirasen Chessboard boards running chess.js games on randomized timers.';
	const pageUrl = 'https://mirasen.io/chessboard/examples/live-games-grid';

	const metaPresets: readonly Meta[] = [
		{
			topName: 'Bot Aurora',
			topRating: 1842,
			bottomName: 'Bot Quartz',
			bottomRating: 1790,
			time: '1+0'
		},
		{
			topName: 'Bot Cobalt',
			topRating: 2014,
			bottomName: 'Bot Saffron',
			bottomRating: 1976,
			time: '3+2'
		},
		{
			topName: 'Bot Indigo',
			topRating: 1655,
			bottomName: 'Bot Lumen',
			bottomRating: 1702,
			time: '5+0'
		},
		{
			topName: 'Bot Onyx',
			topRating: 2188,
			bottomName: 'Bot Cinder',
			bottomRating: 2154,
			time: '1+1'
		},
		{
			topName: 'Bot Pyrite',
			topRating: 1490,
			bottomName: 'Bot Verdant',
			bottomRating: 1521,
			time: '10+0'
		},
		{
			topName: 'Bot Mistral',
			topRating: 1901,
			bottomName: 'Bot Argent',
			bottomRating: 1888,
			time: '2+1'
		},
		{
			topName: 'Bot Cinnabar',
			topRating: 1733,
			bottomName: 'Bot Halite',
			bottomRating: 1768,
			time: '0:30'
		},
		{
			topName: 'Bot Petrichor',
			topRating: 2057,
			bottomName: 'Bot Selene',
			bottomRating: 2032,
			time: '3+0'
		},
		{
			topName: 'Bot Tundra',
			topRating: 1610,
			bottomName: 'Bot Solstice',
			bottomRating: 1644,
			time: '5+3'
		},
		{
			topName: 'Bot Vermillion',
			topRating: 2229,
			bottomName: 'Bot Slate',
			bottomRating: 2205,
			time: '1+0'
		},
		{
			topName: 'Bot Marigold',
			topRating: 1586,
			bottomName: 'Bot Obsidian',
			bottomRating: 1570,
			time: '15+10'
		},
		{
			topName: 'Bot Zephyr',
			topRating: 1955,
			bottomName: 'Bot Cerise',
			bottomRating: 1942,
			time: '3+2'
		}
	];
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

<main class="page-shell live-grid-page">
	<section aria-labelledby="example-heading" class="site-section">
		<header class="section-header live-grid-intro">
			<p class="kicker">Live games grid</p>
			<h1 id="example-heading" class="section-title">12 boards. 12 engines. Zero shared clocks.</h1>
			<p class="section-lead">
				Each board runs its own chess.js engine on its own randomized timer. Click any board to open
				the interactive chess.js example.
			</p>

			<div class="section-actions">
				<a class="btn preset-filled-primary-500" href={chessjsHref}>Open the chess.js example</a>
				<a class="btn preset-tonal" href={examplesHref}>All examples</a>
			</div>
		</header>

		<section class="live-grid-section" aria-label="Live preview boards">
			<div class="live-grid">
				{#each metaPresets as meta, i (i)}
					<LiveCard {meta} index={i} />
				{/each}
			</div>
		</section>
	</section>
</main>
