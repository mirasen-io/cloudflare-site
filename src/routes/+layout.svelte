<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.ico';
	import AppBar from '$lib/components/AppBar.svelte';
	import { rootNav, type NavConfig } from '$lib/nav/links';
	import { onMount } from 'svelte';
	import './layout.css';

	let { children } = $props();

	const nav = $derived<NavConfig>((page.data as { nav?: NavConfig }).nav ?? rootNav);
	const year = new Date().getFullYear();

	onMount(() => {
		document.documentElement.classList.add('app-started');
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-dvh flex-col">
	<AppBar brand={nav.brand} links={nav.links} />

	<div class="flex-1">
		{@render children()}
	</div>

	<footer class="border-surface-200-800 border-t">
		<div
			class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm opacity-80 sm:flex-row sm:items-center sm:justify-between sm:px-6"
		>
			<p>© {year} Mirasen</p>
			<p>Structured chess learning. Become Dangerous.</p>
		</div>
	</footer>
</div>
