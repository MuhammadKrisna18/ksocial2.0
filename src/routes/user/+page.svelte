<script lang="ts">
	import { enhance } from '$app/forms';
	import CreatePostModal from '$lib/features/post/components/CreatePostModal.svelte';
	import PostCard from '$lib/features/post/components/PostCard.svelte';
	
	let { data, form } = $props();
	
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
	<div class="mb-8">
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Home Feed</h1>
		<p class="text-slate-500 dark:text-slate-400 mt-1">See what your friends are up to</p>
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
