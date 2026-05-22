<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.ico';
	import AppBar from '$lib/components/AppBar.svelte';
	import { rootNav, type NavConfig } from '$lib/nav/links';
	import './layout.css';

	let { children } = $props();

	const nav = $derived<NavConfig>((page.data as { nav?: NavConfig }).nav ?? rootNav);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<AppBar brand={nav.brand} links={nav.links} />

{@render children()}
