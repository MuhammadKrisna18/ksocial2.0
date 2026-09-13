<script lang="ts">
	let { children } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-[var(--color-surface-subtle)] px-4">
	<div
		class="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm"
	>
		{@render children()}
	</div>
</div>
