<script lang="ts">
	let { data } = $props();

	let profile = $derived(data.profile);
	let posts = $derived(data.posts || []);
	let isCurrentUser = $derived(data.isCurrentUser);

	// Determine if we should show the feed
	let followStatus = $derived(data.followStatus || 'none');
	let canViewFeed = $derived(!profile.isPrivate || isCurrentUser || followStatus === 'following' || followStatus === 'friends');
	
	import { enhance } from '$app/forms';
	import PostCard from '$lib/features/post/components/PostCard.svelte';
	let isFollowingState = $state(false);

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
</script>

<svelte:head>
	<title>{profile.fullName || profile.username} (@{profile.username}) — K-Social</title>
</svelte:head>

<div class="min-h-full pb-16">
	<!-- Full Width Cover Area -->
	<div class="relative w-full h-64 md:h-80 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
		{#if profile.coverPhotoUrl}
			<img src={profile.coverPhotoUrl} alt="Cover" class="absolute inset-0 w-full h-full object-cover" />
		{/if}
		<div class="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
	</div>

	<!-- Profile Section -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
		<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 sm:p-10 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
			
			<!-- Circular Profile Picture -->
			<div class="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-white font-black text-5xl shrink-0 overflow-hidden">
				{#if profile.profilePictureUrl}
					<img src={profile.profilePictureUrl} alt="Profile" class="w-full h-full object-cover" />
				{:else}
					{profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.toString().charAt(0).toUpperCase()}
				{/if}
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
						Edit Profile
					</a>
				{:else}
					<form method="POST" action="?/follow" use:enhance={() => {
						isFollowingState = true;
						return async ({ update, result }) => {
							isFollowingState = false;
							await update();
						};
					}} class="w-full sm:w-auto">
						<button 
							type="submit" 
							disabled={(followStatus !== 'none' && followStatus !== 'follows_you') || isFollowingState}
							class="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 rounded-xl {(followStatus === 'none' || followStatus === 'follows_you') ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 active:scale-95 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'} font-bold transition-all"
						>
							{#if isFollowingState}
								<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
								Processing...
							{:else if followStatus === 'pending'}
								Requested
							{:else if followStatus === 'following'}
								Following
							{:else if followStatus === 'friends'}
								Friends
							{:else if followStatus === 'follows_you'}
								Follow Back
							{:else}
								Follow
							{/if}
						</button>
					</form>
				{/if}
			</div>
		</div>

		<!-- Grid Layout for Content -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Left Column (Stats & Details) -->
			<div class="lg:col-span-1 space-y-6">
				<!-- Stats Card -->
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

				<!-- Personal Details Card -->
				<div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
					<h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Personal details</h2>

					<div class="space-y-6">
						<!-- Location -->
						<div class="flex items-center gap-5 text-slate-700 dark:text-slate-300">
							<div class="text-slate-900 dark:text-white shrink-0">
								<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<span class="font-medium text-sm sm:text-base">{profile.location ? `Lives in ${profile.location}` : 'No location specified'}</span>
						</div>

						<!-- Birthday -->
						<div class="flex items-center gap-5 text-slate-700 dark:text-slate-300">
							<div class="text-slate-900 dark:text-white shrink-0">
								<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
								</svg>
							</div>
							<span class="font-medium text-sm sm:text-base">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No birthday specified'}</span>
						</div>

						<!-- Relationship Status -->
						<div class="flex items-center gap-5 text-slate-700 dark:text-slate-300">
							<div class="text-slate-900 dark:text-white shrink-0 relative">
								<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
								</svg>
								<svg class="w-4 h-4 absolute -bottom-1 -left-1 text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
								</svg>
							</div>
							<span class="font-medium text-sm sm:text-base ml-1">{profile.relationshipStatus || 'No relationship status'}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column (Main Feed) -->
			<div class="lg:col-span-2">
				{#if !canViewFeed}
				<!-- Private Profile State -->
				<div class="bg-white dark:bg-slate-800 rounded-3xl p-12 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
					<div class="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6">
						<svg class="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
					</div>
					<h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">This Account is Private</h3>
					<p class="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">Follow this account to see their photos and activity.</p>
				</div>
			{:else}
				<!-- Feed Posts -->
				<h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
					<svg class="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.5-4.5A2 2 0 0012.586 3H12" />
					</svg>
					Recent Activity
				</h2>

				{#if posts.length > 0}
					<div class="space-y-6">
						{#each posts as post}
							<PostCard {post} currentUser={data.user} />
						{/each}
					</div>
				{:else}
					<div class="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center">
						<p class="text-slate-500 dark:text-slate-400 font-medium">No activity yet.</p>
					</div>
				{/if}
			{/if}
			</div>
		</div>
	</div>
</div>

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
