<script lang="ts">
	import { enhance } from '$app/forms';
	import PostCard from '$lib/features/post/components/PostCard.svelte';
	import CommentItem from '$lib/features/post/components/CommentItem.svelte';
	
	let { data } = $props();
	
	let activeTab = $state<'posts' | 'comments'>('posts');
	
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

	<!-- Tabs -->
	<div class="mb-6 flex space-x-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
		<button
			class="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all {activeTab === 'posts' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow' : 'text-slate-700 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}"
			onclick={() => activeTab = 'posts'}
		>
			Posts ({data.posts.length})
		</button>
		<button
			class="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all {activeTab === 'comments' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow' : 'text-slate-700 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}"
			onclick={() => activeTab = 'comments'}
		>
			Comments ({data.comments.length})
		</button>
	</div>

	<!-- Feed -->
	<div class="space-y-6">
		{#if activeTab === 'posts'}
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
		{:else}
			{#if data.comments.length === 0}
				<div class="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center backdrop-blur-sm">
					<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
						<svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
						</svg>
					</div>
					<h3 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">No saved comments</h3>
					<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">When you save a comment, it will appear here.</p>
				</div>
			{:else}
				<div class="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
					{#each data.comments as comment (comment.id)}
						<CommentItem {comment} currentUser={data.user} post={{}} onReply={() => {}} />
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
