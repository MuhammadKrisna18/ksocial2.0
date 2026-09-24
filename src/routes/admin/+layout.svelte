<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let { data, children } = $props();

	let isSidebarOpen = $state(false);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	const menuItems = [
		{ name: 'Dashboard', path: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ name: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
		{ name: 'Posts', path: '/admin/posts', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3L22 4' },
		{ name: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
	];
</script>

<div class="flex h-screen bg-slate-50 overflow-hidden font-sans">
	
	<!-- Mobile sidebar backdrop -->
	{#if isSidebarOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity" onclick={toggleSidebar}></div>
	{/if}

	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200/60 bg-white/80 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
	>
		<div class="flex h-full flex-col">
			<!-- Logo Area -->
			<div class="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
				<span class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">K-Social Admin</span>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
				{#each menuItems as item}
					<a
						href={item.path}
						class="group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all
						{$page.url.pathname === item.path 
							? 'bg-primary-50 text-primary-700 shadow-sm' 
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
					>
						<svg
							class="mr-3 h-5 w-5 flex-shrink-0 transition-colors {$page.url.pathname === item.path ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
							{#if item.name === 'Settings'}
								<circle cx="12" cy="12" r="3" />
							{/if}
						</svg>
						{item.name}
					</a>
				{/each}
			</nav>

			<!-- User Profile Footer -->
			<div class="border-t border-slate-100 p-4">
				<div class="flex items-center gap-3">
					<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
						{data.user?.email?.[0].toUpperCase() ?? 'A'}
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-bold text-slate-800">{data.user?.email}</p>
						<p class="truncate text-xs font-medium text-slate-500">Administrator</p>
					</div>
				</div>
				<form method="POST" action="/admin?/logout" class="mt-4" use:enhance={() => {
					return async () => {
						window.location.href = '/login';
					};
				}}>
					<button class="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-red-600">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Logout
					</button>
				</form>
			</div>
		</div>
	</aside>

	<!-- Main Content Area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Top Header -->
		<header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 backdrop-blur-md sm:px-6 lg:px-8">
			<button class="text-slate-500 hover:text-slate-700 lg:hidden" onclick={toggleSidebar}>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			
			<div class="flex flex-1 justify-end">
				<!-- Dummy Notifications / Search icons could go here -->
				<button class="p-2 text-slate-400 hover:text-slate-600 transition">
					<span class="sr-only">View notifications</span>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
				</button>
			</div>
		</header>

		<!-- Main Content (Scrollable) -->
		<main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
			<!-- Animated background blobs for the main area to keep the premium feel -->
			<div class="absolute right-0 top-0 -z-10 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary-100/40 blur-[80px]"></div>
			
			<div class="mx-auto max-w-7xl">
				{@render children()}
			</div>
		</main>
	</div>
</div>
