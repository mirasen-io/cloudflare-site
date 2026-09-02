<script lang="ts">
	import { resolve } from '$app/paths';
	import { useBoard } from '$lib/board/use.svelte';
	import {
		toBoardMove,
		toBoardMoveDestinations,
		toGameMove
	} from '@mirasen/chessboard/adapters/chessjs';
	import {
		DefaultMainRendererDesktopConfig,
		DefaultMainRendererMobileConfig
	} from '@mirasen/chessboard/extensions';
	import { Chess } from 'chess.js';
	import { onDestroy } from 'svelte';

	const examplesHref = resolve('/chessboard/examples');

	const githubHref = 'https://github.com/mirasen-io/chessboard';
	const npmHref = 'https://www.npmjs.com/package/@mirasen/chessboard';

	const pageTitle = 'chess.js game example — Mirasen Chessboard examples';
	const pageDescription =
		'A rules-backed Mirasen Chessboard example using the built-in chess.js adapter for legal destinations, promotion, castling, en passant, random computer replies, annotations, animation, and mobile drag controls.';
	const pageUrl = 'https://mirasen.io/chessboard/examples/chessjs';

	const PLAYER_COLOR = 'w' as const;
	const COMPUTER_DELAY_MS = 1000;
	const ANIMATION_DURATION_MS = 180;

	type DrawButton = 'right' | 'primary';
	type DragPreset = 'desktop' | 'mobile';
	type AnimSetting = 'on' | 'off';
	type DrawModifier = 'keyboard' | 'ctrl' | 'shift' | 'alt' | 'meta';

	let boardEl: HTMLDivElement;

	let chess = new Chess();
	let computerTimeout: ReturnType<typeof setTimeout> | null = null;
	let gameVersion = 0;

	let orientation: 'white' | 'black' = $state('white');
	let autoPromoteToQueen = $state(false);
	let drawButton: DrawButton = $state('right');
	let clearOnCore = $state(true);
	let dragPreset: DragPreset = $state('desktop');
	let animSetting: AnimSetting = $state('on');
	let drawModifier: DrawModifier = $state('keyboard');
	let statusText = $state('Your move');

	function getStatus(): string {
		if (chess.isCheckmate()) return 'Checkmate';
		if (chess.isDraw()) return 'Draw';
		if (chess.isGameOver()) return 'Game over';
		if (chess.isCheck()) return 'Check';
		return chess.turn() === PLAYER_COLOR ? 'Your move' : 'Computer thinking…';
	}

	function refreshStatus() {
		statusText = getStatus();
	}

	function refreshCheckHighlight(b: Board) {
		if (!chess.isCheck()) {
			b.extensions.check.square = null;
			return;
		}
		const turn = chess.turn();
		b.extensions.check.square = turn;
	}

	function clearComputerTimeout() {
		if (computerTimeout !== null) {
			clearTimeout(computerTimeout);
			computerTimeout = null;
		}
	}

	const board = useBoard(
		() => boardEl,
		(b) => {
			b.setPosition(chess.fen());
			applyMovability(b);

			b.extensions.events.setOnUIMove((move) => {
				try {
					chess.move(toGameMove(move));
				} catch {
					return;
				}
				refreshStatus();
				refreshCheckHighlight(b);

				if (chess.isGameOver()) return;

				const scheduledVersion = gameVersion;
				clearComputerTimeout();
				computerTimeout = setTimeout(() => {
					computerTimeout = null;
					if (scheduledVersion !== gameVersion || !board.current) return;
					makeComputerMove();
				}, COMPUTER_DELAY_MS);
			});

			autoPromoteToQueen = b.extensions.autoPromote.toQueen;
			b.extensions.annotations.drawButton = drawButton === 'primary' ? 0 : 2;
			b.extensions.annotations.clearOnCoreInteraction = clearOnCore;
			b.extensions.annotations.drawModifier = drawModifier === 'keyboard' ? null : drawModifier;
			applyDragPreset(dragPreset, b);
			applyAnim(animSetting, b);

			refreshStatus();
			refreshCheckHighlight(b);

			return () => {
				clearComputerTimeout();
			};
		}
	);

	type Board = NonNullable<typeof board.current>;

	function applyMovability(b: Board) {
		b.setMovability({
			mode: 'strict',
			destinations: (source) => {
				if (chess.turn() !== PLAYER_COLOR) return undefined;
				const moves = chess.moves({ square: source, verbose: true });
				const destinations = toBoardMoveDestinations(moves);
				return destinations.length > 0 ? destinations : undefined;
			}
		});
	}

	function makeComputerMove() {
		if (!board.current) return;
		const moves = chess.moves({ verbose: true });
		if (moves.length === 0) {
			refreshStatus();
			return;
		}
		const random = moves[Math.floor(Math.random() * moves.length)];
		const applied = chess.move(random);
		board.current.move(toBoardMove(applied));
		refreshStatus();
		refreshCheckHighlight(board.current);
	}

	function applyDragPreset(value: DragPreset, b: Board) {
		if (value === 'desktop') {
			b.setInteractionConfig({ drag: { liftedActivation: { thresholdPx: 0 } } });
			b.extensions.renderer.setConfig({ drag: DefaultMainRendererDesktopConfig.drag });
		} else {
			b.setInteractionConfig({ drag: { liftedActivation: { thresholdPx: 5 } } });
			b.extensions.renderer.setConfig({ drag: DefaultMainRendererMobileConfig.drag });
		}
	}

	function applyAnim(value: AnimSetting, b: Board) {
		b.extensions.renderer.setConfig({
			animation: { durationMs: value === 'on' ? ANIMATION_DURATION_MS : 0 }
		});
	}

	function toggleOrientation() {
		if (!board.current) return;
		orientation = orientation === 'white' ? 'black' : 'white';
		board.current.setOrientation(orientation);
	}

	function resetGame() {
		gameVersion += 1;
		clearComputerTimeout();
		chess = new Chess();
		if (!board.current) return;
		board.current.setPosition(chess.fen());
		board.current.select(null);
		refreshStatus();
		refreshCheckHighlight(board.current);
	}

	function toggleAutoPromote() {
		if (!board.current) return;
		const next = !board.current.extensions.autoPromote.toQueen;
		board.current.extensions.autoPromote.toQueen = next;
		autoPromoteToQueen = next;
	}

	function toggleDrawButton() {
		if (!board.current) return;
		drawButton = drawButton === 'primary' ? 'right' : 'primary';
		board.current.extensions.annotations.drawButton = drawButton === 'primary' ? 0 : 2;
	}

	function toggleClearOnCore() {
		if (!board.current) return;
		clearOnCore = !clearOnCore;
		board.current.extensions.annotations.clearOnCoreInteraction = clearOnCore;
	}

	function selectDragPreset(value: DragPreset) {
		dragPreset = value;
		if (board.current) applyDragPreset(value, board.current);
	}

	function selectAnim(value: AnimSetting) {
		animSetting = value;
		if (board.current) applyAnim(value, board.current);
	}

	function selectDrawModifier(value: DrawModifier) {
		drawModifier = value;
		if (board.current) {
			board.current.extensions.annotations.drawModifier = value === 'keyboard' ? null : value;
		}
	}

	onDestroy(() => {
		clearComputerTimeout();
	});
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
					<p class="kicker">chess.js game example</p>
					<h1 id="example-heading" class="section-title">Play against a random-move computer</h1>
					<p class="section-lead">
						This example connects Mirasen Chessboard to chess.js through the built-in adapter.
						chess.js owns the rules and game state; the board owns interaction, legal targets,
						annotations, promotion UI, animation, and mobile drag behavior.
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
					<button class="btn preset-tonal" type="button" onclick={resetGame}>Reset</button>
					<button class="btn preset-tonal" type="button" onclick={toggleAutoPromote}>
						Auto-queen: {autoPromoteToQueen ? 'on' : 'off'}
					</button>
					<button class="btn preset-tonal" type="button" onclick={toggleDrawButton}>
						Draw: {drawButton === 'primary' ? 'primary' : 'right'}
					</button>
					<button class="btn preset-tonal" type="button" onclick={toggleClearOnCore}>
						Auto-clear: {clearOnCore ? 'on' : 'off'}
					</button>

					<div class="example-segment" role="group" aria-label="Drag preset">
						<span class="example-segment-label">Drag</span>
						<button
							type="button"
							class="example-segment-btn"
							class:is-active={dragPreset === 'desktop'}
							aria-pressed={dragPreset === 'desktop'}
							onclick={() => selectDragPreset('desktop')}
						>
							Desktop
						</button>
						<button
							type="button"
							class="example-segment-btn"
							class:is-active={dragPreset === 'mobile'}
							aria-pressed={dragPreset === 'mobile'}
							onclick={() => selectDragPreset('mobile')}
						>
							Mobile
						</button>
					</div>

					<div class="example-segment" role="group" aria-label="Animation">
						<span class="example-segment-label">Anim</span>
						<button
							type="button"
							class="example-segment-btn"
							class:is-active={animSetting === 'on'}
							aria-pressed={animSetting === 'on'}
							onclick={() => selectAnim('on')}
						>
							On
						</button>
						<button
							type="button"
							class="example-segment-btn"
							class:is-active={animSetting === 'off'}
							aria-pressed={animSetting === 'off'}
							onclick={() => selectAnim('off')}
						>
							Off
						</button>
					</div>

					<div class="example-segment" role="group" aria-label="Draw modifier">
						<span class="example-segment-label">Modifier</span>
						{#each ['keyboard', 'ctrl', 'shift', 'alt', 'meta'] as const as value (value)}
							<button
								type="button"
								class="example-segment-btn"
								class:is-active={drawModifier === value}
								aria-pressed={drawModifier === value}
								onclick={() => selectDrawModifier(value)}
							>
								{value}
							</button>
						{/each}
					</div>
				</div>

				<p class="example-status" aria-live="polite">{statusText}</p>

				<div class="example-board-edge">
					<div class="board-wrap">
						<div bind:this={boardEl} class="board"></div>
					</div>
				</div>

				<p class="example-note">
					You play white. The computer replies with random legal moves. Toggle mobile drag,
					animation, annotations, and auto-promotion to test the interaction model. Right-click or
					switch drawing to primary input to draw circles and arrows.
				</p>
			</div>
		</div>
	</section>
</main>
