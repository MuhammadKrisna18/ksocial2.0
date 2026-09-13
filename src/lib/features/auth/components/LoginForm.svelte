<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		isLoading = true;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();

			if (!res.ok) {
				errorMessage = data.error ?? 'Login failed';
				return;
			}

			const roles: string[] = data.user?.roles ?? [];
			const destination = roles.includes('admin') ? '/admin' : '/';
			goto(destination);
		} catch {
			errorMessage = 'Something went wrong. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<form onsubmit={handleSubmit} novalidate>
	<div class="mb-6 text-center">
		<h1 class="text-2xl font-bold text-primary-700">K-Social</h1>
		<p class="mt-1 text-sm text-[var(--color-text-muted)]">Sign in to your account</p>
	</div>

	{#if errorMessage}
		<div
			class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
			role="alert"
		>
			{errorMessage}
		</div>
	{/if}

	<div class="mb-4">
		<label for="email" class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
			Email
		</label>
		<input
			id="email"
			type="email"
			bind:value={email}
			required
			autocomplete="email"
			placeholder="you@example.com"
			class="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400
				focus:border-primary-400 focus:ring-2 focus:ring-primary-100
				disabled:opacity-50"
			disabled={isLoading}
		/>
	</div>

	<div class="mb-6">
		<label for="password" class="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
			Password
		</label>
		<input
			id="password"
			type="password"
			bind:value={password}
			required
			autocomplete="current-password"
			placeholder="••••••••"
			class="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400
				focus:border-primary-400 focus:ring-2 focus:ring-primary-100
				disabled:opacity-50"
			disabled={isLoading}
		/>
	</div>

	<button
		type="submit"
		disabled={isLoading || !email || !password}
		class="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition
			hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300
			disabled:cursor-not-allowed disabled:opacity-50"
	>
		{isLoading ? 'Signing in...' : 'Sign in'}
	</button>
</form>
