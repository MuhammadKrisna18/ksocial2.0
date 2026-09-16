<script lang="ts">
	import { page } from '$app/stores';

	let { data, children } = $props();

	let isSidebarOpen = $state(false);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	let isNotifOpen = $state(false);
	function toggleNotif() {
		isNotifOpen = !isNotifOpen;
	}

	import { enhance } from '$app/forms';

	const menuItems = [
		{ name: 'Feed', path: '/user', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
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
						class="group flex items-center rounded-2xl px-4 py-3 text-sm font-bold transition-all
						{$page.url.pathname === item.path 
							? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 dark:shadow-blue-900/30' 
							: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
					>
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
						{item.name}
					</a>
				{/each}
			</nav>

			<!-- User Profile Footer -->
			<div class="border-t border-slate-100 dark:border-slate-800 p-4">
				<div class="flex items-center gap-3">
					<div class="h-12 w-12 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
						U
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-bold text-slate-800 dark:text-slate-200">John Doe</p>
						<p class="truncate text-xs font-medium text-slate-500 dark:text-slate-400">@johndoe</p>
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
				<button class="rounded-full p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition">
					<span class="sr-only">Search</span>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</button>
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
</div>
