<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../../routes/(auth)/login/$types';

	let { form }: { form: ActionData } = $props();

	let isLoading = $state(false);
</script>

<form
	method="POST"
	action="?/login"
	use:enhance={() => {
		isLoading = true;
		return async ({ update }) => {
			await update();
			isLoading = false;
		};
	}}
	class="w-full"
>
	<div class="mb-8 text-center">
		<h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
			K-Social
		</h1>
		<p class="mt-2 text-sm text-slate-500 font-medium">Welcome back! Please enter your details.</p>
	</div>

	{#if form?.message}
		<div
			class="mb-6 rounded-xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-600 shadow-sm transition-all animate-in fade-in slide-in-from-top-2"
			role="alert"
		>
			<span class="font-semibold block mb-0.5">Error</span>
			{form.message}
		</div>
	{/if}

	<div class="mb-5 relative group">
		<label for="email" class="mb-1.5 block text-sm font-semibold text-slate-700 transition-colors group-focus-within:text-primary-600">
			Email
		</label>
		<input
			id="email"
			name="email"
			type="email"
			value={form?.email ?? ''}
			required
			autocomplete="email"
			placeholder="you@example.com"
			class="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400
				focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/20 focus:shadow-md
				hover:border-slate-300 hover:bg-white/90
				disabled:opacity-50"
			disabled={isLoading}
		/>
	</div>

	<div class="mb-8 relative group">
		<div class="mb-1.5 flex justify-between items-center">
			<label for="password" class="block text-sm font-semibold text-slate-700 transition-colors group-focus-within:text-primary-600">
				Password
			</label>
			<a href="#" class="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">Forgot password?</a>
		</div>
		<input
			id="password"
			name="password"
			type="password"
			required
			autocomplete="current-password"
			placeholder="••••••••"
			class="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400
				focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/20 focus:shadow-md
				hover:border-slate-300 hover:bg-white/90
				disabled:opacity-50"
			disabled={isLoading}
		/>
	</div>

	<button
		type="submit"
		disabled={isLoading}
		class="relative w-full overflow-hidden rounded-xl bg-gradient-to-tr from-primary-600 to-primary-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300
			hover:from-primary-700 hover:to-primary-600 hover:shadow-primary-500/30 hover:-translate-y-0.5
			focus:outline-none focus:ring-4 focus:ring-primary-500/40
			disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
	>
		{#if isLoading}
			<span class="flex items-center justify-center gap-2">
				<svg class="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Signing in...
			</span>
		{:else}
			Sign in
		{/if}
	</button>
	
	<p class="mt-6 text-center text-sm font-medium text-slate-600">
		Don't have an account? <a href="/register" class="font-bold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 transition-all">Sign up</a>
	</p>
</form>
