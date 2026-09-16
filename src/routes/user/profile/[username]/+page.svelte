<script lang="ts">
	let { data } = $props();

	let profile = $derived(data.profile);
	let posts = $derived(data.posts || []);
	let isCurrentUser = $derived(data.isCurrentUser);

	// Determine if we should show the feed
	let canViewFeed = $derived(!profile.isPrivate || isCurrentUser); 
	// Di masa depan: tambahkan kondisi jika pengguna ini adalah "Follower" yang diizinkan (isFollowing)
</script>

<svelte:head>
	<title>{profile.fullName || profile.username} (@{profile.username}) — K-Social</title>
</svelte:head>

<div class="min-h-full pb-16">
	<!-- Full Width Cover Area -->
	<div class="relative w-full h-64 md:h-80 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
		<div class="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
	</div>

	<!-- Profile Section -->
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
		<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 sm:p-10 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-end gap-6">
			
			<!-- Circular Profile Picture -->
			<div class="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-white font-black text-5xl shrink-0">
				{profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.toString().charAt(0).toUpperCase()}
			</div>
			
			<!-- User Info -->
			<div class="flex-1 text-center sm:text-left">
				<h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.fullName || profile.username}</h1>
				<p class="text-slate-500 dark:text-slate-400 font-medium mt-1">@{profile.username}</p>
			</div>

			<!-- Action Button -->
			<div class="mt-4 sm:mt-0 w-full sm:w-auto">
				{#if isCurrentUser}
					<a href="/user/profile" class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
						Edit Profil
					</a>
				{:else}
					<button class="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 active:scale-95">
						Ikuti (Follow)
					</button>
				{/if}
			</div>
		</div>

		<!-- Main Content Feed -->
		<div class="mt-8">
			{#if !canViewFeed}
				<!-- Private Profile State -->
				<div class="bg-white dark:bg-slate-800 rounded-3xl p-12 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
					<div class="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6">
						<svg class="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
					</div>
					<h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Akun ini bersifat Privat</h3>
					<p class="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">Ikuti akun ini untuk melihat foto dan aktivitasnya.</p>
				</div>
			{:else}
				<!-- Feed Posts -->
				<h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
					<svg class="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.5-4.5A2 2 0 0012.586 3H12" />
					</svg>
					Aktivitas Terbaru
				</h2>

				{#if posts.length > 0}
					<div class="space-y-6">
						{#each posts as post}
							<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
								<div class="flex items-center gap-3 mb-4">
									<div class="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
										{profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.toString().charAt(0).toUpperCase()}
									</div>
									<div>
										<h4 class="font-bold text-slate-900 dark:text-white leading-tight">{profile.fullName || profile.username}</h4>
										<p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
											{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
										</p>
									</div>
								</div>
								<p class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>
							</div>
						{/each}
					</div>
				{:else}
					<div class="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center">
						<p class="text-slate-500 dark:text-slate-400 font-medium">Belum ada aktivitas.</p>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
