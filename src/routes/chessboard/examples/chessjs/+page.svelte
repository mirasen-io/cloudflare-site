<script lang="ts">
	import { resolve } from '$app/paths';

	const examplesHref = resolve('/chessboard/examples');

	const githubHref = 'https://github.com/mirasen-io/chessboard';
	const npmHref = 'https://www.npmjs.com/package/@mirasen/chessboard';

	const pageTitle = 'chess.js game example — Mirasen Chessboard examples';
	const pageDescription =
		'Rules-backed game example using the built-in chess.js adapter for Mirasen Chessboard. Migration in progress.';
	const pageUrl = 'https://mirasen.io/chessboard/examples/chessjs';
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
	<section aria-labelledby="example-heading" class="site-section">
		<article class="card p-6 md:p-10">
			<header class="section-header">
				<p class="kicker">Mirasen Chessboard example</p>
				<h1 id="example-heading" class="section-title">chess.js game example</h1>
				<p class="section-lead">
					This interactive example is being migrated to the new SvelteKit site. It will show a
					rules-backed game with legal destinations, annotations, promotion, castling, en passant,
					and random computer replies.
				</p>
			</header>

			<div class="section-actions">
				<a class="btn preset-filled-primary-500" href={examplesHref}>Back to examples</a>
				<a
					class="btn preset-tonal"
					href={githubHref}
					target="_blank"
					rel="external noopener noreferrer"
				>
					Repository
				</a>
				<a
					class="btn preset-tonal"
					href={npmHref}
					target="_blank"
					rel="external noopener noreferrer"
				>
					Package
				</a>
			</div>
		</article>
	</section>
</main>
