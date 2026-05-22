import type { RouteId } from '$app/types';
import logoGithub from '$lib/assets/GitHub_Invertocat_White.svg';
import logoShort from '$lib/assets/logo-short.svg';
import logoNpm from '$lib/assets/n.svg';

export type NavVisual = {
	type: 'image';
	src: string;
	alt?: string;
	class?: string;
};

type AccessibleName = { label: string; ariaLabel?: string } | { label?: string; ariaLabel: string };

type SharedFields = AccessibleName & {
	visual?: NavVisual;
};

export type InternalNavLink = SharedFields & {
	href: RouteId;
	external?: false;
	activeMatch?: 'exact' | 'prefix';
};

export type ExternalNavLink = SharedFields & {
	href: `https://${string}` | `http://${string}`;
	external: true;
	activeMatch?: never;
};

export type NavLink = InternalNavLink | ExternalNavLink;

export type NavConfig = {
	brand: InternalNavLink;
	links: NavLink[];
};

const brand: InternalNavLink = {
	href: '/',
	label: 'Mirasen',
	visual: { type: 'image', src: logoShort, alt: '', class: 'size-12' }
};

const githubLinkCommon = {
	label: 'GitHub',
	external: true,
	visual: {
		type: 'image',
		src: logoGithub,
		alt: '',
		class: 'size-6'
	}
} as const;

const npmLinkCommon = {
	label: 'npm',
	external: true,
	visual: {
		type: 'image',
		src: logoNpm,
		alt: '',
		class: 'size-6'
	}
} as const;

export const rootNav: NavConfig = {
	brand,
	links: [
		{ href: '/chess-lore', label: 'Chess Lore', activeMatch: 'prefix' },
		{ href: '/chessboard', label: 'Chessboard', activeMatch: 'prefix' },
		{
			href: 'https://github.com/mirasen-io',
			...githubLinkCommon
		},
		{
			href: 'https://www.npmjs.com/org/mirasen',
			...npmLinkCommon
		}
	]
};

export const chessboardNav: NavConfig = {
	brand,
	links: [
		{ href: '/chess-lore', label: 'Chess Lore', activeMatch: 'prefix' },
		{ href: '/chessboard', label: 'Chessboard', activeMatch: 'prefix' },
		{
			href: 'https://github.com/mirasen-io/chessboard',
			...githubLinkCommon
		},
		{
			href: 'https://www.npmjs.com/package/@mirasen/chessboard',
			...npmLinkCommon
		}
	]
};
