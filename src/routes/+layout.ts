import { rootNav } from '$lib/nav/links';

export const prerender = true;

export const load = () => {
	return { nav: rootNav };
};
