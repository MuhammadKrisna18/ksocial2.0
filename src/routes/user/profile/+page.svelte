<script lang="ts">
	import { enhance } from '$app/forms';
	import Cropper from 'cropperjs';
	import 'cropperjs/dist/cropper.css';

	let { data, form } = $props();
	
	let profileLoading = $state(false);
	let passwordLoading = $state(false);

	const profile = data.profile;

	// --- Photo Upload & Cropping State ---
	let cropperModalOpen = $state(false);
	let imageToCrop = $state<string | null>(null);
	let targetType = $state<'profile'|'cover'>('profile');
	let cropperInstance = $state<Cropper | null>(null);
	let imageElement = $state<HTMLImageElement | null>(null);
	let isUploading = $state(false);
	let croppedBlob = $state<Blob | null>(null);
	let uploadFormElement = $state<HTMLFormElement | null>(null);
	
	function onFileSelected(e: Event, type: 'profile'|'cover') {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const url = URL.createObjectURL(file);
			imageToCrop = url;
			targetType = type;
			cropperModalOpen = true;
			input.value = ''; // clear input
		}
	}

	$effect(() => {
		if (cropperModalOpen && imageElement && imageToCrop) {
			const cropper = new Cropper(imageElement, {
				aspectRatio: targetType === 'profile' ? 1 : 16/9,
				viewMode: 1,
				background: false
			});
			cropperInstance = cropper;
			
			return () => {
				cropper.destroy();
				cropperInstance = null;
			};
		}
	});

	function getCroppedBlob(): Promise<Blob | null> {
		return new Promise((resolve) => {
			if (!cropperInstance) return resolve(null);
			cropperInstance.getCroppedCanvas({
				width: targetType === 'profile' ? 400 : 1200,
				height: targetType === 'profile' ? 400 : 675,
			}).toBlob(resolve, 'image/png');
		});
	}

	async function saveCrop() {
		isUploading = true;
		croppedBlob = await getCroppedBlob();
		if (croppedBlob && uploadFormElement) {
			uploadFormElement.requestSubmit();
		} else {
			isUploading = false;
		}
	}

	function cancelCrop() {
		cropperModalOpen = false;
		if (imageToCrop) URL.revokeObjectURL(imageToCrop);
		imageToCrop = null;
	}

	function deletePhoto(type: 'profile'|'cover') {
		if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return;
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = type === 'profile' ? '?/deleteProfilePicture' : '?/deleteCoverPhoto';
		document.body.appendChild(form);
		form.submit();
	}
</script>

<svelte:head>
	<title>Profile — K-Social</title>
</svelte:head>

