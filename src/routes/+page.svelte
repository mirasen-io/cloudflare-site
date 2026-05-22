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

<main class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Structured chess learning, training, and study</p>
			<h1 class="hero-title">Become Dangerous</h1>
			<p class="lead">Build stronger chess understanding through structured study.</p>
			<p class="hero-subcopy">
				Mirasen builds tools and systems for structured chess learning — helping turn training,
				study, and teaching material into clearer workflows, stronger retention, and deeper
				understanding over time.
			</p>
			<div class="hero-actions">
				<a class="btn preset-filled-primary-500" href={chessLoreHref}>Explore Chess Lore</a>
				<a class="btn preset-tonal" href={chessboardHref}>View Chessboard</a>
			</div>
		</div>

		<aside class="card hero-side p-6">
			<h2 class="card-title">What Mirasen is building</h2>
			<ul class="hero-point-list">
				{#each heroBuildingPoints as point (point.title)}
					<li class="inner-panel">
						<p class="inner-panel-title">{point.title}</p>
						<p class="inner-panel-body">{point.body}</p>
					</li>
				{/each}
			</ul>
		</aside>
	</section>

	<section aria-labelledby="chess-lore-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Current product direction</p>
			<h2 id="chess-lore-heading" class="section-title">Mirasen Chess Lore</h2>
			<p class="section-lead">
				Chess Lore is the current main product direction inside Mirasen: a workflow-first system for
				structured chess learning, starting with trainer workflows and expanding into broader chess
				learning over time.
			</p>
		</header>

		<div class="card spotlight p-6 md:p-10">
			<div class="spotlight-grid">
				<div class="spotlight-copy">
					<p>
						The current direction focuses on helping trainers assign, organize, review, and
						reinforce chess learning with more structure. The same learning logic also supports
						self-directed learners who want clearer review, stronger retention, and more meaningful
						progress visibility.
					</p>
					<div class="theme-list" aria-label="Core themes">
						{#each chessLoreThemes as theme (theme)}
							<span class="badge preset-filled-surface-50-950">{theme}</span>
						{/each}
					</div>
				</div>

				<ul class="numbered-list">
					{#each chessLorePoints as point, index (point)}
						<li>
							<span class="badge-icon preset-filled-primary-500 shrink-0" aria-hidden="true">
								{index + 1}
							</span>
							<p>{point}</p>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="section-actions">
			<a class="btn preset-filled-primary-500" href={chessLoreHref}>
				Learn more about Chess Lore
			</a>
		</div>
	</section>

	<section aria-labelledby="chessboard-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Foundation layer</p>
			<h2 id="chessboard-heading" class="section-title">Mirasen Chessboard</h2>
			<p class="section-lead">
				Mirasen Chessboard is the open-source chessboard platform inside the broader Mirasen
				ecosystem — a modern foundation for real chess interaction, rendering, and richer chess
				applications.
			</p>
		</header>

		<div class="card-grid two-up">
			<article class="card p-6">
				<h3 class="card-title">Why it exists</h3>
				<p>
					The board is not the product story by itself. It is the platform foundation that supports
					richer learning workflows, review interactions, and future Mirasen tools.
				</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">How it fits</h3>
				<p>
					Chessboard supports the broader Mirasen learning ecosystem while remaining a distinct
					open-source platform with its own public GitHub and npm presence.
				</p>
			</article>
		</div>

		<div class="section-actions">
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

	<section aria-labelledby="brand-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Brand structure</p>
			<h2 id="brand-heading" class="section-title">One brand, multiple layers</h2>
			<p class="section-lead">
				Mirasen is structured as a brand hub with a current main product direction and an
				open-source platform layer.
			</p>
		</header>

		<div class="card-grid three-up">
			{#each brandLayers as layer (layer.title)}
				<article class="card p-6">
					<h3 class="card-title">{layer.title}</h3>
					<p>{layer.body}</p>
				</article>
			{/each}
		</div>
	</section>
</main>
