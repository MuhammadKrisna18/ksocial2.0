<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	
	let loading = $state(false);
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
			Create an account
		</h2>
		<p class="mt-2 text-center text-sm text-slate-500">
			Join K-Social and connect with everyone.
		</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div class="relative rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-8 shadow-xl shadow-slate-200/40 backdrop-blur-md sm:px-10">
			{#if form?.error}
				<div class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">{form.error}</h3>
						</div>
					</div>
				</div>
			{/if}

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
					<label for="emailPrefix" class="block text-sm font-medium leading-6 text-slate-900">Email</label>
					<div class="mt-2 flex w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
						<input type="text" name="emailPrefix" id="emailPrefix" class="block flex-1 border-0 bg-transparent py-2.5 px-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="johndoe" required value={form?.values?.emailPrefix ?? ''} />
						<span class="flex select-none items-center bg-slate-50 border-l border-slate-200 px-3.5 text-slate-500 sm:text-sm whitespace-nowrap">@user.sveltekit.co.id</span>
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
					<button type="submit" disabled={loading} class="flex w-full justify-center rounded-xl bg-primary-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-md shadow-primary-500/20 hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
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
			<a href="/login" class="font-semibold leading-6 text-primary-600 hover:text-primary-500 transition-colors">Masuk di sini</a>
		</p>
	</div>
</div>
