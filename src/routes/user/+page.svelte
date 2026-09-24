<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import CreatePostModal from '$lib/features/post/components/CreatePostModal.svelte';
	import PostCard from '$lib/features/post/components/PostCard.svelte';
	
	let { data, form } = $props();
	let isRefreshing = $state(false);

	async function refreshFeed() {
		isRefreshing = true;
		try {
			await invalidateAll();
		} finally {
			setTimeout(() => {
				isRefreshing = false;
			}, 300);
		}
	}
	
	// Function to format time differences nicely
	function formatTimeAgo(dateString: Date) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		
		if (diffInSeconds < 60) return 'Just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
		return `${Math.floor(diffInSeconds / 86400)} days ago`;
	}
</script>

<svelte:head>
	<title>Feed — K-Social</title>
</svelte:head>

<div class="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Home Feed</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1">See what your friends are up to</p>
		</div>
		<button
			type="button"
			onclick={refreshFeed}
			disabled={isRefreshing}
			title="Segarkan dan acak postingan feed"
			class="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
		>
			<svg class="w-4 h-4 text-blue-500 {isRefreshing ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
			<span>{isRefreshing ? 'Memuat...' : 'Segarkan Feed'}</span>
		</button>
	</div>

	<!-- Create Post Component -->
	<CreatePostModal currentUser={data.user} {form} />

	<!-- Feed -->
	<div class="space-y-6">
		{#if data.posts.length === 0}
			<div class="text-center py-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700">
				<p class="text-slate-500 dark:text-slate-400 text-lg">No posts yet. Be the first to post!</p>
			</div>
		{:else}
			{#each data.posts as post}
				<PostCard {post} currentUser={data.user} />
			{/each}
		{/if}
	</div>
</div>
