<script lang="ts">
	import { enhance } from '$app/forms';

	let { currentUser, form } = $props();

	let isModalOpen = $state(false);
	let isPosting = $state(false);
	let mediaPreviews = $state<{ url: string, type: 'image' | 'video' }[]>([]);
	let fileInput = $state<HTMLInputElement | null>(null);

	function onFileSelected(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const newPreviews = Array.from(input.files).map(file => ({
				url: URL.createObjectURL(file),
				type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
			}));
			mediaPreviews = [...mediaPreviews, ...newPreviews];
		}
	}

	function removePreview(index: number) {
		if (fileInput && fileInput.files) {
			const dt = new DataTransfer();
			const files = Array.from(fileInput.files);
			files.splice(index, 1);
			files.forEach(f => dt.items.add(f));
			fileInput.files = dt.files;
		}
		URL.revokeObjectURL(mediaPreviews[index].url);
		mediaPreviews.splice(index, 1);
		mediaPreviews = [...mediaPreviews];
	}
</script>

<!-- Create Post Trigger -->
<div class="mb-8 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3">
	<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md uppercase text-lg">
		{currentUser?.username?.charAt(0) || 'U'}
	</div>
	
	<button onclick={() => isModalOpen = true} class="flex-1 text-left bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-full py-2.5 px-5 text-slate-500 dark:text-slate-400 text-sm">
		What's on your mind, {currentUser?.fullName?.split(' ')[0] || 'friend'}?
	</button>
	
	<div class="flex items-center gap-1 sm:gap-2">
		<button onclick={() => isModalOpen = true} class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors" title="Video">
			<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
		</button>
		<button onclick={() => isModalOpen = true} class="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-colors" title="Photo">
			<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
		</button>
		<button onclick={() => isModalOpen = true} class="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-full transition-colors" title="Feeling/Activity">
			<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S7.33 8 8.5 8 10 8.67 10 9.5 9.33 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
		</button>
	</div>
</div>

<!-- Create Post Modal -->
{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0" onclick={() => isModalOpen = false}></div>
		<div class="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 animate-in zoom-in-95 duration-200">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
				<h3 class="text-xl font-bold text-slate-900 dark:text-white">Create Post</h3>
				<button onclick={() => isModalOpen = false} class="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>
			</div>
			<!-- Body -->
			<div class="p-5 overflow-y-auto">
				<form 
					method="POST" 
					action="?/createPost"
					enctype="multipart/form-data"
					class="flex flex-col gap-4"
					use:enhance={() => {
						isPosting = true;
						return async ({ update, formElement, result }) => {
							isPosting = false;
							if (result.type === 'failure') {
								alert(result.data?.error || result.data?.message || 'Failed to create post');
								return;
							}
							if (result.type === 'error') {
								alert('Server error occurred while creating post');
								return;
							}
							await update();
							isModalOpen = false;
							formElement.reset();
							mediaPreviews.forEach(p => URL.revokeObjectURL(p.url));
							mediaPreviews = [];
						};
					}}
				>
					<div class="flex items-center gap-3 mb-2">
						<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md uppercase">
							{currentUser?.username?.charAt(0) || 'U'}
						</div>
						<div class="flex flex-col">
							<span class="font-bold text-slate-900 dark:text-white text-sm">{currentUser?.fullName}</span>
							<span class="text-xs text-slate-500 dark:text-slate-400">Public</span>
						</div>
					</div>
					
					<textarea
						name="content"
						rows="4"
						placeholder="What's on your mind, {currentUser?.fullName?.split(' ')[0] || 'friend'}?"
						class="w-full resize-none border-0 bg-transparent p-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 sm:text-lg outline-none"
						required
					></textarea>
					
					{#if mediaPreviews.length > 0}
						<div class="mt-2 flex flex-wrap gap-2">
							{#each mediaPreviews as preview, i}
								<div class="relative w-full sm:w-[calc(50%-0.25rem)] aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
									{#if preview.type === 'image'}
										<img src={preview.url} alt="Preview" class="w-full h-full object-cover" />
									{:else}
										<video src={preview.url} class="w-full h-full object-cover"></video>
										<div class="absolute inset-0 flex items-center justify-center bg-black/20">
											<svg class="w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
										</div>
									{/if}
									<button type="button" onclick={() => removePreview(i)} class="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors backdrop-blur-sm">
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
									</button>
								</div>
							{/each}
						</div>
					{/if}

					{#if form?.error}
						<p class="text-sm text-red-500 mt-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">{form.error}</p>
					{/if}

					<div class="mt-2 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
						<span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Add to your post</span>
						<div class="flex gap-1">
							<button type="button" onclick={() => fileInput?.click()} class="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-colors" title="Photo/Video">
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
							</button>
							<input type="file" bind:this={fileInput} name="media" accept="image/*,video/*" multiple class="hidden" onchange={onFileSelected} />
							<button type="button" class="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-full transition-colors" title="Feeling/Activity">
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S7.33 8 8.5 8 10 8.67 10 9.5 9.33 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
							</button>
						</div>
					</div>
					
					<button 
						type="submit" 
						disabled={isPosting}
						class="w-full mt-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/30 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{#if isPosting}
							<svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Posting...
						{:else}
							Post
						{/if}
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
