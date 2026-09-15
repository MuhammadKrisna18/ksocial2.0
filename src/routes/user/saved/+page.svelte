<script lang="ts">
	import { enhance } from '$app/forms';
	
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
				<!-- We can reuse the post component or copy the markup -->
				<div class="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:hover:shadow-blue-900/5">
					<div class="flex items-start gap-4">
						<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
							{post.authorName.charAt(0).toUpperCase()}
						</div>
						
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<h3 class="font-bold text-slate-900 dark:text-white truncate">{post.authorName}</h3>
									<span class="text-sm text-slate-500 dark:text-slate-400 truncate">@{post.authorUsername}</span>
									<span class="text-slate-300 dark:text-slate-600">·</span>
									<span class="text-sm text-slate-500 dark:text-slate-400 shrink-0">{formatTimeAgo(post.createdAt)}</span>
								</div>
								
								<details class="relative">
									<summary class="list-none p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer [&::-webkit-details-marker]:hidden">
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
										</svg>
									</summary>
									<div class="absolute right-0 mt-1 w-40 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-10 py-1">
										<form 
											method="POST" 
											action="?/toggleSave" 
											use:enhance={() => {
												post.isSaved = !post.isSaved;
												return async ({ update }) => {
													await update({ reset: false });
												};
											}}
										>
											<input type="hidden" name="postId" value={post.id} />
											<button class="w-full text-left px-4 py-2.5 text-sm font-medium {post.isSaved ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'} hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors" onclick={(e) => {
												const details = e.currentTarget.closest('details');
												if (details) details.open = false;
											}}>
												<svg class="w-4 h-4" fill={post.isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
												</svg>
												{post.isSaved ? 'Unsave' : 'Save'}
											</button>
										</form>
										{#if data.user?.sub === post.authorId}
											<form 
												method="POST" 
												action="?/deletePost" 
												use:enhance={() => {
													return async ({ update }) => {
														await update();
													};
												}}
											>
												<input type="hidden" name="postId" value={post.id} />
												<button class="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors" onclick={(e) => {
													const details = e.currentTarget.closest('details');
													if (details) details.open = false;
												}}>
													<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
													Delete
												</button>
											</form>
										{/if}
									</div>
								</details>
							</div>
							
							<div class="mt-3">
								<p class="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{post.content}</p>
								
								{#if post.media && post.media.length > 0}
									<div class="mt-3 grid gap-2 {post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}">
										{#each post.media as m}
											<div class="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
												{#if m.type === 'image'}
													<img src={m.url} alt="Post media" class="w-full h-auto max-h-96 object-cover" loading="lazy" />
												{:else}
													<video src={m.url} controls class="w-full h-auto max-h-96 object-cover"></video>
												{/if}
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</div>

					<div class="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
						<button class="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group text-sm font-medium">
							<div class="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
								</svg>
							</div>
							<span>{post.likesCount}</span>
						</button>
						<button class="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group text-sm font-medium">
							<div class="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
								</svg>
							</div>
							<span>{post.commentsCount}</span>
						</button>
						<button class="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group text-sm font-medium ml-auto">
							<div class="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
								</svg>
							</div>
							<span class="hidden sm:inline">Share</span>
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
