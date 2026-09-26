<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatTimeAgo(dateString: Date | string) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return 'Just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
		return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	const stats = $derived([
		{
			title: 'Total Users',
			value: data.dashboardStats.totalUsers.toLocaleString(),
			subtext: 'Registered accounts',
			iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
			icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
		},
		{
			title: 'Total Posts',
			value: data.dashboardStats.totalPosts.toLocaleString(),
			subtext: 'Active feed content',
			iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
			icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3L22 4'
		},
		{
			title: 'Total Comments',
			value: data.dashboardStats.totalComments.toLocaleString(),
			subtext: 'Community discussions',
			iconBg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
			icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
		},
		{
			title: 'Total Messages',
			value: data.dashboardStats.totalMessages.toLocaleString(),
			subtext: 'Chat messages sent',
			iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
			icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
		}
	]);

	function getBadgeStyle(type: 'user' | 'post' | 'comment') {
		switch (type) {
			case 'user':
				return 'bg-blue-100 text-blue-700 ring-blue-500/20';
			case 'post':
				return 'bg-emerald-100 text-emerald-700 ring-emerald-500/20';
			case 'comment':
				return 'bg-purple-100 text-purple-700 ring-purple-500/20';
			default:
				return 'bg-slate-100 text-slate-700 ring-slate-500/20';
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard — K-Social</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h1>
	<p class="mt-2 text-sm text-slate-500">Overview of platform activities and real-time K-Social data metrics.</p>
</div>

<!-- Stats Grid -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
	{#each stats as stat}
		<div class="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-md">
			<div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 opacity-50 transition-transform group-hover:scale-150"></div>
			<div class="relative flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-slate-500">{stat.title}</p>
					<p class="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-xl {stat.iconBg} transition-colors">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon} />
					</svg>
				</div>
			</div>
			<div class="relative mt-4 flex items-center text-xs text-slate-500">
				<span class="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
				{stat.subtext}
			</div>
		</div>
	{/each}
</div>

<!-- Recent Activity -->
<div class="rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md">
	<div class="flex items-center justify-between border-b border-slate-200/60 px-6 py-5">
		<div>
			<h3 class="text-base font-semibold leading-6 text-slate-900">Recent Activity</h3>
			<p class="mt-1 text-xs text-slate-500">Real-time log of user interactions, posts, and comments.</p>
		</div>
		<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
			<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
			Live Data
		</span>
	</div>
	<div class="px-6 py-5">
		{#if data.dashboardStats.recentActivities.length === 0}
			<div class="py-12 text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h4 class="mt-3 text-sm font-semibold text-slate-900">No Activity Yet</h4>
				<p class="mt-1 text-xs text-slate-500">User activities will appear here automatically when interactions happen.</p>
			</div>
		{:else}
			<div class="flow-root">
				<ul class="-mb-8">
					{#each data.dashboardStats.recentActivities as activity, index}
						<li>
							<div class="relative pb-8">
								{#if index !== data.dashboardStats.recentActivities.length - 1}
									<span class="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
								{/if}
								<div class="relative flex items-start space-x-3">
									<div class="relative">
										<span class="flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white/50 backdrop-blur-sm font-bold text-sm {getBadgeStyle(activity.type)}">
											{activity.user.charAt(0).toUpperCase()}
										</span>
									</div>
									<div class="min-w-0 flex-1 pt-1.5">
										<div class="flex items-center gap-2">
											<span class="font-semibold text-sm text-slate-900">@{activity.user}</span>
											<span class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium {getBadgeStyle(activity.type)} uppercase tracking-wider">
												{activity.type}
											</span>
										</div>
										<p class="mt-0.5 text-sm text-slate-600">
											{activity.action}
										</p>
										<div class="mt-1 text-xs text-slate-400">
											<time datetime={new Date(activity.createdAt).toISOString()}>
												{formatTimeAgo(activity.createdAt)}
											</time>
										</div>
									</div>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>
