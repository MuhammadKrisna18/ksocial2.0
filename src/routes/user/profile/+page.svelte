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

<div class="min-h-full">
	<!-- Full Width Cover & Avatar Header (No Cards) -->
	<div class="relative w-full">
		<!-- Cover Photo (Edge to edge) -->
		<div class="h-64 w-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600"></div>
		
		<!-- Avatar (Positioned in the middle) -->
		<div class="absolute top-44 left-1/2 -translate-x-1/2">
			<img 
				src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`} 
				alt="Profile Avatar" 
				class="h-40 w-40 rounded-full border-8 border-slate-50 bg-slate-100 object-cover shadow-lg" 
			/>
		</div>
		
		<!-- Profile Info Text -->
		<div class="pt-24 pb-8 px-6 text-center">
			<h1 class="text-4xl font-black text-slate-900 tracking-tight">{profile?.fullName || 'Profile Anda'}</h1>
			<p class="mt-2 text-slate-500 font-medium text-xl">@{profile?.username || 'username'}</p>
		</div>
	</div>

	<!-- Main Content Area (Forms without Cards) -->
	<div class="max-w-4xl mx-auto px-6 lg:px-8 pb-16 pt-8">
		{#if !profile}
			<div class="rounded-xl bg-red-50 p-4 border border-red-200 text-red-600 font-medium shadow-sm">
				Data profile tidak ditemukan. Silakan login kembali.
			</div>
		{:else}
			<div class="space-y-16">
				
				<!-- Personal Info Form -->
				<section>
					<div class="mb-8 border-b border-slate-200 pb-4">
						<h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
							<svg class="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							Informasi Personal
						</h2>
						<p class="mt-2 text-slate-500">Perbarui identitas publik dan detail pribadi Anda.</p>
					</div>

					<!-- Form result feedback -->
					{#if form?.successProfile === false}
						<div class="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border-l-4 border-red-500">
							{form.message}
						</div>
					{/if}
					{#if form?.successProfile === true}
						<div class="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600 border-l-4 border-green-500">
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
						class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
					>
						<div class="md:col-span-2">
							<label for="fullName" class="block text-sm font-bold text-slate-700">Nama Lengkap</label>
							<input type="text" id="fullName" name="fullName" value={profile.fullName} required class="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
						</div>

						<div>
							<label for="username" class="block text-sm font-bold text-slate-700">Username</label>
							<input type="text" id="username" name="username" value={profile.username} required class="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
						</div>

						<div>
							<label for="dateOfBirth" class="block text-sm font-bold text-slate-700">Tanggal Lahir</label>
							<input type="date" id="dateOfBirth" name="dateOfBirth" value={profile.dateOfBirth} required class="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
						</div>

						<div class="md:col-span-2">
							<label for="email" class="block text-sm font-bold text-slate-700">Email <span class="text-xs font-medium text-slate-400 ml-1">(Hanya Baca)</span></label>
							<input type="email" id="email" value={profile.email} disabled class="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 cursor-not-allowed" />
						</div>

						<div class="md:col-span-2 pt-4">
							<button type="submit" disabled={profileLoading} class="w-full md:w-auto px-8 flex justify-center py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
				</section>

				<!-- Security Form -->
				<section>
					<div class="mb-8 border-b border-slate-200 pb-4">
						<h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
							<svg class="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
							Keamanan & Password
						</h2>
						<p class="mt-2 text-slate-500">Pastikan akun Anda tetap aman dengan menggunakan kata sandi yang kuat.</p>
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
						class="space-y-6 max-w-2xl"
					>
						<div>
							<label for="oldPassword" class="block text-sm font-bold text-slate-700">Password Lama</label>
							<input type="password" id="oldPassword" name="oldPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
						</div>

						<div>
							<label for="newPassword" class="block text-sm font-bold text-slate-700">Password Baru</label>
							<input type="password" id="newPassword" name="newPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
						</div>

						<div>
							<label for="confirmPassword" class="block text-sm font-bold text-slate-700">Konfirmasi Password Baru</label>
							<input type="password" id="confirmPassword" name="confirmPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
						</div>

						<div class="pt-2">
							<button type="submit" disabled={passwordLoading} class="w-full md:w-auto px-8 flex justify-center py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
			</div>
		{/if}
	</div>
</div>
