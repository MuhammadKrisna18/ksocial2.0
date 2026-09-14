<script lang="ts">
	import LoginForm from '$lib/features/auth/components/LoginForm.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Login — K-Social</title>
</svelte:head>

<LoginForm {form} />
