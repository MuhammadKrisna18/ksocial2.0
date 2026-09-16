<script lang="ts">
	import { enhance } from '$app/forms';
	import PostCard from '$lib/features/post/components/PostCard.svelte';
	
	let { data } = $props();
	
	// Format time differences nicely
	function formatTimeAgo(dateString: Date) {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 7) return `${diffDays}d`;
		return date.toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Saved Posts - K-Social</title>
</svelte:head>

<div class="mx-auto max-w-2xl w-full px-4 py-8 lg:py-12">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Saved Posts</h1>
		<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Your collection of bookmarked posts.</p>
	</div>

	<!-- Feed -->
	<div class="space-y-6">
		{#if data.posts.length === 0}
			<div class="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center backdrop-blur-sm">
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
					<svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">No saved posts</h3>
				<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">When you save a post, it will appear here.</p>
			</div>
		{:else}
			{#each data.posts as post (post.id)}
				<PostCard {post} currentUser={data.user} />
			{/each}
		{/if}
	</div>
</div>
