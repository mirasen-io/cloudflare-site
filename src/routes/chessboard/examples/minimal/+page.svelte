<script lang="ts">
	import { resolve } from '$app/paths';
	import { useBoard } from '$lib/board/use.svelte';
	import { randomMove } from '$lib/board/utils';

	const examplesHref = resolve('/chessboard/examples');

	const githubHref = 'https://github.com/mirasen-io/chessboard';
	const npmHref = 'https://www.npmjs.com/package/@mirasen/chessboard';

	const pageTitle = 'Minimal interactive example — Mirasen Chessboard examples';
	const pageDescription =
		'A minimal interactive Mirasen Chessboard example with free movement, orientation toggle, position reset, and a random-move control.';
	const pageUrl = 'https://mirasen.io/chessboard/examples/minimal';

	let boardEl: HTMLDivElement;
	let orientation: 'white' | 'black' = $state('white');

	const board = useBoard(
		() => boardEl,
		(b) => {
			b.setMovability({ mode: 'free' });
		}
	);

	function toggleOrientation() {
		if (!board.current) return;
		orientation = orientation === 'white' ? 'black' : 'white';
		board.current.setOrientation(orientation);
	}

	function resetPosition() {
		if (!board.current) return;
		board.current.setPosition('start');
		board.current.select(null);
	}

	function doRandomMove() {
		if (!board.current) return;
		randomMove(board.current);
	}
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
		<div class="example-layout">
			<div class="example-copy">
				<header class="section-header">
					<p class="kicker">Minimal interactive example</p>
					<h1 id="example-heading" class="section-title">Move pieces freely</h1>
					<p class="section-lead">
						A compact interactive board with free movement, orientation switching, position reset,
						and a random-move control. Drag pieces directly, use release targeting, or right-click
						to draw circles and arrows.
					</p>
				</header>

				<div class="section-actions">
					<a class="btn preset-filled-primary-500" href={examplesHref}>All examples</a>
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
			</div>

			<div class="example-board-area">
				<div class="example-controls" aria-label="Chessboard controls">
					<button class="btn preset-tonal" type="button" onclick={toggleOrientation}>
						Orientation: {orientation}
					</button>
					<button class="btn preset-tonal" type="button" onclick={resetPosition}>
						Reset position
					</button>
					<button class="btn preset-tonal" type="button" onclick={doRandomMove}>
						Random move
					</button>
				</div>

				<div class="example-board-edge">
					<div class="board-wrap">
						<div bind:this={boardEl} class="board"></div>
					</div>
				</div>

				<p class="example-note">
					Use the controls above, drag pieces directly, use release targeting to move pieces, or
					right-click to draw circles and arrows.
				</p>
			</div>
		</div>
	</section>
</main>
