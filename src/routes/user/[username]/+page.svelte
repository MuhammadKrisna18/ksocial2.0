<script lang="ts">
	import { enhance } from '$app/forms';
	import PostCard from '$lib/features/post/components/PostCard.svelte';

	let { data, form } = $props();
	
	const targetProfile = $derived(data.targetProfile);
	let followStatus = $state(data.followStatus);
	let isActionLoading = $state(false);

</script>

<svelte:head>
	<title>{targetProfile.fullName} (@{targetProfile.username}) — K-Social</title>
</svelte:head>

<div class="min-h-full">
	<div class="relative w-full group">
		<!-- Cover Photo (Edge to edge) -->
		{#if targetProfile.coverPhotoUrl}
			<img src={targetProfile.coverPhotoUrl} alt="Cover" class="h-64 w-full object-cover" />
		{:else}
			<div class="h-64 w-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600"></div>
		{/if}

		<!-- Avatar (Positioned in the middle) -->
		<div class="absolute top-44 left-1/2 -translate-x-1/2 z-20">
			<div class="relative h-40 w-40 rounded-full border-8 border-slate-50 dark:border-slate-900 bg-slate-100 shadow-lg overflow-hidden">
				<img 
					src={targetProfile.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetProfile.username || 'user'}`} 
					alt="Profile Avatar" 
					class="w-full h-full object-cover" 
					onerror={(e) => {
						const target = e.currentTarget as HTMLImageElement;
						target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetProfile.username || 'user'}`;
					}}
				/>
			</div>
		</div>
		
		<!-- Profile Info Text -->
		<div class="pt-24 pb-4 px-6 text-center">
			<h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{targetProfile.fullName}</h1>
			<p class="mt-2 text-slate-500 dark:text-slate-400 font-medium text-xl">@{targetProfile.username}</p>
		</div>

		<!-- Follow Actions -->
		<div class="flex justify-center pb-8 gap-3">
			{#if followStatus === 'none'}
				<form method="POST" action="?/follow" use:enhance={() => {
					isActionLoading = true;
					return async ({ update, result }) => {
						await update({ reset: false });
						if (result.type === 'success') {
							followStatus = targetProfile.isPrivate ? 'pending' : 'following';
						}
						isActionLoading = false;
					};
				}}>
					<button type="submit" disabled={isActionLoading} class="px-6 py-2.5 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50">
						Follow
					</button>
				</form>
			{:else if followStatus === 'pending'}
				<form method="POST" action="?/unfollow" use:enhance={() => {
					isActionLoading = true;
					return async ({ update, result }) => {
						await update({ reset: false });
						if (result.type === 'success') followStatus = 'none';
						isActionLoading = false;
					};
				}}>
					<button type="submit" disabled={isActionLoading} class="px-6 py-2.5 rounded-full font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
						Requested
					</button>
				</form>
			{:else if followStatus === 'following' || followStatus === 'friends'}
				<form method="POST" action="?/unfollow" use:enhance={() => {
					isActionLoading = true;
					return async ({ update, result }) => {
						await update({ reset: false });
						if (result.type === 'success') followStatus = 'none';
						isActionLoading = false;
					};
				}}>
					<button type="submit" disabled={isActionLoading} class="px-6 py-2.5 rounded-full font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
						{followStatus === 'friends' ? 'Friends' : 'Following'}
					</button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="max-w-4xl mx-auto px-6 lg:px-8 pb-16 pt-8">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Sidebar: Personal Details -->
			<div class="md:col-span-1">
				<div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-5">
					<h2 class="text-xl font-bold text-slate-900 dark:text-white">Personal details</h2>

					<div class="space-y-5 mt-2">
						{#if targetProfile.location}
							<div class="flex items-center gap-4 text-slate-700 dark:text-slate-300">
								<div class="text-slate-900 dark:text-white shrink-0">
									<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<span class="font-medium text-sm">Lives in {targetProfile.location}</span>
							</div>
						{/if}
						
						{#if targetProfile.relationshipStatus}
							<div class="flex items-center gap-4 text-slate-700 dark:text-slate-300">
								<div class="text-slate-900 dark:text-white shrink-0 relative">
									<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
									</svg>
								</div>
								<span class="font-medium text-sm ml-1">{targetProfile.relationshipStatus}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Main Content: Posts -->
			<div class="md:col-span-2">
				{#if !data.canViewPosts}
					<div class="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center">
						<svg class="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<h3 class="text-xl font-bold text-slate-900 dark:text-white">This account is private</h3>
						<p class="mt-2 text-slate-500">Follow to see their posts.</p>
					</div>
				{:else}
					<div class="space-y-6">
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Posts</h2>
						{#if data.posts.length === 0}
							<div class="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
								<p class="text-slate-500 dark:text-slate-400 text-lg">No posts yet.</p>
							</div>
						{:else}
							{#each data.posts as post}
								<PostCard {post} currentUser={data.user} />
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