<div class="min-h-full">
	<div class="relative w-full group">
		<!-- Cover Photo (Edge to edge) -->
		{#if profile?.coverPhotoUrl}
			<img src={profile.coverPhotoUrl} alt="Cover" class="h-64 w-full object-cover" />
		{:else}
			<div class="h-64 w-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600"></div>
		{/if}
		
		<!-- Cover Edit Overlay -->
		<div class="absolute inset-0 h-64 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
			<label class="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-full font-medium transition-colors">
				<input type="file" class="hidden" accept="image/*" onchange={(e) => onFileSelected(e, 'cover')} />
				Ubah Sampul
			</label>
			{#if profile?.coverPhotoUrl}
				<button type="button" onclick={() => deletePhoto('cover')} class="cursor-pointer bg-red-500/80 hover:bg-red-500 backdrop-blur text-white px-4 py-2 rounded-full font-medium transition-colors">
					Hapus
				</button>
			{/if}
		</div>

		<!-- Avatar (Positioned in the middle) -->
		<div class="absolute top-44 left-1/2 -translate-x-1/2 group/avatar z-20">
			<div class="relative h-40 w-40 rounded-full border-8 border-slate-50 dark:border-slate-900 bg-slate-100 shadow-lg overflow-hidden">
				<img 
					src={profile?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`} 
					alt="Profile Avatar" 
					class="w-full h-full object-cover" 
				/>
				
				<div class="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
					<label class="cursor-pointer text-white text-sm font-bold hover:underline">
						<input type="file" class="hidden" accept="image/*" onchange={(e) => onFileSelected(e, 'profile')} />
						Ubah
					</label>
					{#if profile?.profilePictureUrl}
						<button type="button" onclick={() => deletePhoto('profile')} class="cursor-pointer text-red-200 text-sm font-bold hover:underline">
							Hapus
						</button>
					{/if}
				</div>
			</div>
		</div>
		
		<!-- Profile Info Text -->
		<div class="pt-24 pb-8 px-6 text-center">
			<h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{profile?.fullName || 'Profile Anda'}</h1>
			<p class="mt-2 text-slate-500 dark:text-slate-400 font-medium text-xl">@{profile?.username || 'username'}</p>
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
					<div class="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
							<svg class="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							Informasi Personal
						</h2>
						<p class="mt-2 text-slate-500 dark:text-slate-400">Perbarui identitas publik dan detail pribadi Anda.</p>
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
							<label for="fullName" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
							<input type="text" id="fullName" name="fullName" value={profile.fullName} required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
						</div>

						<div>
							<label for="username" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Username</label>
							<input type="text" id="username" name="username" value={profile.username} required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
						</div>

						<div>
							<label for="dateOfBirth" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Tanggal Lahir</label>
							<input type="date" id="dateOfBirth" name="dateOfBirth" value={profile.dateOfBirth} required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
						</div>

						<div class="md:col-span-2">
							<label for="email" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Email <span class="text-xs font-medium text-slate-400 ml-1">(Hanya Baca)</span></label>
							<input type="email" id="email" value={profile.email} disabled class="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800/50 px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
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
						class="space-y-6 max-w-2xl"
					>
						<div>
							<label for="oldPassword" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Password Lama</label>
							<input type="password" id="oldPassword" name="oldPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
						</div>

						<div>
							<label for="newPassword" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
							<input type="password" id="newPassword" name="newPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
						</div>

						<div>
							<label for="confirmPassword" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</label>
							<input type="password" id="confirmPassword" name="confirmPassword" required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
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
			</div>
		{/if}
	</div>
</div>

<!-- Form for uploading image (Hidden) -->
<form
	bind:this={uploadFormElement}
	method="POST"
	action={targetType === 'profile' ? '?/uploadProfilePicture' : '?/uploadCoverPhoto'}
	use:enhance={({ formData, cancel }) => {
		if (!croppedBlob) {
			cancel();
			return;
		}
		formData.set('file', croppedBlob, 'cropped.png');
		
		return async ({ update }) => {
			await update();
			isUploading = false;
			cropperModalOpen = false;
			croppedBlob = null;
			if (imageToCrop) URL.revokeObjectURL(imageToCrop);
			imageToCrop = null;
		};
	}}
	class="hidden"
></form>

<!-- Cropper Modal -->
{#if cropperModalOpen && imageToCrop}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
	<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
		<div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
			<h3 class="text-xl font-bold text-slate-900 dark:text-white">Sesuaikan Foto {targetType === 'profile' ? 'Profil' : 'Sampul'}</h3>
			<button onclick={cancelCrop} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" disabled={isUploading}>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		
		<div class="p-4 flex-1 bg-slate-100 dark:bg-slate-900 min-h-[300px] relative">
			<!-- Cropper container -->
			<div class="absolute inset-4">
				<img bind:this={imageElement} src={imageToCrop} alt="Crop target" class="max-w-full block" />
			</div>
		</div>
		
		<div class="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
			<button 
				type="button"
				onclick={cancelCrop}
				disabled={isUploading}
				class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
			>
				Batal
			</button>
			<button 
				type="button"
				onclick={saveCrop}
				disabled={isUploading}
				class="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if isUploading}
					<svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Menyimpan...
				{:else}
					Simpan Foto
				{/if}
			</button>
		</div>
	</div>
</div>
{/if}
