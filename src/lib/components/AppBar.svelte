<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { NavConfig, NavLink } from '$lib/nav/links';
	import { AppBar, Menu } from '@skeletonlabs/skeleton-svelte';
	import { Menu as MenuIcon } from '@lucide/svelte';

	let { brand, links }: NavConfig = $props();

	// Zag's menu intercepts Enter/Space on menuitem and prevents default, so the
	// native <a href> inside Menu.Item never navigates via keyboard. Mouse click,
	// middle-click, ⌘-click, right-click, and screen-reader semantics still flow
	// through the <a> — only keyboard activation routes through here.
	function handleMenuSelect(details: { value: string }) {
		const link = links.find((candidate) => candidate.href === details.value);
		if (!link) return;
		if (link.external) {
			window.open(link.href, '_blank', 'noopener,noreferrer');
		} else {
			goto(resolve(link.href));
		}
	}

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
			<!-- Desktop: inline link list at md and above -->
			<nav aria-label="Primary" class="hidden items-center gap-4 md:flex">
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

			<!-- Mobile: hamburger-triggered dropdown below md -->
			<div class="md:hidden">
				<Menu onSelect={handleMenuSelect}>
					<Menu.Trigger
						aria-label="Open navigation menu"
						class="inline-flex items-center justify-center"
					>
						<MenuIcon aria-hidden="true" class="size-6" />
					</Menu.Trigger>
					<Menu.Positioner>
						<Menu.Content>
							{#each links as link (link.href)}
								<Menu.Item value={link.href}>
									{#if link.external}
										<a
											href={link.href}
											target="_blank"
											rel="external noopener noreferrer"
											aria-label={accessibleName(link, !!link.label)}
											class="inline-flex w-full items-center gap-2"
										>
											{#if link.visual}
												<img
													src={link.visual.src}
													alt={link.visual.alt ?? ''}
													class={link.visual.class}
												/>
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
											class={['inline-flex w-full items-center gap-2', active && 'font-bold']}
										>
											{#if link.visual}
												<img
													src={link.visual.src}
													alt={link.visual.alt ?? ''}
													class={link.visual.class}
												/>
											{/if}
											{#if link.label}
												{link.label}
											{/if}
										</a>
									{/if}
								</Menu.Item>
							{/each}
						</Menu.Content>
					</Menu.Positioner>
				</Menu>
			</div>
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
