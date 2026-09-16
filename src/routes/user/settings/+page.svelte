<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	
	let { data, form } = $props();

	let passwordLoading = $state(false);

	// Real state for dark mode
	let isDarkMode = $state(data.theme === 'dark');

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		const themeValue = isDarkMode ? 'dark' : 'light';
		
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		
		document.cookie = `theme_${data.userId}=${themeValue}; path=/; max-age=31536000`;
	}
	
	// Real state for privacy
	let isPrivate = $state(data.isPrivate);
	let requireFollowForMessage = $state(data.requireFollowForMessage);
	let isUpdating = $state(false);

	// Modal state
	let formElement: HTMLFormElement;
	let showPrivacyModal = $state(false);
	let pendingPrivacyState = $state(false);

	function confirmPrivacyToggle() {
		isPrivate = pendingPrivacyState;
		showPrivacyModal = false;
		setTimeout(() => {
			if (formElement) formElement.requestSubmit();
		}, 0);
	}

	let messageFormElement: HTMLFormElement;
	let showMessagePrivacyModal = $state(false);
	let pendingMessagePrivacyState = $state(false);

	function confirmMessagePrivacyToggle() {
		requireFollowForMessage = pendingMessagePrivacyState;
		showMessagePrivacyModal = false;
		setTimeout(() => {
			if (messageFormElement) messageFormElement.requestSubmit();
		}, 0);
	}
</script>

<svelte:head>
	<title>Settings — K-Social</title>
</svelte:head>

