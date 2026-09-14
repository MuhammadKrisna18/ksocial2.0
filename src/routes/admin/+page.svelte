<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Admin Dashboard — K-Social</title>
</svelte:head>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-primary-700">Admin Dashboard</h1>
			<p class="mt-2 text-sm text-[var(--color-text-muted)]">
				Logged in as <span class="font-medium text-[var(--color-text)]">{data.user?.email}</span>
			</p>
		</div>
		<form method="POST" action="?/logout">
			<button class="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
				Logout
			</button>
		</form>
	</div>
</div>
