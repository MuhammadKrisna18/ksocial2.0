<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Teman & Pengguna Lain — K-Social</title>
</svelte:head>

<div class="min-h-full">
	<!-- Full Width Header -->
	<div class="relative w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-8 pb-12 px-6 lg:px-8">
		<div class="max-w-7xl mx-auto">
			<h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Temukan Teman</h1>
			<p class="mt-2 text-slate-500 dark:text-slate-400 font-medium text-xl">Cari dan ikuti pengguna lain di K-Social untuk melihat aktivitas mereka.</p>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-12 space-y-16">
		
		{#snippet userCard(user)}
			<a href="/user/profile/{user.username}" class="block group bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
				
				<!-- Avatar -->
				<div class="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-indigo-500/30 mb-4 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
					{#if user.profilePictureUrl}
						<img src={user.profilePictureUrl} alt={user.username} class="w-full h-full object-cover" />
					{:else}
						{user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
					{/if}
				</div>
				
				<!-- User Info -->
				<h3 class="text-xl font-bold text-slate-900 dark:text-white truncate w-full px-2" title={user.fullName || user.username}>
					{user.fullName || user.username}
				</h3>
				<p class="text-slate-500 dark:text-slate-400 font-medium mt-1 truncate w-full px-2" title={`@${user.username}`}>
					@{user.username}
				</p>

				<!-- Actions -->
				<div class="mt-6 w-full pt-4 border-t border-slate-100 dark:border-slate-700">
					{#if user.followStatus === 'follows_you'}
						<button class="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors duration-300 shadow-md shadow-indigo-500/20 active:scale-95">
							Ikuti Balik
						</button>
					{:else}
						<button class="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-300">
							Lihat Profil
						</button>
					{/if}
				</div>
			</a>
		{/snippet}

		<!-- Kategori: Ikuti Balik (Followers you don't follow) -->
		{#if data.followersToFollowBack && data.followersToFollowBack.length > 0}
			<section>
				<h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
					<span class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl">
						<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
					</span>
					Pengikut (Ikuti Balik)
				</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.followersToFollowBack as user}
						{@render userCard(user)}
					{/each}
				</div>
			</section>
		{/if}

		<!-- Kategori: Teman Mutual -->
		{#if data.mutualFriends && data.mutualFriends.length > 0}
			<section>
				<h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
					<span class="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
						<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</span>
					Teman (Mutual)
				</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.mutualFriends as user}
						{@render userCard(user)}
					{/each}
				</div>
			</section>
		{/if}

		<!-- Kategori: Temukan Teman Lainnya -->
		{#if data.otherUsers && data.otherUsers.length > 0}
			<section>
				<h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
					<span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-2 rounded-xl">
						<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</span>
					Pengguna Lainnya
				</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.otherUsers as user}
						{@render userCard(user)}
					{/each}
				</div>
			</section>
		{/if}

		{#if data.followersToFollowBack.length === 0 && data.mutualFriends.length === 0 && data.otherUsers.length === 0}
			<div class="bg-white dark:bg-slate-800 rounded-3xl p-12 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
				<div class="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
					<svg class="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</div>
				<h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Belum ada pengguna lain</h3>
				<p class="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">Saat ini belum ada pengguna lain yang terdaftar di sistem. Jadilah yang pertama mengajak teman Anda!</p>
			</div>
		{/if}
	</div>
</div>
