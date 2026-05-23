<script lang="ts">
	import { resolve } from '$app/paths';

	const homeHref = resolve('/');
	const chessboardHref = resolve('/chessboard');

	const pageTitle = 'Mirasen Chess Lore — Structured Chess Learning | Become Dangerous';
	const pageDescription =
		'Mirasen Chess Lore is the current main product direction inside Mirasen: a workflow-first system for structured chess learning, review, retention, and semantic annotation.';
	const ogTitle = 'Mirasen Chess Lore — Become Dangerous in chess';
	const ogDescription =
		'Workflow-first chess learning focused on structured study, review, retention, and semantic annotation.';
	const pageUrl = 'https://mirasen.io/chess-lore';

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Mirasen Chess Lore',
		applicationCategory: 'EducationalApplication',
		operatingSystem: 'Web',
		url: pageUrl,
		description: pageDescription,
		author: {
			'@type': 'Organization',
			name: 'Mirasen',
			url: 'https://mirasen.io'
		}
	});

	const jsonLdScript = `<` + `script type="application/ld+json">${jsonLd}</` + `script>`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={pageUrl} />
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={ogDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript}
</svelte:head>

<main class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Current main product direction inside Mirasen</p>
			<h1 class="hero-title">Mirasen Chess Lore</h1>
			<p class="lead">Become Dangerous</p>
			<p class="hero-subcopy">
				Chess Lore is a workflow-first system for structured chess learning — designed to help turn
				training, study, and teaching material into clearer review, stronger retention, and more
				meaningful progress over time.
			</p>
			<div class="hero-actions">
				<a class="btn preset-filled-primary-500" href={homeHref}>Back to Mirasen</a>
				<a class="btn preset-tonal" href={chessboardHref}>View Chessboard</a>
			</div>
		</div>

		<aside class="card hero-side p-6">
			<h2 class="card-title">What Chess Lore focuses on</h2>
			<ul class="hero-point-list">
				<li class="inner-panel">
					<p class="inner-panel-title">Structured chess learning workflows</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Trainer-first current product direction</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">
						Current semantic foundations built around motifs and context
					</p>
				</li>
				<li class="inner-panel">
					<p class="inner-panel-title">Review and retention tied to real learning material</p>
				</li>
			</ul>
		</aside>
	</section>

	<section aria-labelledby="overview-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Overview</p>
			<h2 id="overview-heading" class="section-title">Workflow-first structured chess learning</h2>
			<p class="section-lead">
				Chess Lore is not centered on isolated puzzles or content fragments alone. The current
				direction is built around workflows: how material is created, assigned, reviewed,
				reinforced, and made useful over time.
			</p>
		</header>

		<div class="card-grid two-up">
			<article class="card p-6">
				<h3 class="card-title">Current direction</h3>
				<p>
					The current product direction starts with trainer workflows: helping trainers organize,
					assign, review, and reinforce learning more effectively.
				</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Broader reach</h3>
				<p>
					The same learning logic also supports self-directed learners who want stronger structure,
					clearer review, and more durable progress from their own material.
				</p>
			</article>
		</div>
	</section>

	<section aria-labelledby="learning-model-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Core learning model</p>
			<h2 id="learning-model-heading" class="section-title">
				From positions to reusable learning units
			</h2>
			<p class="section-lead">
				The current semantic foundation centers on motifs and context. Instead of treating positions
				only as isolated examples, Chess Lore aims to make them part of a richer learning structure
				that explains not only what happens, but why it matters here.
			</p>
		</header>

		<div class="card-grid three-up">
			<article class="card p-6">
				<h3 class="card-title">Motifs</h3>
				<p>The atomic tactical or positional patterns that give a position learning meaning.</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Context</h3>
				<p>
					Structured metadata describing where and why a motif appears in a particular position.
				</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Learning units</h3>
				<p>
					Positions and lines that can move beyond one-time explanation and become reusable material
					for review and reinforcement.
				</p>
			</article>
		</div>
	</section>

	<section aria-labelledby="supports-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">What it supports</p>
			<h2 id="supports-heading" class="section-title">Review, retention, and follow-up</h2>
			<p class="section-lead">
				The goal is not only to store material, but to support what happens after explanation:
				review, reinforcement, and progress visibility tied to real training activity.
			</p>
		</header>

		<div class="card spotlight p-6 md:p-10">
			<div class="spotlight-grid">
				<div class="spotlight-copy">
					<p>
						This is especially important when the material comes from personal games, trainer
						assignments, annotated examples, and recurring mistakes — the kinds of learning material
						that often matter most but are hard to revisit well over time.
					</p>
					<div class="theme-list" aria-label="Core themes">
						<span class="badge preset-filled-surface-50-950">review</span>
						<span class="badge preset-filled-surface-50-950">retention</span>
						<span class="badge preset-filled-surface-50-950">follow-up</span>
						<span class="badge preset-filled-surface-50-950">progress visibility</span>
					</div>
				</div>

				<ul class="numbered-list">
					<li><p>Turn important material into ongoing learning</p></li>
					<li><p>Support more structured reinforcement over time</p></li>
					<li><p>Make progress more visible and more meaningful</p></li>
				</ul>
			</div>
		</div>
	</section>

	<section aria-labelledby="audience-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Who it is for</p>
			<h2 id="audience-heading" class="section-title">Trainer-first, but not trainer-only</h2>
			<p class="section-lead">
				The current direction is trainer-first because trainer workflows create a strong foundation
				for assignment, review, and visible learning progress. At the same time, the broader
				learning model is also relevant to students studying more independently.
			</p>
		</header>

		<div class="card-grid two-up">
			<article class="card p-6">
				<h3 class="card-title">Trainers</h3>
				<p>
					Organize homework, reinforce important material, and gain clearer visibility into how
					learning develops over time.
				</p>
			</article>

			<article class="card p-6">
				<h3 class="card-title">Students</h3>
				<p>
					Revisit important material more effectively, retain more of what matters, and follow a
					clearer learning path through structured review.
				</p>
			</article>
		</div>
	</section>

	<section aria-labelledby="ecosystem-heading" class="site-section">
		<header class="section-header">
			<p class="kicker">Inside Mirasen</p>
			<h2 id="ecosystem-heading" class="section-title">
				How Chess Lore fits the broader structure
			</h2>
			<p class="section-lead">
				Mirasen is the broader brand and ecosystem. Chess Lore is the current main product direction
				inside that work, while Chessboard is the open-source platform foundation that supports
				current and future tools.
			</p>
		</header>

		<div class="card spotlight p-6 md:p-10">
			<div class="spotlight-grid">
				<div class="spotlight-copy">
					<p>
						This keeps the structure clear: one brand, one current main product direction, and one
						open-source platform foundation.
					</p>
					<div class="theme-list" aria-label="Brand structure">
						<span class="badge preset-filled-surface-50-950">Mirasen</span>
						<span class="badge preset-filled-surface-50-950">Chess Lore</span>
						<span class="badge preset-filled-surface-50-950">Chessboard</span>
						<span class="badge preset-filled-surface-50-950">structured learning</span>
					</div>
				</div>

				<ul class="numbered-list">
					<li><p>Mirasen — brand and ecosystem</p></li>
					<li><p>Chess Lore — current main product direction</p></li>
					<li><p>Chessboard — foundation layer and open-source platform</p></li>
				</ul>
			</div>
		</div>

		<div class="section-actions">
			<a class="btn preset-filled-primary-500" href={chessboardHref}>Explore Chessboard</a>
			<a class="btn preset-tonal" href={homeHref}>Back to Mirasen</a>
		</div>
	</section>
</main>
