<script lang="ts">
	import { resolve } from '$app/paths';

	const chessLoreHref = resolve('/chess-lore');
	const chessboardHref = resolve('/chessboard');
	const chessboardRepoHref = 'https://github.com/mirasen-io/chessboard';

	const pageTitle = 'Mirasen — Become Dangerous in chess';
	const pageDescription =
		'Mirasen builds tools and systems for structured chess learning, training, and study — including Mirasen Chess Lore and Mirasen Chessboard.';
	const pageUrl = 'https://mirasen.io';

	const heroBuildingPoints = [
		{ title: 'Structured learning workflows', body: 'For serious chess study.' },
		{ title: 'Semantic foundations', body: 'Built around motifs and context.' },
		{ title: 'Review and retention', body: 'Tied to real training material.' },
		{
			title: 'Chessboard foundation',
			body: 'A modern base for current and future tools.'
		}
	];

	const chessLoreThemes = [
		'trainer workflows',
		'semantic annotation',
		'review and retention',
		'structured learning material'
	];

	const chessLorePoints = [
		'Organize training material through clearer learning workflows',
		'Annotate positions with motifs and context, not only moves and comments',
		'Reinforce learning over time through review tied to real material'
	];

	const brandLayers = [
		{ title: 'Mirasen', body: 'Tools and systems for structured chess learning.' },
		{
			title: 'Chess Lore',
			body: 'Workflow-first chess learning focused on structure, review, and retention.'
		},
		{
			title: 'Chessboard',
			body: 'Open-source chessboard platform supporting the broader Mirasen ecosystem.'
		}
	];
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

<main class="mx-auto max-w-6xl space-y-20 px-4 py-12 sm:px-6 md:py-16">
	<section class="grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-start">
		<div class="space-y-5">
			<p class="badge preset-tonal">Structured chess learning, training, and study</p>
			<h1 class="h1">Become Dangerous</h1>
			<p class="text-xl opacity-90">Build stronger chess understanding through structured study.</p>
			<p class="opacity-80">
				Mirasen builds tools and systems for structured chess learning — helping turn training,
				study, and teaching material into clearer workflows, stronger retention, and deeper
				understanding over time.
			</p>
			<div class="flex flex-wrap gap-3 pt-2">
				<a class="btn preset-filled-primary-500" href={chessLoreHref}>Explore Chess Lore</a>
				<a class="btn preset-tonal" href={chessboardHref}>View Chessboard</a>
			</div>
		</div>

		<aside class="card preset-filled-surface-100-900 space-y-4 p-6">
			<h2 class="h4">What Mirasen is building</h2>
			<ul class="grid gap-2">
				{#each heroBuildingPoints as point (point.title)}
					<li class="preset-tonal space-y-1 rounded-lg p-3">
						<p class="text-sm font-semibold">{point.title}</p>
						<p class="text-xs opacity-80">{point.body}</p>
					</li>
				{/each}
			</ul>
		</aside>
	</section>

	<section aria-labelledby="chess-lore-heading" class="space-y-6">
		<header class="space-y-2">
			<p class="text-xs tracking-wide uppercase opacity-70">Current product direction</p>
			<h2 id="chess-lore-heading" class="h2">Mirasen Chess Lore</h2>
			<p class="max-w-3xl opacity-90">
				Chess Lore is the current main product direction inside Mirasen: a workflow-first system for
				structured chess learning, starting with trainer workflows and expanding into broader chess
				learning over time.
			</p>
		</header>

		<div class="card preset-tonal p-6 md:p-10">
			<div class="grid gap-8 md:grid-cols-2 md:items-start">
				<div class="space-y-5">
					<p class="opacity-90">
						The current direction focuses on helping trainers assign, organize, review, and
						reinforce chess learning with more structure. The same learning logic also supports
						self-directed learners who want clearer review, stronger retention, and more meaningful
						progress visibility.
					</p>
					<div class="flex flex-wrap gap-2" aria-label="Core themes">
						{#each chessLoreThemes as theme (theme)}
							<span class="badge preset-filled-surface-50-950">{theme}</span>
						{/each}
					</div>
				</div>

				<ul class="divide-surface-200-800 divide-y">
					{#each chessLorePoints as point, index (point)}
						<li class="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
							<span class="badge-icon preset-filled-primary-500 shrink-0" aria-hidden="true"
								>{index + 1}</span
							>
							<p class="opacity-90">{point}</p>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="flex flex-wrap gap-3">
			<a class="btn preset-filled-primary-500" href={chessLoreHref}>
				Learn more about Chess Lore
			</a>
		</div>
	</section>

	<section aria-labelledby="chessboard-heading" class="space-y-6">
		<header class="space-y-2">
			<p class="text-xs tracking-wide uppercase opacity-70">Foundation layer</p>
			<h2 id="chessboard-heading" class="h2">Mirasen Chessboard</h2>
			<p class="max-w-3xl opacity-90">
				Mirasen Chessboard is the open-source chessboard platform inside the broader Mirasen
				ecosystem — a modern foundation for real chess interaction, rendering, and richer chess
				applications.
			</p>
		</header>

		<div class="grid gap-6 md:grid-cols-2">
			<article class="card preset-filled-surface-100-900 space-y-3 p-6">
				<h3 class="h4">Why it exists</h3>
				<p class="opacity-90">
					The board is not the product story by itself. It is the platform foundation that supports
					richer learning workflows, review interactions, and future Mirasen tools.
				</p>
			</article>

			<article class="card preset-filled-surface-100-900 space-y-3 p-6">
				<h3 class="h4">How it fits</h3>
				<p class="opacity-90">
					Chessboard supports the broader Mirasen learning ecosystem while remaining a distinct
					open-source platform with its own public GitHub and npm presence.
				</p>
			</article>
		</div>

		<div class="flex flex-wrap gap-3">
			<a class="btn preset-filled-primary-500" href={chessboardHref}>
				Learn more about Chessboard
			</a>
			<a
				class="btn preset-tonal"
				href={chessboardRepoHref}
				target="_blank"
				rel="external noopener noreferrer"
			>
				View repository
			</a>
		</div>
	</section>

	<section aria-labelledby="brand-heading" class="space-y-6">
		<header class="space-y-2">
			<p class="text-xs tracking-wide uppercase opacity-70">Brand structure</p>
			<h2 id="brand-heading" class="h2">One brand, multiple layers</h2>
			<p class="max-w-3xl opacity-90">
				Mirasen is structured as a brand hub with a current main product direction and an
				open-source platform layer.
			</p>
		</header>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each brandLayers as layer (layer.title)}
				<article class="card preset-filled-surface-100-900 space-y-3 p-6">
					<h3 class="h4">{layer.title}</h3>
					<p class="opacity-90">{layer.body}</p>
				</article>
			{/each}
		</div>
	</section>
</main>
