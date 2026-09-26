<script lang="ts">
	import { enhance } from '$app/forms';
	import Cropper from 'cropperjs';
	import 'cropperjs/dist/cropper.css';
	import PostCard from '$lib/features/post/components/PostCard.svelte';
	import CreatePostModal from '$lib/features/post/components/CreatePostModal.svelte';

	let { data, form } = $props();
	
	let profileLoading = $state(false);
	let isEditProfileModalOpen = $state(false);

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
	
	// --- Follows Modal State ---
	let showFollowersModal = $state(false);
	let showFollowingModal = $state(false);
	let followersList = $state<{id: string, username: string, fullName: string, profilePictureUrl: string | null}[]>([]);
	let followingList = $state<{id: string, username: string, fullName: string, profilePictureUrl: string | null}[]>([]);
	let isLoadingFollowers = $state(false);
	let isLoadingFollowing = $state(false);

	async function fetchFollowers() {
		showFollowersModal = true;
		isLoadingFollowers = true;
		try {
			const res = await fetch(`/api/users/${profile.id}/followers`);
			if (res.ok) {
				const resData = await res.json();
				followersList = resData.followers;
			}
		} catch (error) {
			console.error("Failed to fetch followers", error);
		} finally {
			isLoadingFollowers = false;
		}
	}

	async function fetchFollowing() {
		showFollowingModal = true;
		isLoadingFollowing = true;
		try {
			const res = await fetch(`/api/users/${profile.id}/following`);
			if (res.ok) {
				const resData = await res.json();
				followingList = resData.following;
			}
		} catch (error) {
			console.error("Failed to fetch following", error);
		} finally {
			isLoadingFollowing = false;
		}
	}
	
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
		if (!confirm('Are you sure you want to delete this photo?')) return;
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
				Change Cover
			</label>
			{#if profile?.coverPhotoUrl}
				<button type="button" onclick={() => deletePhoto('cover')} class="cursor-pointer bg-red-500/80 hover:bg-red-500 backdrop-blur text-white px-4 py-2 rounded-full font-medium transition-colors">
					Delete
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
						Change
					</label>
					{#if profile?.profilePictureUrl}
						<button type="button" onclick={() => deletePhoto('profile')} class="cursor-pointer text-red-200 text-sm font-bold hover:underline">
							Delete
						</button>
					{/if}
				</div>
			</div>
		</div>
		
		<!-- Profile Info Text -->
		<div class="pt-24 pb-8 px-6 text-center">
			<h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{profile?.fullName || 'Your Profile'}</h1>
			<p class="mt-2 text-slate-500 dark:text-slate-400 font-medium text-xl">@{profile?.username || 'username'}</p>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-8">
		{#if !profile}
			<div class="rounded-xl bg-red-50 p-4 border border-red-200 text-red-600 font-medium shadow-sm">
				Profile data not found. Please log in again.
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				
				<!-- Left Column (Sidebar) -->
				<div class="lg:col-span-1 space-y-6">
					
					<!-- Stats Card -->
					<div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-around text-center">
						<button class="flex flex-col items-center hover:opacity-80 focus:outline-none" onclick={fetchFollowers}>
							<span class="text-2xl font-black text-slate-900 dark:text-white">{profile.followersCount || 0}</span>
							<span class="text-sm font-medium text-slate-500">Followers</span>
						</button>
						<div class="w-px bg-slate-200 dark:bg-slate-800 my-2"></div>
						<button class="flex flex-col items-center hover:opacity-80 focus:outline-none" onclick={fetchFollowing}>
							<span class="text-2xl font-black text-slate-900 dark:text-white">{profile.followingCount || 0}</span>
							<span class="text-sm font-medium text-slate-500">Following</span>
						</button>
					</div>

					<!-- Personal Details Card (Read-only) -->
					<section>
					<div class="relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
						<div class="flex items-center justify-between mb-2">
							<h2 class="text-xl font-bold text-slate-900 dark:text-white">Personal details</h2>
							<button onclick={() => isEditProfileModalOpen = true} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
								<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
								</svg>
							</button>
						</div>

						<!-- Form result feedback (if any) -->
						{#if form?.successProfile === false}
							<div class="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border-l-4 border-red-500">
								{form.message}
							</div>
						{/if}
						{#if form?.successProfile === true}
							<div class="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600 border-l-4 border-green-500">
								{form.message}
							</div>
						{/if}

						<div class="space-y-6">
							<!-- Location -->
							<div class="flex items-center gap-5 text-slate-700 dark:text-slate-300">
								<div class="text-slate-900 dark:text-white shrink-0">
									<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<span class="font-medium text-sm sm:text-base">{profile.location ? `Lives in ${profile.location}` : 'Add location'}</span>
							</div>

							<!-- Birthday -->
							<div class="flex items-center gap-5 text-slate-700 dark:text-slate-300">
								<div class="text-slate-900 dark:text-white shrink-0">
									<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
									</svg>
								</div>
								<span class="font-medium text-sm sm:text-base">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Add birthday'}</span>
							</div>

							<!-- Relationship Status -->
							<div class="flex items-center gap-5 text-slate-700 dark:text-slate-300">
								<div class="text-slate-900 dark:text-white shrink-0 relative">
									<!-- Hearts Icon to match reference (two overlapping hearts) -->
									<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
									</svg>
									<!-- Small heart on bottom left -->
									<svg class="w-4 h-4 absolute -bottom-1 -left-1 text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
									</svg>
								</div>
								<span class="font-medium text-sm sm:text-base ml-1">{profile.relationshipStatus || 'Add relationship status'}</span>
							</div>
						</div>
					</div>
					</section>
				</div>

				<!-- Right Column (Posts) -->
				<div class="lg:col-span-2 space-y-6">
					<!-- Posts Section -->
					<section>
					<div class="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
							<svg class="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							Your Posts
						</h2>
						<p class="mt-2 text-slate-500 dark:text-slate-400">Manage all posts you have created.</p>
					</div>

					<!-- Create Post -->
					<div class="mb-6">
						<CreatePostModal currentUser={data.user} {form} />
					</div>

					<div class="space-y-6">
						{#if data.posts.length === 0}
							<div class="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
								<p class="text-slate-500 dark:text-slate-400 text-lg">No posts yet. Start sharing your moments!</p>
							</div>
						{:else}
							{#each data.posts as post}
								<PostCard {post} currentUser={data.user} />
							{/each}
						{/if}
					</div>
				</section>
			</div>
		</div>
		{/if}
	</div>
</div>

<!-- Edit Profile Modal -->
{#if isEditProfileModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0" onclick={() => isEditProfileModalOpen = false}></div>
		<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 animate-in zoom-in-95 duration-200">
			<div class="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
				<h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit Personal Details</h3>
				<button onclick={() => isEditProfileModalOpen = false} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="p-6 overflow-y-auto">
				<form 
					method="POST" 
					action="?/updateProfile" 
					use:enhance={() => {
						profileLoading = true;
						return async ({ update }) => {
							await update();
							profileLoading = false;
							isEditProfileModalOpen = false;
						};
					}}
					class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
				>
					<div class="md:col-span-2">
						<label for="fullName" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
						<input type="text" id="fullName" name="fullName" value={profile.fullName} required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
					</div>

					<div>
						<label for="username" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Username</label>
						<input type="text" id="username" name="username" value={profile.username} required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
					</div>

					<div>
						<label for="dateOfBirth" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
						<input type="date" id="dateOfBirth" name="dateOfBirth" value={profile.dateOfBirth} required class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
					</div>

					<div class="md:col-span-2">
						<label for="location" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Location (City, Country)</label>
						<input type="text" id="location" name="location" value={profile.location || ''} placeholder="e.g. New York, USA" class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
					</div>

					<div class="md:col-span-2">
						<label for="relationshipStatus" class="block text-sm font-bold text-slate-700 dark:text-slate-300">Relationship Status</label>
						<select id="relationshipStatus" name="relationshipStatus" class="mt-1.5 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
							<option value="">Select status</option>
							<option value="Single" selected={profile.relationshipStatus === 'Single'}>Single</option>
							<option value="In a relationship" selected={profile.relationshipStatus === 'In a relationship'}>In a relationship</option>
							<option value="Engaged" selected={profile.relationshipStatus === 'Engaged'}>Engaged</option>
							<option value="Married" selected={profile.relationshipStatus === 'Married'}>Married</option>
							<option value="It's complicated" selected={profile.relationshipStatus === "It's complicated"}>It's complicated</option>
						</select>
					</div>

					<div class="md:col-span-2">
						<label class="flex items-center gap-3 cursor-pointer mt-2">
							<input type="checkbox" name="isPrivate" class="w-5 h-5 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-blue-600 focus:ring-blue-500" checked={profile.isPrivate} />
							<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Private Account</span>
						</label>
						<p class="text-xs text-slate-500 mt-1 ml-8">When your account is private, only people you approve can see your posts.</p>
					</div>

					<div class="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
						<button type="button" onclick={() => isEditProfileModalOpen = false} class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
							Cancel
						</button>
						<button type="submit" disabled={profileLoading} class="px-5 flex justify-center py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
							{#if profileLoading}
								<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Saving...
							{:else}
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

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
			<h3 class="text-xl font-bold text-slate-900 dark:text-white">Adjust {targetType === 'profile' ? 'Profile Picture' : 'Cover Photo'}</h3>
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
				Cancel
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
					Saving...
				{:else}
					Save Photo
				{/if}
			</button>
		</div>
	</div>
</div>
{/if}

<!-- Followers Modal -->
{#if showFollowersModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0" onclick={() => showFollowersModal = false}></div>
		<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] relative z-10">
			<div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
				<h3 class="text-xl font-bold text-slate-900 dark:text-white">Followers</h3>
				<button onclick={() => showFollowersModal = false} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="p-4 overflow-y-auto flex-1">
				{#if isLoadingFollowers}
					<div class="flex justify-center p-8">
						<svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>
				{:else if followersList.length === 0}
					<div class="text-center p-8 text-slate-500 dark:text-slate-400">
						No followers yet.
					</div>
				{:else}
					<div class="flex flex-col gap-4">
						{#each followersList as follower}
							<div class="flex items-center gap-3">
								<a href={`/user/profile/${follower.username}`} class="shrink-0" onclick={() => showFollowersModal = false}>
									{#if follower.profilePictureUrl}
										<img src={follower.profilePictureUrl} alt={follower.fullName} class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
									{:else}
										<div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
											{follower.fullName.charAt(0).toUpperCase()}
										</div>
									{/if}
								</a>
								<div class="flex flex-col">
									<a href={`/user/profile/${follower.username}`} class="font-bold text-slate-900 dark:text-white hover:underline text-sm" onclick={() => showFollowersModal = false}>
										{follower.fullName}
									</a>
									<span class="text-xs text-slate-500 dark:text-slate-400">@{follower.username}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Following Modal -->
{#if showFollowingModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0" onclick={() => showFollowingModal = false}></div>
		<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] relative z-10">
			<div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
				<h3 class="text-xl font-bold text-slate-900 dark:text-white">Following</h3>
				<button onclick={() => showFollowingModal = false} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="p-4 overflow-y-auto flex-1">
				{#if isLoadingFollowing}
					<div class="flex justify-center p-8">
						<svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>
				{:else if followingList.length === 0}
					<div class="text-center p-8 text-slate-500 dark:text-slate-400">
						Not following anyone yet.
					</div>
				{:else}
					<div class="flex flex-col gap-4">
						{#each followingList as following}
							<div class="flex items-center gap-3">
								<a href={`/user/profile/${following.username}`} class="shrink-0" onclick={() => showFollowingModal = false}>
									{#if following.profilePictureUrl}
										<img src={following.profilePictureUrl} alt={following.fullName} class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
									{:else}
										<div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
											{following.fullName.charAt(0).toUpperCase()}
										</div>
									{/if}
								</a>
								<div class="flex flex-col">
									<a href={`/user/profile/${following.username}`} class="font-bold text-slate-900 dark:text-white hover:underline text-sm" onclick={() => showFollowingModal = false}>
										{following.fullName}
									</a>
									<span class="text-xs text-slate-500 dark:text-slate-400">@{following.username}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
