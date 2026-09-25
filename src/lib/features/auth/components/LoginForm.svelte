<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { signInWithGoogle } from '$lib/infrastructure/external-services/firebaseClient';
	import type { ActionData } from '../../../../routes/(auth)/login/$types';

	let { form }: { form: ActionData } = $props();

	let isLoading = $state(false);
	let isGoogleLoading = $state(false);
	let googleError = $state<string | null>(null);

	async function handleGoogleSignIn() {
		isGoogleLoading = true;
		googleError = null;
		try {
			const idToken = await signInWithGoogle();
			const res = await fetch('/api/auth/firebase', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken })
			});

			const data = (await res.json()) as { success?: boolean; redirectUrl?: string; error?: string };

			if (!res.ok) {
				throw new Error(data.error || 'Autentikasi Google gagal.');
			}

			window.location.href = data.redirectUrl || '/user';
		} catch (err: unknown) {
			console.error('Google sign-in error:', err);
			const message = err instanceof Error ? err.message : 'Gagal masuk dengan Google';
			if (message.includes('auth/popup-closed-by-user')) {
				googleError = 'Jendela login Google ditutup sebelum selesai.';
			} else {
				googleError = message;
			}
		} finally {
			isGoogleLoading = false;
		}
	}
</script>

<div class="w-full">
	<div class="mb-8 text-center">
		<h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
			K-Social
		</h1>
		<p class="mt-2 text-sm text-slate-500 font-medium">Welcome back! Please enter your details.</p>
	</div>

	{#if form?.message || googleError}
		<div
			class="mb-6 rounded-xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-600 shadow-sm transition-all animate-in fade-in slide-in-from-top-2"
			role="alert"
		>
			<span class="font-semibold block mb-0.5">Error</span>
			{form?.message || googleError}
		</div>
	{/if}

	<!-- Google Sign In Button -->
	<button
		type="button"
		onclick={handleGoogleSignIn}
		disabled={isLoading || isGoogleLoading}
		class="relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
	>
		{#if isGoogleLoading}
			<svg class="h-5 w-5 animate-spin text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<span>Menghubungkan ke Google...</span>
		{:else}
			<svg class="h-5 w-5" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
			</svg>
			<span>Masuk dengan Google</span>
		{/if}
	</button>

	<div class="relative my-6">
		<div class="absolute inset-0 flex items-center">
			<div class="w-full border-t border-slate-200"></div>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-white/80 px-2 text-slate-400 font-medium">atau masuk dengan email</span>
		</div>
	</div>

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
		<div class="mb-5 relative group">
			<label for="email" class="mb-1.5 block text-sm font-semibold text-slate-700 transition-colors group-focus-within:text-primary-600">
				Email or Username
			</label>
			<input
				id="email"
				name="email"
				type="text"
				value={form?.email ?? ''}
				required
				autocomplete="username"
				placeholder="contoh@gmail.com atau username"
				class="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400
					focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/20 focus:shadow-md
					hover:border-slate-300 hover:bg-white/90
					disabled:opacity-50"
				disabled={isLoading || isGoogleLoading}
			/>
		</div>

		<div class="mb-8 relative group">
			<div class="mb-1.5 flex justify-between items-center">
				<label for="password" class="block text-sm font-semibold text-slate-700 transition-colors group-focus-within:text-primary-600">
					Password
				</label>
				<span class="text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer transition-colors">Forgot password?</span>
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
				disabled={isLoading || isGoogleLoading}
			/>
		</div>

		<button
			type="submit"
			disabled={isLoading || isGoogleLoading}
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
	</form>

	<p class="mt-6 text-center text-sm font-medium text-slate-600">
		Don't have an account? <a href={resolve('/register')} class="font-bold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 transition-all">Sign up</a>
	</p>
</div>
