<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { signInWithGoogle } from '$lib/infrastructure/external-services/firebaseClient';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let googleLoading = $state(false);
	let googleError = $state<string | null>(null);

	async function handleGoogleSignUp() {
		googleLoading = true;
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
				throw new Error(data.error || 'Pendaftaran dengan Google gagal.');
			}

			window.location.href = data.redirectUrl || '/user';
		} catch (err: unknown) {
			console.error('Google sign-up error:', err);
			const message = err instanceof Error ? err.message : 'Gagal mendaftar dengan Google';
			if (message.includes('auth/popup-closed-by-user')) {
				googleError = 'Jendela login Google ditutup sebelum proses selesai.';
			} else {
				googleError = message;
			}
		} finally {
			googleLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Register — K-Social</title>
</svelte:head>

<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-500/30">
			<svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
			</svg>
		</div>
		<h2 class="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
			Buat Akun Baru
		</h2>
		<p class="mt-2 text-center text-sm text-slate-500">
			Bergabung dengan K-Social dan terhubung bersama teman.
		</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div class="relative rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-8 shadow-xl shadow-slate-200/40 backdrop-blur-md sm:px-10">
			{#if form?.error || googleError}
				<div class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">{form?.error || googleError}</h3>
						</div>
					</div>
				</div>
			{/if}

			<!-- Google Sign Up Button -->
			<button
				type="button"
				onclick={handleGoogleSignUp}
				disabled={loading || googleLoading}
				class="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if googleLoading}
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
					<span>Daftar Cepat dengan Google</span>
				{/if}
			</button>

			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-slate-200"></div>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-white/80 px-2 text-slate-400 font-medium">atau daftar dengan email</span>
				</div>
			</div>

			<form class="space-y-6" method="POST" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}>
				<div>
					<label for="fullName" class="block text-sm font-medium leading-6 text-slate-900">Nama Lengkap</label>
					<div class="mt-2">
						<input id="fullName" name="fullName" type="text" required class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow" placeholder="John Doe" value={form?.values?.fullName ?? ''} />
					</div>
				</div>

				<div>
					<label for="username" class="block text-sm font-medium leading-6 text-slate-900">Nama Panggilan (Username)</label>
					<div class="mt-2">
						<input id="username" name="username" type="text" required class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow" placeholder="johndoe" value={form?.values?.username ?? ''} />
					</div>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium leading-6 text-slate-900">Email Asli</label>
					<div class="mt-2">
						<input id="email" name="email" type="email" required class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow" placeholder="nama@gmail.com" value={form?.values?.email ?? ''} />
					</div>
				</div>

				<div>
					<label for="dateOfBirth" class="block text-sm font-medium leading-6 text-slate-900">Tanggal Lahir</label>
					<div class="mt-2">
						<input id="dateOfBirth" name="dateOfBirth" type="date" required class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow" value={form?.values?.dateOfBirth ?? ''} />
					</div>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium leading-6 text-slate-900">Password</label>
					<div class="mt-2">
						<input id="password" name="password" type="password" required class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow" />
					</div>
				</div>

				<div>
					<button type="submit" disabled={loading || googleLoading} class="flex w-full justify-center rounded-xl bg-primary-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-md shadow-primary-500/20 hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
						{#if loading}
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Mendaftarkan...
						{:else}
							Daftar Akun
						{/if}
					</button>
				</div>
			</form>
		</div>
		
		<p class="mt-8 text-center text-sm text-slate-500">
			Sudah punya akun?
			<a href={resolve('/login')} class="font-semibold leading-6 text-primary-600 hover:text-primary-500 transition-colors">Masuk di sini</a>
		</p>
	</div>
</div>
