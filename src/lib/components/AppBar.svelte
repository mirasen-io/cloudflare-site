<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { NavConfig, NavLink } from '$lib/nav/links';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';

	let { brand, links }: NavConfig = $props();

	function isInternalActive(link: NavLink, internalHref: string, path: string): boolean {
		if (link.external) return false;
		if (link.activeMatch === 'prefix') {
			return path === internalHref || path.startsWith(internalHref + '/');
		}
		return path === internalHref;
	}

	function accessibleName(link: NavLink, hasVisibleLabel: boolean): string | undefined {
		if (link.ariaLabel) return link.ariaLabel;
		if (!hasVisibleLabel) return link.label;
		return undefined;
	}
</script>

<AppBar>
	<AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
		<AppBar.Lead>
			<a
				href={resolve(brand.href)}
				class="inline-flex items-center gap-3"
				aria-label={accessibleName(brand, !!brand.label)}
			>
				{#if brand.visual}
					<img src={brand.visual.src} alt={brand.visual.alt ?? ''} class={brand.visual.class} />
				{/if}
				{#if brand.label}
					<span class="font-bold">{brand.label}</span>
				{/if}
			</a>
		</AppBar.Lead>

		<AppBar.Headline />

		<AppBar.Trail>
			<nav aria-label="Primary" class="flex flex-wrap items-center gap-4">
				{#each links as link (link.href)}
					{#if link.external}
						<a
							href={link.href}
							target="_blank"
							rel="external noopener noreferrer"
							aria-label={accessibleName(link, !!link.label)}
							class="inline-flex items-center gap-2"
						>
							{#if link.visual}
								<img src={link.visual.src} alt={link.visual.alt ?? ''} class={link.visual.class} />
							{/if}
							{#if link.label}
								{link.label}
							{/if}
						</a>
					{:else}
						{@const internalHref = resolve(link.href)}
						{@const active = isInternalActive(link, internalHref, page.url.pathname)}
						<a
							href={internalHref}
							aria-label={accessibleName(link, !!link.label)}
							aria-current={active ? 'page' : undefined}
							class={['inline-flex items-center gap-2', active && 'font-bold']}
						>
							{#if link.visual}
								<img src={link.visual.src} alt={link.visual.alt ?? ''} class={link.visual.class} />
							{/if}
							{#if link.label}
								{link.label}
							{/if}
						</a>
					{/if}
				{/each}
			</nav>
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
