<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Dummy data for presentation
	const stats = [
		{ title: 'Total Users', value: '2,845', change: '+12.5%', isPositive: true, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
		{ title: 'Active Posts', value: '14,212', change: '+5.2%', isPositive: true, icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3L22 4' },
		{ title: 'Reported Content', value: '24', change: '-2.1%', isPositive: true, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
	];

	const recentActivities = [
		{ id: 1, user: 'alex_dev', action: 'Created a new post', time: '2 minutes ago', avatar: 'bg-blue-100 text-blue-600' },
		{ id: 2, user: 'maria.db', action: 'Updated profile picture', time: '1 hour ago', avatar: 'bg-purple-100 text-purple-600' },
		{ id: 3, user: 'johndoe', action: 'Reported a comment', time: '3 hours ago', avatar: 'bg-orange-100 text-orange-600' },
		{ id: 4, user: 'system', action: 'Weekly database backup completed', time: '5 hours ago', avatar: 'bg-slate-100 text-slate-600' },
	];
</script>

<svelte:head>
	<title>Admin Dashboard — K-Social</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h1>
	<p class="mt-2 text-sm text-slate-500">Welcome back! Here's what's happening today.</p>
</div>

<!-- Stats Grid -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
	{#each stats as stat}
		<div class="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-md">
			<div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 opacity-50 transition-transform group-hover:scale-150"></div>
			<div class="relative flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-slate-500">{stat.title}</p>
					<p class="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon} />
					</svg>
				</div>
			</div>
			<div class="relative mt-4 flex items-center text-sm">
				<span class="flex items-center font-medium {stat.isPositive ? 'text-emerald-600' : 'text-red-600'}">
					{#if stat.isPositive}
						<svg class="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
					{:else}
						<svg class="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
					{/if}
					{stat.change}
				</span>
				<span class="ml-2 text-slate-400">vs last month</span>
			</div>
		</div>
	{/each}
</div>

<!-- Recent Activity -->
<div class="rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md">
	<div class="border-b border-slate-200/60 px-6 py-5">
		<h3 class="text-base font-semibold leading-6 text-slate-900">Recent Activity</h3>
	</div>
	<div class="px-6 py-5">
		<div class="flow-root">
			<ul class="-mb-8">
				{#each recentActivities as activity, index}
					<li>
						<div class="relative pb-8">
							{#if index !== recentActivities.length - 1}
								<span class="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
							{/if}
							<div class="relative flex items-start space-x-3">
								<div class="relative">
									<span class="flex h-10 w-10 items-center justify-center rounded-full {activity.avatar} ring-8 ring-white/50 backdrop-blur-sm">
										<span class="font-bold text-sm">{activity.user.charAt(0).toUpperCase()}</span>
									</span>
								</div>
								<div class="min-w-0 flex-1 pt-2.5">
									<div>
										<p class="text-sm text-slate-500">
											<span class="font-medium text-slate-900">{activity.user}</span> {activity.action}
										</p>
									</div>
									<div class="mt-1 text-xs text-slate-400">
										<time datetime="2023-09-20">{activity.time}</time>
									</div>
								</div>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