<div class="min-h-full">
	<!-- Full Width Header -->
	<div class="relative w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-8 pb-12 px-6 lg:px-8">
		<div class="max-w-4xl mx-auto">
			<h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Pengaturan Akun</h1>
			<p class="mt-2 text-slate-500 dark:text-slate-400 font-medium text-xl">Kelola preferensi visual aplikasi Anda.</p>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="max-w-4xl mx-auto px-6 lg:px-8 pb-16 pt-12">
		<div class="space-y-16">

			<!-- Privacy Section -->
			<section>
				<div class="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
					<h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
						<svg class="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						Privasi Akun
					</h2>
					<p class="mt-2 text-slate-500 dark:text-slate-400">Atur siapa saja yang dapat melihat profil dan aktivitas Anda.</p>
				</div>

				<div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
								<svg class="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
								</svg>
								Akun Privat (Private Profile)
							</h3>
							<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Jika diaktifkan, hanya pengikut yang disetujui yang dapat melihat feed Anda.</p>
						</div>
						
						<form 
							bind:this={formElement}
							method="POST" 
							action="?/updatePrivacy"
							use:enhance={() => {
								isUpdating = true;
								return async ({ update }) => {
									await update({ reset: false });
									isUpdating = false;
								};
							}}
						>
							<input type="hidden" name="isPrivate" value={isPrivate.toString()} />
							<input type="hidden" name="requireFollowForMessage" value={requireFollowForMessage.toString()} />
							<button 
								type="button"
								disabled={isUpdating}
								class="{isPrivate ? 'bg-green-600' : 'bg-slate-200'} {isUpdating ? 'opacity-50 cursor-not-allowed' : ''} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 shadow-sm"
								onclick={() => {
									pendingPrivacyState = !isPrivate;
									showPrivacyModal = true;
								}}
							>
								<span class="sr-only">Toggle Private Profile</span>
								<span class="{isPrivate ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out">
									<span class="{isPrivate ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
										<svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 12 12">
											<path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									</span>
									<span class="{isPrivate ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
										<svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 12 12">
											<path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
										</svg>
									</span>
								</span>
							</button>
						</form>
					</div>
				</div>

				<div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm mt-4">
					<div class="flex items-center justify-between">
						<div class="pr-4">
							<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
								<svg class="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
								Batasi Pesan Masuk
							</h3>
							<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Jika diaktifkan, hanya pengikut yang telah disetujui yang dapat mengirim pesan kepada Anda. (Khusus Akun Privat)</p>
						</div>
						
						<form 
							bind:this={messageFormElement}
							method="POST" 
							action="?/updatePrivacy"
							use:enhance={() => {
								isUpdating = true;
								return async ({ update }) => {
									await update({ reset: false });
									isUpdating = false;
								};
							}}
						>
							<input type="hidden" name="isPrivate" value={isPrivate.toString()} />
							<input type="hidden" name="requireFollowForMessage" value={requireFollowForMessage.toString()} />
							<button 
								type="button"
								disabled={!isPrivate || isUpdating}
								class="{requireFollowForMessage ? 'bg-green-600' : 'bg-slate-200'} {!isPrivate || isUpdating ? 'opacity-50 cursor-not-allowed' : ''} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 shadow-sm"
								onclick={() => {
									pendingMessagePrivacyState = !requireFollowForMessage;
									showMessagePrivacyModal = true;
								}}
							>
								<span class="sr-only">Toggle Require Follow for Message</span>
								<span class="{requireFollowForMessage ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out">
									<span class="{requireFollowForMessage ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
										<svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 12 12">
											<path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									</span>
									<span class="{requireFollowForMessage ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
										<svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 12 12">
											<path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
										</svg>
									</span>
								</span>
							</button>
						</form>
					</div>
				</div>
			</section>
			
			<!-- Security Form -->
			<section>
				<div class="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
					<h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
						<svg class="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						Keamanan & Password
					</h2>
					<p class="mt-2 text-slate-500 dark:text-slate-400">Pastikan akun Anda tetap aman dengan menggunakan kata sandi yang kuat.</p>
				</div>

				<!-- Form result feedback -->
				{#if form?.successPassword === false}
					<div class="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border-l-4 border-red-500">
						{form.message}
					</div>
				{/if}
				{#if form?.successPassword === true}
					<div class="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600 border-l-4 border-green-500">
						{form.message}
					</div>
				{/if}

				<form 
					method="POST" 
					action="?/updatePassword" 
					use:enhance={() => {
						passwordLoading = true;
						return async ({ update }) => {
							await update();
							passwordLoading = false;
						};
					}}
					class="space-y-6 max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm"
				>
					<div>
						<label for="oldPassword" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Password Lama</label>
						<input type="password" id="oldPassword" name="oldPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
					</div>

					<div>
						<label for="newPassword" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
						<input type="password" id="newPassword" name="newPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
					</div>

					<div>
						<label for="confirmPassword" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</label>
						<input type="password" id="confirmPassword" name="confirmPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
					</div>

					<div class="pt-2">
						<button type="submit" disabled={passwordLoading} class="w-full md:w-auto px-8 flex justify-center py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
							{#if passwordLoading}
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Menyimpan...
							{:else}
								Ubah Password
							{/if}
						</button>
					</div>
				</form>
			</section>

			<!-- Preferences Section -->
			<section>
				<div class="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
					<h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
						<svg class="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
						</svg>
						Preferensi Visual
					</h2>
					<p class="mt-2 text-slate-500 dark:text-slate-400">Sesuaikan tampilan antarmuka sesuai dengan kenyamanan mata Anda.</p>
				</div>

				<div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
								<svg class="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
								Mode Gelap (Dark Mode)
							</h3>
							<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Aktifkan tema gelap untuk kenyamanan mata saat berada di ruangan yang redup.</p>
						</div>
						<!-- Toggle Switch -->
						<button 
							type="button"
							class="{isDarkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 shadow-sm"
							onclick={toggleDarkMode}
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

<!-- Privacy Confirmation Modal -->
{#if showPrivacyModal}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
	<div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
		<div class="flex items-center gap-3 mb-4 text-amber-500">
			<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<h3 class="text-xl font-bold text-slate-900">Konfirmasi Perubahan</h3>
		</div>
		<p class="text-slate-600 mb-8 leading-relaxed">
			Apakah Anda yakin ingin mengubah status profil Anda menjadi 
			<strong class="text-slate-900">{pendingPrivacyState ? 'Privat' : 'Publik'}</strong>? 
			{#if pendingPrivacyState}
				Jika privat, hanya pengikut yang disetujui yang dapat berinteraksi dengan Anda.
			{:else}
				Jika publik, semua orang dapat melihat profil dan postingan Anda.
			{/if}
		</p>
		<div class="flex justify-end gap-3">
			<button 
				type="button"
				onclick={() => showPrivacyModal = false}
				class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
			>
				Batal
			</button>
			<button 
				type="button"
				onclick={confirmPrivacyToggle}
				class="px-5 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-md shadow-green-500/20 active:scale-95"
			>
				Ya, Lanjutkan
			</button>
		</div>
	</div>
</div>
{/if}

<!-- Message Privacy Confirmation Modal -->
{#if showMessagePrivacyModal}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
	<div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
		<div class="flex items-center gap-3 mb-4 text-blue-500">
			<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
			</svg>
			<h3 class="text-xl font-bold text-slate-900">Konfirmasi Perubahan</h3>
		</div>
		<p class="text-slate-600 mb-8 leading-relaxed">
			Apakah Anda yakin ingin mengubah pengaturan pesan menjadi 
			<strong class="text-slate-900">{pendingMessagePrivacyState ? 'Dibatasi' : 'Tidak Dibatasi'}</strong>? 
			{#if pendingMessagePrivacyState}
				Jika dibatasi, hanya pengikut yang telah disetujui yang dapat mengirim pesan kepada Anda.
			{:else}
				Jika tidak dibatasi, semua orang (walaupun Anda tidak mengikuti/di-acc mereka) dapat mengirimi Anda pesan secara langsung.
			{/if}
		</p>
		<div class="flex justify-end gap-3">
			<button 
				type="button"
				onclick={() => showMessagePrivacyModal = false}
				class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
			>
				Batal
			</button>
			<button 
				type="button"
				onclick={confirmMessagePrivacyToggle}
				class="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 active:scale-95"
			>
				Ya, Lanjutkan
			</button>
		</div>
	</div>
</div>
{/if}
