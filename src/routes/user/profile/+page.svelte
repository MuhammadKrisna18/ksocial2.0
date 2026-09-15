<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	
	let profileLoading = $state(false);
	let passwordLoading = $state(false);

	const profile = data.profile;
</script>

<svelte:head>
	<title>Profile — K-Social</title>
</svelte:head>

<div class="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
	<!-- Cover & Avatar Header -->
	<div class="relative rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm">
		<!-- Cover Photo (Gradient Placeholder) -->
		<div class="h-48 w-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600"></div>
		
		<!-- Avatar (Positioned in the middle) -->
		<div class="absolute top-24 left-1/2 -translate-x-1/2">
			<img 
				src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`} 
				alt="Profile Avatar" 
				class="h-32 w-32 rounded-full border-4 border-white bg-slate-100 shadow-xl object-cover" 
			/>
		</div>
		
		<!-- Profile Info Text -->
		<div class="pt-14 pb-8 px-6 text-center">
			<h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">{profile?.fullName || 'Profile Anda'}</h1>
			<p class="mt-1 text-slate-500 font-medium text-lg">@{profile?.username || 'username'}</p>
		</div>
	</div>

	{#if !profile}
		<div class="rounded-xl bg-red-50 p-4 border border-red-200 text-red-600 font-medium shadow-sm">
			Data profile tidak ditemukan. Silakan login kembali.
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Personal Info Form -->
			<div class="rounded-3xl border border-white/60 bg-white/70 p-6 sm:p-8 backdrop-blur-xl shadow-sm">
				<h2 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
					<svg class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
					Informasi Personal
				</h2>

				<!-- Form result feedback -->
				{#if form?.successProfile === false}
					<div class="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
						{form.message}
					</div>
				{/if}
				{#if form?.successProfile === true}
					<div class="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600 border border-green-200">
						{form.message}
					</div>
				{/if}

				<form 
					method="POST" 
					action="?/updateProfile" 
					use:enhance={() => {
						profileLoading = true;
						return async ({ update }) => {
							await update();
							profileLoading = false;
						};
					}}
					class="space-y-5"
				>
					<div>
						<label for="fullName" class="block text-sm font-bold text-slate-700">Nama Lengkap</label>
						<input type="text" id="fullName" name="fullName" value={profile.fullName} required class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
					</div>

					<div>
						<label for="username" class="block text-sm font-bold text-slate-700">Username</label>
						<input type="text" id="username" name="username" value={profile.username} required class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
					</div>

					<div>
						<label for="email" class="block text-sm font-bold text-slate-700">Email <span class="text-xs font-medium text-slate-400 ml-1">(Hanya Baca)</span></label>
						<input type="email" id="email" value={profile.email} disabled class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 cursor-not-allowed shadow-sm" />
					</div>

					<div>
						<label for="dateOfBirth" class="block text-sm font-bold text-slate-700">Tanggal Lahir</label>
						<input type="date" id="dateOfBirth" name="dateOfBirth" value={profile.dateOfBirth} required class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
					</div>

					<div class="pt-4">
						<button type="submit" disabled={profileLoading} class="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-sm shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
							{#if profileLoading}
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Menyimpan...
							{:else}
								Simpan Profil
							{/if}
						</button>
					</div>
				</form>
			</div>

			<!-- Security Form -->
			<div class="rounded-3xl border border-white/60 bg-white/70 p-6 sm:p-8 backdrop-blur-xl shadow-sm">
				<h2 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
					<svg class="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
					Keamanan & Password
				</h2>

				<!-- Form result feedback -->
				{#if form?.successPassword === false}
					<div class="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
						{form.message}
					</div>
				{/if}
				{#if form?.successPassword === true}
					<div class="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600 border border-green-200">
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
					class="space-y-5"
				>
					<div>
						<label for="oldPassword" class="block text-sm font-bold text-slate-700">Password Lama</label>
						<input type="password" id="oldPassword" name="oldPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm" />
					</div>

					<hr class="border-slate-200 my-6" />

					<div>
						<label for="newPassword" class="block text-sm font-bold text-slate-700">Password Baru</label>
						<input type="password" id="newPassword" name="newPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm" />
					</div>

					<div>
						<label for="confirmPassword" class="block text-sm font-bold text-slate-700">Konfirmasi Password Baru</label>
						<input type="password" id="confirmPassword" name="confirmPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm" />
					</div>

					<div class="pt-4">
						<button type="submit" disabled={passwordLoading} class="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
			</div>
		</div>
	{/if}
</div>
