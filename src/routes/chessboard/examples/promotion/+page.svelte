<script lang="ts">
	import { resolve } from '$app/paths';
	import { useBoard } from '$lib/board/use.svelte';
	import type { PiecePositionRecordString } from '@mirasen/chessboard';

	const examplesHref = resolve('/chessboard/examples');

	const githubHref = 'https://github.com/mirasen-io/chessboard';
	const npmHref = 'https://www.npmjs.com/package/@mirasen/chessboard';

	const pageTitle = 'Promotion flow — Mirasen Chessboard examples';
	const pageDescription =
		'A promotion handling example for Mirasen Chessboard with deferred promotion selection, optional auto-promotion, and built-in annotations.';
	const pageUrl = 'https://mirasen.io/chessboard/examples/promotion';

	const START_POSITION: PiecePositionRecordString = {
		e2: 'wP',
		f7: 'wP',
		d7: 'bP',
		c2: 'bP'
	};

	let boardEl: HTMLDivElement;
	let orientation: 'white' | 'black' = $state('white');
	let autoPromoteToQueen = $state(false);

	const board = useBoard(
		() => boardEl,
		(b) => {
			b.setPosition({ pieces: START_POSITION, turn: 'w' });
			b.setMovability({
				mode: 'strict',
				destinations: (source) => {
					if (source === 'e2') {
						return [
							{ to: 'e8', promotedTo: ['B', 'N'] },
							{ to: 'd8', promotedTo: ['R', 'N', 'Q'] },
							{ to: 'f8', promotedTo: ['R', 'N', 'Q'] }
						];
					}
					if (source === 'f7') {
						return [
							{ to: 'f8', promotedTo: ['B', 'R', 'N', 'Q'] },
							{ to: 'g8', promotedTo: ['B', 'R', 'N', 'Q'] }
						];
					}
					if (source === 'd7') {
						return [
							{ to: 'd1', promotedTo: ['B', 'N'] },
							{ to: 'e1', promotedTo: ['R', 'N', 'Q'] }
						];
					}
					if (source === 'c2') {
						return [
							{ to: 'c1', promotedTo: ['B', 'R', 'N', 'Q'] },
							{ to: 'b1', promotedTo: ['B', 'R', 'N', 'Q'] }
						];
					}
					return undefined;
				}
			});
			autoPromoteToQueen = b.extensions.autoPromote.toQueen;
		}
	);

	function toggleOrientation() {
		if (!board.current) return;
		orientation = orientation === 'white' ? 'black' : 'white';
		board.current.setOrientation(orientation);
	}

	function resetPosition() {
		if (!board.current) return;
		board.current.setPosition({ pieces: START_POSITION, turn: 'w' });
		board.current.select(null);
	}

	function toggleAutoPromote() {
		if (!board.current) return;
		const next = !board.current.extensions.autoPromote.toQueen;
		board.current.extensions.autoPromote.toQueen = next;
		autoPromoteToQueen = next;
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
					<p class="kicker">Promotion example</p>
					<h1 id="example-heading" class="section-title">Promotion flow</h1>
					<p class="section-lead">
						A compact promotion scenario with deferred promotion selection, optional auto-promotion
						to queen, and built-in board annotations.
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
					<button class="btn preset-tonal" type="button" onclick={toggleAutoPromote}>
						Auto-queen: {autoPromoteToQueen ? 'on' : 'off'}
					</button>
				</div>

				<div class="example-board-edge">
					<div class="board-wrap">
						<div bind:this={boardEl} class="board"></div>
					</div>
				</div>

				<p class="example-note">
					Move one of the pawns to a promotion target. Toggle auto-promotion to compare manual and
					automatic resolution, or right-click to annotate the position.
				</p>
			</div>
		</div>
	</section>
</main>
