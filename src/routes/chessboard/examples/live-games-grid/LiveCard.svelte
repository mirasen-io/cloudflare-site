<script lang="ts">
	import { resolve } from '$app/paths';
	import { useBoard } from '$lib/board/use.svelte';
	import { toBoardMove } from '@mirasen/chessboard/adapters/chessjs';
	import { Chess } from 'chess.js';

	const MOVE_DELAY_MIN_MS = 500;
	const MOVE_DELAY_MAX_MS = 3000;
	const RESET_DELAY_MIN_MS = 1500;
	const RESET_DELAY_MAX_MS = 3000;
	const INITIAL_DELAY_MAX_MS = 2500;

	export type Meta = {
		readonly topName: string;
		readonly topRating: number;
		readonly bottomName: string;
		readonly bottomRating: number;
		readonly time: string;
	};

	type Props = {
		meta: Meta;
		index: number;
	};

	const { meta, index }: Props = $props();

	const chessjsHref = resolve('/chessboard/examples/chessjs');

	let boardEl: HTMLDivElement;
	let chess: Chess;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let gameVersion = 0;

	// `statusOverride` is null when the card should show the meta default
	// (the time-control label). Game-end labels override it. Reset clears
	// it back to null. Keeping the prop default in a derived avoids the
	// state_referenced_locally warning from initializing $state from a prop.
	let statusOverride = $state<string | null>(null);
	const statusText = $derived(statusOverride ?? meta.time);

	function rand(min: number, max: number): number {
		return min + Math.random() * (max - min);
	}

	function getEndLabel(game: Chess): string | null {
		if (game.isCheckmate()) return 'Checkmate';
		if (game.isDraw()) return 'Draw';
		if (game.isGameOver()) return 'Game over';
		return null;
	}

	function clearTimer() {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	}

	function scheduleNext(delay: number) {
		clearTimer();
		timeoutId = setTimeout(tick, delay);
	}

	function scheduleReset() {
		clearTimer();
		timeoutId = setTimeout(reset, rand(RESET_DELAY_MIN_MS, RESET_DELAY_MAX_MS));
	}

	function tick() {
		const v = gameVersion;
		timeoutId = null;
		if (v !== gameVersion) return;

		const preLabel = getEndLabel(chess);
		if (preLabel !== null) {
			statusOverride = preLabel;
			scheduleReset();
			return;
		}

		const moves = chess.moves({ verbose: true });
		if (moves.length === 0) {
			statusOverride = getEndLabel(chess);
			scheduleReset();
			return;
		}

		const selected = moves[Math.floor(Math.random() * moves.length)];
		const applied = chess.move(selected);

		board.current?.move(toBoardMove(applied));

		const postLabel = getEndLabel(chess);
		if (postLabel !== null) {
			statusOverride = postLabel;
			scheduleReset();
			return;
		}

		scheduleNext(rand(MOVE_DELAY_MIN_MS, MOVE_DELAY_MAX_MS));
	}

	function reset() {
		gameVersion += 1;
		clearTimer();
		chess = new Chess();
		board.current?.setPosition(chess.fen());
		statusOverride = null;
		scheduleNext(rand(0, INITIAL_DELAY_MAX_MS));
	}

	const board = useBoard(
		() => boardEl,
		(b) => {
			chess = new Chess();
			b.setMovability({ mode: 'disabled' });
			scheduleNext(rand(0, INITIAL_DELAY_MAX_MS));

			return () => {
				clearTimer();
				gameVersion += 1;
			};
		},
		{ extensions: ['renderer', 'lastMove'] as const }
	);
</script>

<article class="live-card">
	<div class="live-card__row live-card__row--top">
		<span class="live-card__player-name">{meta.topName}</span>
		<span class="live-card__player-rating">{meta.topRating}</span>
		<span class="live-card__status" aria-live="off">{statusText}</span>
	</div>

	<div class="live-card__board-wrap">
		<div bind:this={boardEl} class="live-card__board"></div>
		<a
			class="live-card__overlay"
			href={chessjsHref}
			aria-label={`Open the chess.js example — game ${index + 1}: ${meta.bottomName} vs ${meta.topName}`}
		></a>
	</div>

	<div class="live-card__row live-card__row--bottom">
		<span class="live-card__player-name">{meta.bottomName}</span>
		<span class="live-card__player-rating">{meta.bottomRating}</span>
	</div>
</article>
