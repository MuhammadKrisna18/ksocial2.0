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
	<div class="max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-12">
		{#if data.users && data.users.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.users as user}
					<a href="/user/profile/{user.username}" class="block group bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col items-center text-center">
						<!-- Avatar -->
						<div class="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-indigo-500/30 mb-4 group-hover:scale-105 transition-transform duration-300">
							{user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
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
							<!-- Dummy Action Button for now -->
							<button class="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-300">
								Lihat Profil
							</button>
						</div>
					</a>
				{/each}
			</div>
		{:else}
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
