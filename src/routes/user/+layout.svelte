<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { chatState } from '$lib/presentation/stores/chatState.svelte';

	let { data, children } = $props();

	let isSidebarOpen = $state(false);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	let isNotifOpen = $state(false);
	function toggleNotif() {
		isNotifOpen = !isNotifOpen;
	}

	// Initialize unread count from server
	$effect(() => {
		if (typeof data.unreadMessagesCount === 'number') {
			chatState.init(data.unreadMessagesCount);
		}
	});

	let eventSource: EventSource | null = null;
	onMount(() => {
		eventSource = new EventSource('/api/chat/stream');
		eventSource.addEventListener('message', (event) => {
			try {
				const message = JSON.parse(event.data);
				chatState.handleIncomingMessage(message, data.user?.sub ?? '');
			} catch (e) {
				console.error('Invalid SSE chat event', e);
			}
		});
		eventSource.onerror = () => {
			// Browser automatically attempts reconnect on error
		};
	});

	onDestroy(() => {
		eventSource?.close();
	});

	// --- Search State ---
	let searchQuery = $state('');
	let searchResults = $state<any[]>([]);
	let showSearchDropdown = $state(false);

	async function handleSearch() {
		if (searchQuery.trim().length === 0) {
			searchResults = [];
			showSearchDropdown = false;
			return;
		}

		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
			if (res.ok) {
				searchResults = await res.json();
				showSearchDropdown = searchResults.length > 0;
			}
		} catch (error) {
			console.error("Search failed", error);
		}
	}

	const menuItems = [
		{ name: 'Feed', path: '/user', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ name: 'Messages', path: '/user/messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
		{ name: 'Friends', path: '/user/friends', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
		{ name: 'Saved', path: '/user/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
		{ name: 'Profile', path: '/user/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
		{ name: 'Settings', path: '/user/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
	];
</script>

<div class="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
	
	<!-- Mobile sidebar backdrop -->
	{#if isSidebarOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity" onclick={toggleSidebar}></div>
	{/if}

	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
	>
		<div class="flex h-full flex-col">
			<!-- Logo Area -->
			<div class="flex h-16 shrink-0 items-center px-6 border-b border-slate-100 dark:border-slate-800">
				<span class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">K-Social</span>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
				{#each menuItems as item}
					<a
						href={item.path}
						class="group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all
						{$page.url.pathname === item.path 
							? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 dark:shadow-blue-900/30' 
							: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
					>
						<div class="flex items-center min-w-0">
							<svg
								class="mr-4 h-5 w-5 flex-shrink-0 transition-transform {$page.url.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
							</svg>
							<span class="truncate">{item.name}</span>
						</div>
						{#if item.name === 'Messages' && chatState.totalUnread > 0}
							<span class="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-extrabold text-white shadow-sm shadow-red-500/30 animate-pulse">
								{chatState.totalUnread > 99 ? '99+' : chatState.totalUnread}
							</span>
						{/if}
					</a>
				{/each}
			</nav>


			<!-- User Profile Footer -->
			<div class="border-t border-slate-100 dark:border-slate-800 p-4">
				<div class="flex items-center gap-3">
					{#if data.currentUser?.profilePictureUrl}
						<img src={data.currentUser.profilePictureUrl} alt="Profile" class="h-12 w-12 shrink-0 rounded-full object-cover shadow-md shadow-slate-500/20" />
					{:else}
						<div class="h-12 w-12 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
							{data.currentUser?.fullName ? data.currentUser.fullName.charAt(0).toUpperCase() : 'U'}
						</div>
					{/if}
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{data.currentUser?.fullName || data.user?.email || 'User'}</p>
						<p class="truncate text-xs font-medium text-slate-500 dark:text-slate-400">@{data.currentUser?.username || 'user'}</p>
					</div>
				</div>
				<form method="POST" action="/login?/logout" class="mt-4">
					<button class="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Sign out
					</button>
				</form>
			</div>
		</div>
	</aside>

	<!-- Main Content Area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Top Header -->
		<header class="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 px-4 backdrop-blur-md sm:px-6 lg:px-8">
			<button class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden" onclick={toggleSidebar}>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			
			<div class="flex flex-1 items-center justify-end gap-4">
				<div class="relative z-50">
					<!-- Search Button for Mobile (Toggles Input) -->
					<div class="flex items-center">
						<div class="relative hidden sm:block">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<input
								type="text"
								placeholder="Cari pengguna..."
								bind:value={searchQuery}
								oninput={handleSearch}
								class="block w-full sm:w-64 pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-full leading-5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
							/>
						</div>
					</div>

					<!-- Search Dropdown -->
					{#if showSearchDropdown && searchResults.length > 0}
						<div class="absolute right-0 mt-2 w-full sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50">
							<div class="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
								{#each searchResults as user}
									<a href="/user/profile/{user.username}" class="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors" onclick={() => {showSearchDropdown = false; searchQuery = '';}}>
										<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
											{user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
										</div>
										<div class="min-w-0 flex-1">
											<p class="text-sm font-bold text-slate-900 dark:text-white truncate">{user.fullName}</p>
											<p class="text-xs text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
										</div>
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>
				<div class="relative">
					<button onclick={toggleNotif} class="relative rounded-full p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition focus:outline-none">
						<span class="sr-only">View notifications</span>
						{#if data.notifications && data.notifications.length > 0}
							<div class="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 animate-pulse"></div>
						{/if}
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
					</button>

					<!-- Notifications Dropdown -->
					{#if isNotifOpen}
						<div class="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
							<div class="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
								<h3 class="font-bold text-slate-900 dark:text-white">Notifications</h3>
								<button onclick={toggleNotif} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
									<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							
							<div class="max-h-[400px] overflow-y-auto">
								{#if !data.notifications || data.notifications.length === 0}
									<div class="p-6 text-center text-slate-500 dark:text-slate-400">
										<p>Tidak ada notifikasi baru.</p>
									</div>
								{:else}
									<div class="divide-y divide-slate-100 dark:divide-slate-700/50">
										{#each data.notifications as notif}
											{#if notif.type === 'follow_request'}
												<div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
													<div class="flex gap-3">
														<div class="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full h-fit text-blue-600 dark:text-blue-400">
															<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
															</svg>
														</div>
														<div class="flex-1 min-w-0">
															<p class="text-sm text-slate-800 dark:text-slate-200">
																<a href="/user/profile/{notif.senderUsername}" class="font-bold hover:underline">{notif.senderName}</a>
																ingin mengikuti Anda.
															</p>
															<p class="text-xs text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
															
															<div class="flex items-center gap-2 mt-3">
																<form method="POST" action="/user/notifications?/acceptFollow" use:enhance>
																	<input type="hidden" name="followerId" value={notif.senderId} />
																	<input type="hidden" name="notificationId" value={notif.id} />
																	<button class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">Terima</button>
																</form>
																<form method="POST" action="/user/notifications?/rejectFollow" use:enhance>
																	<input type="hidden" name="followerId" value={notif.senderId} />
																	<input type="hidden" name="notificationId" value={notif.id} />
																	<button class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors">Tolak</button>
																</form>
															</div>
														</div>
													</div>
												</div>
											{:else if notif.type === 'like' || notif.type === 'comment'}
												<a href="/user" class="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
													<div class="flex gap-3">
														<div class="mt-1 {notif.type === 'like' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'} p-2 rounded-full h-fit">
															{#if notif.type === 'like'}
																<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
																	<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
																</svg>
															{:else}
																<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
																</svg>
															{/if}
														</div>
														<div class="flex-1 min-w-0">
															<p class="text-sm text-slate-800 dark:text-slate-200">
																<span class="font-bold">{notif.senderName}</span>
																{notif.type === 'like' ? 'menyukai postingan Anda.' : 'mengomentari postingan Anda.'}
															</p>
															<p class="text-xs text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
														</div>
													</div>
												</a>
											{:else if notif.type === 'post_deleted_by_admin'}
												<div class="p-4 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
													<div class="flex gap-3">
														<div class="mt-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 p-2 rounded-full h-fit shrink-0">
															<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
															</svg>
														</div>
														<div class="flex-1 min-w-0">
															<div class="flex items-center justify-between gap-2">
																<p class="text-sm font-bold text-red-700 dark:text-red-400">
																	Postingan Dihapus oleh Admin
																</p>
																<form method="POST" action="/user/notifications?/dismiss" use:enhance>
																	<input type="hidden" name="notificationId" value={notif.id} />
																	<button
																		type="submit"
																		class="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
																		title="Tutup pemberitahuan"
																	>
																		<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
																		</svg>
																	</button>
																</form>
															</div>
															<p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
																Salah satu postingan Anda telah dihapus oleh administrator karena melanggar panduan komunitas atau kebijakan platform.
															</p>
															<p class="text-[11px] text-slate-400 mt-1.5">{new Date(notif.createdAt).toLocaleString()}</p>
														</div>
													</div>
												</div>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						</div>
						<!-- Background backdrop for mobile -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="fixed inset-0 z-40 sm:hidden" onclick={toggleNotif}></div>
					{/if}
				</div>
			</div>
		</header>

		<!-- Main Content (Scrollable) -->
		<main class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
			<!-- Abstract Background Element -->
			<div class="fixed right-0 top-0 -z-10 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-blue-400/20 blur-[100px]"></div>
			<div class="fixed left-0 bottom-0 -z-10 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/4 rounded-full bg-purple-400/20 blur-[100px]"></div>
			
			{@render children()}
		</main>
	</div>

	<!-- Floating Toast Notification for Incoming Messages -->
	{#if chatState.activeToast}
		<div
			class="fixed top-5 right-5 z-[100] max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
		>
			<div class="flex items-start gap-3 rounded-2xl border border-blue-500/30 bg-white/95 dark:bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
				<!-- Avatar / Icon -->
				<div class="relative shrink-0">
					{#if chatState.activeToast.senderAvatar}
						<img
							src={chatState.activeToast.senderAvatar}
							alt={chatState.activeToast.senderName}
							class="h-11 w-11 rounded-full object-cover ring-2 ring-blue-500/30"
						/>
					{:else}
						<div class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-md shadow-blue-500/20">
							{chatState.activeToast.senderName ? chatState.activeToast.senderName.charAt(0).toUpperCase() : 'U'}
						</div>
					{/if}
					<div class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] text-white ring-2 ring-white dark:ring-slate-900">
						💬
					</div>
				</div>

				<!-- Content -->
				<div class="min-w-0 flex-1">
					<div class="flex items-center justify-between gap-1">
						<p class="truncate text-xs font-bold text-slate-900 dark:text-white">
							{chatState.activeToast.senderName}
						</p>
						<span class="rounded bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
							Pesan Baru
						</span>
					</div>
					<p class="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
						{chatState.activeToast.content}
					</p>
					<div class="mt-2.5 flex items-center gap-2">
						<a
							href={`/user/messages?contact=${encodeURIComponent(chatState.activeToast.senderId)}`}
							onclick={() => chatState.dismissToast()}
							class="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
						>
							<span>Buka Obrolan</span>
							<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</a>
						<button
							type="button"
							onclick={() => chatState.dismissToast()}
							class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
						>
							Tutup
						</button>
					</div>
				</div>

				<!-- Close Button -->
				<button
					type="button"
					onclick={() => chatState.dismissToast()}
					class="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
					aria-label="Tutup notifikasi"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>

