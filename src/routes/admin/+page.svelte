<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Admin Dashboard — K-Social</title>
</svelte:head>

<div class="p-8">
	<h1 class="text-2xl font-bold text-primary-700">Admin Dashboard</h1>
	<p class="mt-2 text-sm text-[var(--color-text-muted)]">
		Logged in as <span class="font-medium text-[var(--color-text)]">{data.user.email}</span>
	</p>
</div>
