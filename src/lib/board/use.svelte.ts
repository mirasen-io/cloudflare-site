import {
	createBoard,
	type Chessboard,
	type ChessboardExtensionInput,
	type ChessboardInitOptions
} from '@mirasen/chessboard';
import { onDestroy, onMount } from 'svelte';

type StateInitOptions = ChessboardInitOptions['state'];

/**
 * Lifecycle helper: creates a board on mount, destroys on unmount.
 *
 * Default usage (Minimal / Promotion / chess.js): pass only `getElement` and
 * `setup`. The library's default extensions (renderer, watermark, selectedSquare,
 * lastMove, activeTarget, legalMoves, events, autoPromote, promotion, annotations)
 * apply, including the renderer's built-in Chessnut piece URLs.
 *
 * Override usage (Live Games Grid): pass `options.extensions` and/or
 * `options.state` to forward them as-is to `createBoard`. Omitted/undefined
 * `options` is indistinguishable from the default usage above.
 */
export function useBoard(
	getElement: () => HTMLElement,
	setup: (board: Chessboard) => (() => void) | void,
	options?: { readonly state?: StateInitOptions }
): { readonly current: Chessboard | null };
export function useBoard<TExt extends readonly ChessboardExtensionInput[]>(
	getElement: () => HTMLElement,
	setup: (board: Chessboard<TExt>) => (() => void) | void,
	options: { readonly extensions: TExt; readonly state?: StateInitOptions }
): { readonly current: Chessboard<TExt> | null };
export function useBoard(
	getElement: () => HTMLElement,
	setup: (board: Chessboard) => (() => void) | void,
	options?: {
		readonly extensions?: readonly ChessboardExtensionInput[];
		readonly state?: StateInitOptions;
	}
): { readonly current: Chessboard | null } {
	let board: Chessboard | null = $state.raw(null);
	let teardown: (() => void) | void;

	onMount(() => {
		const b = createBoard({ element: getElement(), ...(options ?? {}) });
		board = b;
		teardown = setup(b);
	});

	onDestroy(() => {
		teardown?.();
		board?.destroy();
		board = null;
	});

	return {
		get current() {
			return board;
		}
	};
}
