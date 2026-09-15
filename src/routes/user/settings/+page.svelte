<script lang="ts">
	// Dummy state for visual preferences
	let isDarkMode = $state(false);
</script>

<svelte:head>
	<title>Settings — K-Social</title>
</svelte:head>

<div class="min-h-full">
	<!-- Full Width Header -->
	<div class="relative w-full bg-white/70 backdrop-blur-md border-b border-slate-200 pt-8 pb-12 px-6 lg:px-8">
		<div class="max-w-4xl mx-auto">
			<h1 class="text-4xl font-black text-slate-900 tracking-tight">Pengaturan Akun</h1>
			<p class="mt-2 text-slate-500 font-medium text-xl">Kelola preferensi visual aplikasi Anda.</p>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="max-w-4xl mx-auto px-6 lg:px-8 pb-16 pt-12">
		<div class="space-y-16">
			
			<!-- Preferences Section -->
			<section>
				<div class="mb-8 border-b border-slate-200 pb-4">
					<h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
						<svg class="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
						</svg>
						Preferensi Visual
					</h2>
					<p class="mt-2 text-slate-500">Sesuaikan tampilan antarmuka sesuai dengan kenyamanan mata Anda.</p>
				</div>

				<div class="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
								<svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
								Mode Gelap (Dark Mode)
							</h3>
							<p class="text-sm text-slate-500 mt-1">Aktifkan tema gelap untuk kenyamanan mata saat berada di ruangan yang redup.</p>
						</div>
						<!-- Toggle Switch -->
						<button 
							type="button"
							class="{isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 shadow-sm"
							onclick={() => isDarkMode = !isDarkMode}
						>
							<span class="sr-only">Use setting</span>
							<span class="{isDarkMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out">
								<span class="{isDarkMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
									<svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 12 12">
										<path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</span>
								<span class="{isDarkMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
									<svg class="h-4 w-4 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
										<path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
									</svg>
								</span>
							</span>
						</button>
					</div>
				</div>
			</section>

		</div>
	</div>
</div>
