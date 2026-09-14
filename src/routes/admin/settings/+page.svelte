<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isUpdatingUsername = $state(false);
	let isUpdatingPassword = $state(false);
</script>

<svelte:head>
	<title>Settings — Admin Dashboard</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
	<p class="mt-2 text-sm text-slate-500">Manage your account settings and preferences.</p>
</div>

<div class="space-y-6 max-w-2xl">
	<!-- Alert Messages -->
	{#if form?.success}
		<div class="rounded-xl bg-emerald-50 border border-emerald-200 p-4 shadow-sm">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm font-medium text-emerald-800">{form.message}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if form?.error || form?.missingUsername || form?.missingPassword}
		<div class="rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm font-medium text-red-800">{form.message}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Profile Information Form -->
	<div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md">
		<div class="border-b border-slate-200/60 px-6 py-5">
			<h3 class="text-base font-semibold leading-6 text-slate-900">Profile Information</h3>
			<p class="mt-1 text-sm text-slate-500">Update your account's profile information and username.</p>
		</div>
		<div class="px-6 py-5">
			<form
				method="POST"
				action="?/updateUsername"
				use:enhance={() => {
					isUpdatingUsername = true;
					return async ({ update }) => {
						await update();
						isUpdatingUsername = false;
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="email" class="block text-sm font-medium leading-6 text-slate-900">Email Address (Read-only)</label>
					<div class="mt-2">
						<input type="email" id="email" value={data.user.email} disabled class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-slate-50 cursor-not-allowed opacity-70" />
					</div>
					<p class="mt-1.5 text-xs text-slate-500">Contact super-admin to change email address.</p>
				</div>

				<div>
					<label for="username" class="block text-sm font-medium leading-6 text-slate-900">Username</label>
					<div class="mt-2">
						<input type="text" name="username" id="username" value={data.user.username} required class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white/50 transition-colors" />
					</div>
				</div>

				<div class="pt-2 flex justify-end">
					<button type="submit" disabled={isUpdatingUsername} class="flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all disabled:opacity-70">
						{#if isUpdatingUsername}
							<svg class="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
							Saving...
						{:else}
							Save Changes
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Update Password Form -->
	<div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md">
		<div class="border-b border-slate-200/60 px-6 py-5">
			<h3 class="text-base font-semibold leading-6 text-slate-900">Update Password</h3>
			<p class="mt-1 text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
		</div>
		<div class="px-6 py-5">
			<form
				method="POST"
				action="?/updatePassword"
				use:enhance={() => {
					isUpdatingPassword = true;
					return async ({ update }) => {
						await update();
						isUpdatingPassword = false;
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="oldPassword" class="block text-sm font-medium leading-6 text-slate-900">Current Password</label>
					<div class="mt-2">
						<input type="password" name="oldPassword" id="oldPassword" required class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white/50 transition-colors" />
					</div>
				</div>

				<div>
					<label for="newPassword" class="block text-sm font-medium leading-6 text-slate-900">New Password</label>
					<div class="mt-2">
						<input type="password" name="newPassword" id="newPassword" required minlength="8" class="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white/50 transition-colors" />
					</div>
				</div>

				<div class="pt-2 flex justify-end">
					<button type="submit" disabled={isUpdatingPassword} class="flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all disabled:opacity-70">
						{#if isUpdatingPassword}
							<svg class="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
							Updating...
						{:else}
							Update Password
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
