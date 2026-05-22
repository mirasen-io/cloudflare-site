<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<section class="mt-6 flex items-center gap-3">
	<Avatar>
		<Avatar.Image
			src="https://i.pravatar.cc/64?u=skeleton-smoke-test"
			alt="Skeleton smoke test avatar"
		/>
		<Avatar.Fallback>SK</Avatar.Fallback>
	</Avatar>
	<span class="text-sm">Skeleton integration smoke test — Avatar component rendered.</span>
</section>
