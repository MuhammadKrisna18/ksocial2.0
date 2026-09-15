<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	
	let isDeleting = $state(false);
	
	// Dummy states for visual preferences
	let isDarkMode = $state(false);
	let emailNotifications = $state(true);
</script>

<svelte:head>
	<title>Settings — K-Social</title>
</svelte:head>

<div class="min-h-full">
	<!-- Full Width Header -->
	<div class="relative w-full bg-white/70 backdrop-blur-md border-b border-slate-200 pt-8 pb-12 px-6 lg:px-8">
		<div class="max-w-4xl mx-auto">
			<h1 class="text-4xl font-black text-slate-900 tracking-tight">Pengaturan Akun</h1>
			<p class="mt-2 text-slate-500 font-medium text-xl">Kelola preferensi dan zona berbahaya akun Anda.</p>
		</div>
	</div>

	<!-- Main Content Area (Forms without Cards) -->
	<div class="max-w-4xl mx-auto px-6 lg:px-8 pb-16 pt-12">
		<div class="space-y-16">
			
			<!-- Preferences Section (Dummy) -->
			<section>
				<div class="mb-8 border-b border-slate-200 pb-4">
					<h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
						<svg class="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
						</svg>
						Preferensi Visual & Notifikasi
					</h2>
					<p class="mt-2 text-slate-500">Sesuaikan pengalaman Anda di platform (Hanya tampilan / Mockup sementara).</p>
				</div>

				<div class="space-y-6">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-bold text-slate-800">Mode Gelap (Dark Mode)</h3>
							<p class="text-sm text-slate-500">Aktifkan tema gelap untuk kenyamanan mata.</p>
						</div>
						<!-- Toggle Switch -->
						<button 
							type="button"
							class="{isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
							onclick={() => isDarkMode = !isDarkMode}
						>
							<span class="sr-only">Use setting</span>
							<span class="{isDarkMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
								<span class="{isDarkMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
									<svg class="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 12 12">
										<path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</span>
								<span class="{isDarkMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
									<svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
										<path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
									</svg>
								</span>
							</span>
						</button>
					</div>

					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-bold text-slate-800">Notifikasi Email</h3>
							<p class="text-sm text-slate-500">Terima pemberitahuan aktivitas via email.</p>
						</div>
						<!-- Toggle Switch -->
						<button 
							type="button"
							class="{emailNotifications ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
							onclick={() => emailNotifications = !emailNotifications}
						>
							<span class="sr-only">Use setting</span>
							<span class="{emailNotifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
						</button>
					</div>
				</div>
			</section>

			<!-- Danger Zone Form -->
			<section>
				<div class="mb-8 border-b border-red-200 pb-4">
					<h2 class="text-2xl font-bold text-red-600 flex items-center gap-3">
						<svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						Zona Berbahaya (Danger Zone)
					</h2>
					<p class="mt-2 text-red-500/80">Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan.</p>
				</div>

				{#if form?.success === false}
					<div class="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border-l-4 border-red-500">
						{form.message}
					</div>
				{/if}

				<div class="bg-red-50/50 border border-red-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
					<div>
						<h3 class="text-lg font-bold text-slate-900">Hapus Akun Permanen</h3>
						<p class="text-sm text-slate-500 mt-1">
							Setelah Anda menghapus akun, semua data Anda akan dihapus secara permanen. Hal ini tidak dapat dibatalkan.
						</p>
					</div>
					
					<form 
						method="POST" 
						action="?/deleteAccount" 
						use:enhance={() => {
							const confirmDelete = confirm('Apakah Anda YAKIN ingin menghapus akun secara permanen?');
							if (!confirmDelete) {
								return ({ cancel }) => cancel();
							}
							
							isDeleting = true;
							return async ({ update }) => {
								await update();
								isDeleting = false;
							};
						}}
					>
						<button type="submit" disabled={isDeleting} class="w-full md:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm shadow-red-600/30">
							{#if isDeleting}
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Menghapus...
							{:else}
								Hapus Akun
							{/if}
						</button>
					</form>
				</div>
			</section>
		</div>
	</div>
</div>
