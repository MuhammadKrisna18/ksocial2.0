<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>User Management — Admin Dashboard</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Users</h1>
	<p class="mt-2 text-sm text-slate-500">Manage all users registered in the system.</p>
</div>

<div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md">
	<div class="border-b border-slate-200/60 px-6 py-5">
		<h3 class="text-base font-semibold leading-6 text-slate-900">User List</h3>
		<p class="mt-1 text-sm text-slate-500">A list of all users including their username, email, and roles.</p>
	</div>
	
	<div class="flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<table class="min-w-full divide-y divide-slate-300">
					<thead>
						<tr>
							<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Username</th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Email</th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Roles</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200">
						{#each data.users as user}
							<tr class="hover:bg-slate-50/50 transition-colors">
								<td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
									<div class="flex items-center">
										<div class="h-10 w-10 flex-shrink-0">
											<span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 ring-2 ring-white">
												<span class="font-bold leading-none text-primary-700">{user.username.charAt(0).toUpperCase()}</span>
											</span>
										</div>
										<div class="ml-4">
											<div class="font-semibold">{user.username}</div>
										</div>
									</div>
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
									{user.email}
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
									<div class="flex gap-2">
										{#each user.roles as role}
											<span class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 capitalize">
												{role}
											</span>
										{/each}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
