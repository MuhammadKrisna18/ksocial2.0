<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let deletingId = $state<string | null>(null);

	function formatTime(dateString: Date | string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Manajemen Postingan — K-Social Admin</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Manajemen Postingan</h1>
	<p class="mt-2 text-sm text-slate-500">Pantau dan kelola seluruh konten postingan pengguna di K-Social.</p>
</div>

{#if form?.success}
	<div class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
		<div class="flex items-center gap-2">
			<svg class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			<span class="font-medium">{form.message ?? 'Postingan berhasil dihapus.'}</span>
		</div>
	</div>
{/if}

{#if form?.error}
	<div class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
		<div class="flex items-center gap-2">
			<svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
			<span class="font-medium">{form.message ?? 'Gagal memproses aksi.'}</span>
		</div>
	</div>
{/if}

<div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md">
	<div class="flex items-center justify-between border-b border-slate-200/60 px-6 py-5">
		<div>
			<h3 class="text-base font-semibold leading-6 text-slate-900">Daftar Postingan</h3>
			<p class="mt-1 text-sm text-slate-500">Total {data.posts.length} postingan ditemukan di platform.</p>
		</div>
	</div>

	{#if data.posts.length === 0}
		<div class="py-16 text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3L22 4" />
				</svg>
			</div>
			<h4 class="mt-3 text-sm font-semibold text-slate-900">Belum Ada Postingan</h4>
			<p class="mt-1 text-xs text-slate-500">Postingan yang dibuat pengguna akan muncul di sini.</p>
		</div>
	{:else}
		<div class="flow-root">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
					<thead class="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
						<tr>
							<th scope="col" class="py-3.5 pl-6 pr-3 font-semibold">Penulis</th>
							<th scope="col" class="px-3 py-3.5 font-semibold">Konten</th>
							<th scope="col" class="px-3 py-3.5 font-semibold text-center">Statistik</th>
							<th scope="col" class="px-3 py-3.5 font-semibold">Waktu Dibuat</th>
							<th scope="col" class="py-3.5 pl-3 pr-6 text-right font-semibold">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.posts as post}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<td class="whitespace-nowrap py-4 pl-6 pr-3 font-medium text-slate-900">
									<div class="flex items-center gap-3">
										<div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-xs ring-2 ring-white">
											{post.authorUsername.charAt(0).toUpperCase()}
										</div>
										<div>
											<div class="font-semibold text-slate-900">{post.authorName || post.authorUsername}</div>
											<div class="text-xs text-slate-400">@{post.authorUsername}</div>
										</div>
									</div>
								</td>
								<td class="max-w-xs px-3 py-4">
									<p class="truncate text-slate-800" title={post.content}>{post.content}</p>
									{#if post.media && post.media.length > 0}
										<div class="mt-1 flex items-center gap-1 text-[11px] text-blue-600">
											<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<span>{post.media.length} lampiran media</span>
										</div>
									{/if}
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-center">
									<div class="flex items-center justify-center gap-3 text-xs text-slate-500">
										<span class="inline-flex items-center gap-1" title="Suka">
											<svg class="h-3.5 w-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
												<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
											</svg>
											{post.likesCount}
										</span>
										<span class="inline-flex items-center gap-1" title="Komentar">
											<svg class="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
											</svg>
											{post.commentsCount}
										</span>
									</div>
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-xs text-slate-500">
									{formatTime(post.createdAt)}
								</td>
								<td class="whitespace-nowrap py-4 pl-3 pr-6 text-right">
									<form
										method="POST"
										action="?/delete"
										use:enhance={() => {
											deletingId = post.id;
											return async ({ update }) => {
												deletingId = null;
												await update();
											};
										}}
										onsubmit={(e) => {
											if (!confirm('Apakah Anda yakin ingin menghapus postingan ini secara permanen?')) {
												e.preventDefault();
											}
										}}
									>
										<input type="hidden" name="postId" value={post.id} />
										<button
											type="submit"
											disabled={deletingId === post.id}
											class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
										>
											<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
											{deletingId === post.id ? 'Menghapus...' : 'Hapus'}
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
