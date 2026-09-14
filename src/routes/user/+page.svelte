<script lang="ts">

	const posts = [
		{
			id: 1,
			author: 'Sarah Jenkins',
			username: '@sarahj',
			avatar: 'S',
			time: '2 hours ago',
			content: 'Just finished setting up my new workspace! So excited to start working on the new SvelteKit project. The developer experience is just amazing. 🚀',
			likes: 24,
			comments: 5
		},
		{
			id: 2,
			author: 'Alex Chen',
			username: '@alexc',
			avatar: 'A',
			time: '5 hours ago',
			content: 'Anyone going to the local tech meetup this weekend? Let me know, would love to connect with some folks!',
			likes: 12,
			comments: 3
		}
	];
</script>

<svelte:head>
	<title>Feed — K-Social</title>
</svelte:head>

<div class="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Home Feed</h1>
		<p class="text-slate-500 mt-1">See what your friends are up to</p>
	</div>

	<!-- Create Post Card -->
	<div class="mb-8 rounded-2xl bg-white/80 backdrop-blur-xl p-5 shadow-xl shadow-slate-200/50 border border-slate-100">
		<div class="flex gap-4">
			<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
				U
			</div>
			<div class="flex-1">
				<textarea
					rows="3"
					placeholder="What's on your mind, John?"
					class="w-full resize-none rounded-xl border-0 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all shadow-inner"
				></textarea>
				<div class="mt-3 flex items-center justify-between">
					<div class="flex gap-2">
						<button class="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</button>
						<button class="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</button>
					</div>
					<button class="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/30 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-transform active:scale-95">
						Post
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Feed -->
	<div class="space-y-6">
		{#each posts as post}
			<div class="rounded-2xl bg-white/80 backdrop-blur-md p-5 shadow-lg shadow-slate-200/40 border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
				<!-- Post Header -->
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
							{post.avatar}
						</div>
						<div>
							<p class="text-sm font-bold text-slate-900">
								{post.author}
								<span class="ml-1 text-xs font-normal text-slate-500">{post.username}</span>
							</p>
							<p class="text-xs text-slate-400">{post.time}</p>
						</div>
					</div>
					<button class="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
						</svg>
					</button>
				</div>

				<!-- Post Content -->
				<div class="mt-4">
					<p class="text-slate-700 leading-relaxed text-sm">
						{post.content}
					</p>
				</div>

				<!-- Post Actions -->
				<div class="mt-5 flex gap-6 border-t border-slate-100/60 pt-4">
					<button class="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors group">
						<svg class="h-5 w-5 transition-transform group-hover:scale-110 group-active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
						{post.likes}
					</button>
					<button class="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors group">
						<svg class="h-5 w-5 transition-transform group-hover:scale-110 group-active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
						{post.comments}
					</button>
					<button class="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-500 transition-colors">
						<svg class="h-5 w-5 transition-transform hover:scale-110 active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
						</svg>
						Share
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
