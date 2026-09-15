<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
	
	let isPosting = $state(false);

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

	<!-- Create Post Card -->
	<div class="mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">
		<form 
			method="POST" 
			action="?/createPost"
			class="flex gap-4"
			use:enhance={() => {
				isPosting = true;
				return async ({ update, formElement }) => {
					await update();
					isPosting = false;
					formElement.reset();
				};
			}}
		>
			<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md uppercase">
				{data.user?.username?.charAt(0) || 'U'}
			</div>
			<div class="flex-1">
				<textarea
					name="content"
					rows="3"
					placeholder="What's on your mind, {data.user?.fullName?.split(' ')[0] || 'friend'}?"
					class="w-full resize-none rounded-xl border-0 bg-slate-50 dark:bg-slate-900/50 py-3 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all shadow-inner"
					required
				></textarea>
				
				{#if form?.error}
					<p class="text-sm text-red-500 mt-2">{form.error}</p>
				{/if}

				<div class="mt-3 flex items-center justify-between">
					<div class="flex gap-2">
						<button type="button" class="p-2 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors cursor-not-allowed" title="Attach image (Coming soon)">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</button>
						<button type="button" class="p-2 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors cursor-not-allowed" title="Add emoji (Coming soon)">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</button>
					</div>
					<button 
						type="submit" 
						disabled={isPosting}
						class="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/30 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{#if isPosting}
							<svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Posting...
						{:else}
							Post
						{/if}
					</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Feed -->
	<div class="space-y-6">
		{#if data.posts.length === 0}
			<div class="text-center py-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700">
				<p class="text-slate-500 dark:text-slate-400 text-lg">No posts yet. Be the first to post!</p>
			</div>
		{:else}
			{#each data.posts as post}
				<div class="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 border border-slate-100 dark:border-slate-700 transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
					<!-- Post Header -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md uppercase">
								{post.authorName?.charAt(0) || post.authorUsername?.charAt(0)}
							</div>
							<div>
								<p class="text-sm font-bold text-slate-900 dark:text-white">
									{post.authorName}
									<span class="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">@{post.authorUsername}</span>
								</p>
								<p class="text-xs text-slate-400 dark:text-slate-500">{formatTimeAgo(post.createdAt)}</p>
							</div>
						</div>
						<button class="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
							</svg>
						</button>
					</div>

					<!-- Post Content -->
					<div class="mt-4">
						<p class="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{post.content}</p>
					</div>

				<!-- Post Actions -->
				<div class="mt-5 flex gap-6 border-t border-slate-100/60 dark:border-slate-700/60 pt-4">
					<button class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors group cursor-not-allowed" title="Likes (Coming soon)">
						<svg class="h-5 w-5 transition-transform group-hover:scale-110 group-active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
						{post.likesCount}
					</button>
					<button class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group cursor-not-allowed" title="Comments (Coming soon)">
						<svg class="h-5 w-5 transition-transform group-hover:scale-110 group-active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
						{post.commentsCount}
					</button>
					<button class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition-colors cursor-not-allowed" title="Share (Coming soon)">
						<svg class="h-5 w-5 transition-transform hover:scale-110 active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
						</svg>
						Share
					</button>
				</div>
			</div>
		{/each}
		{/if}
	</div>
</div>
