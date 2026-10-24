import { rootNav } from '#lib/nav/links.js';

export const prerender = true;

export const load = () => {
	return { nav: rootNav };
};
