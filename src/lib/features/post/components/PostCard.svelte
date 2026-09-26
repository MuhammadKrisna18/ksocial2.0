<script lang="ts">
	import { enhance } from '$app/forms';
	import CommentItem from './CommentItem.svelte';
	import { isOwnPost } from '$lib/features/post/utils';

	let { post, currentUser } = $props();

	let isAuthorMe = $derived(
		isOwnPost({
			authorId: post.authorId,
			authorUsername: post.authorUsername,
			currentUser
		})
	);

	// Optimistic state
	let isLiked = $state(post.isLiked);
	let likesCount = $state(post.likesCount);
	let commentsCount = $state(post.commentsCount);
	let sharesCount = $state(post.sharesCount || 0);

	// Comment state
	let showComments = $state(false);
	let comments = $state<any[]>([]);
	let newComment = $state('');
	let isSubmittingComment = $state(false);
	let isLoadingComments = $state(false);
	
	let replyToComment = $state<any | null>(null);
	let commentInputRef = $state<HTMLTextAreaElement | null>(null);

	// Likes Modal state
	let showLikes = $state(false);
	let likesList = $state<any[]>([]);
	let isLoadingLikes = $state(false);

	function formatTimeAgo(dateString: Date | string) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		
		if (diffInSeconds < 60) return 'Just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
		return `${Math.floor(diffInSeconds / 86400)} days ago`;
	}

	async function toggleLike(e: Event) {
		e.preventDefault();
		// Optimistic update
		isLiked = !isLiked;
		likesCount += isLiked ? 1 : -1;
		
		try {
			const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
			if (!res.ok) {
				console.error('Like failed', res.status);
				// Revert on error
				isLiked = !isLiked;
				likesCount += isLiked ? 1 : -1;
			}
		} catch (error) {
			console.error('Like error', error);
			// Revert on error
			isLiked = !isLiked;
			likesCount += isLiked ? 1 : -1;
		}
	}

	async function showLikesModal(e: Event) {
		e.preventDefault();
		showLikes = true;
		isLoadingLikes = true;
		try {
			const res = await fetch(`/api/posts/${post.id}/likes`);
			if (res.ok) {
				const data = await res.json();
				likesList = data.likes;
			}
		} catch (error) {
			console.error("Failed to fetch likes", error);
		} finally {
			isLoadingLikes = false;
		}
	}

	function closeLikesModal() {
		showLikes = false;
		likesList = [];
	}

	async function sharePost(e: Event) {
		e.preventDefault();
		const details = (e.currentTarget as HTMLElement).closest('details');
		if (details) details.open = false;

		// Copy link to clipboard
		const link = `${window.location.origin}/post/${post.id}`;
		try {
			await navigator.clipboard.writeText(link);
			alert('Link copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy', err);
		}

		try {
			const res = await fetch(`/api/posts/${post.id}/share`, { method: 'POST' });
			if (res.ok) {
				const data = await res.json();
				sharesCount = data.sharesCount;
			}
		} catch (error) {
			console.error('Share error', error);
		}
	}

	async function toggleComments(e: Event) {
		e.preventDefault();
		showComments = !showComments;
		if (showComments && comments.length === 0) {
			await fetchComments();
		}
	}

	async function fetchComments() {
		isLoadingComments = true;
		try {
			const res = await fetch(`/api/posts/${post.id}/comments`);
			if (res.ok) {
				const data = await res.json();
				comments = data.comments;
			}
		} catch (error) {
			console.error("Failed to load comments", error);
		} finally {
			isLoadingComments = false;
		}
	}
	
	function handleReply(comment: any) {
		replyToComment = comment;
		showComments = true;
		
		const prefix = `@${comment.authorUsername} `;
		if (!newComment.startsWith(prefix)) {
			if (newComment.trim() === '' || newComment.startsWith('@')) {
				newComment = prefix;
			} else {
				newComment = prefix + newComment;
			}
		}
		
		setTimeout(() => {
			if (commentInputRef) {
				commentInputRef.focus();
				// Move cursor to the end
				commentInputRef.setSelectionRange(commentInputRef.value.length, commentInputRef.value.length);
			}
		}, 0);
	}

	function cancelReply() {
		replyToComment = null;
		newComment = '';
	}

	async function submitComment(e: Event) {
		e.preventDefault();
		if (!newComment.trim() || isSubmittingComment) return;
		
		isSubmittingComment = true;
		try {
			const topLevelParentId = replyToComment ? (replyToComment.parentId || replyToComment.id) : undefined;
			
			const payload = {
				content: newComment,
				parentId: topLevelParentId
			};
			const res = await fetch(`/api/posts/${post.id}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			
			if (res.ok) {
				const data = await res.json();
				if (replyToComment && topLevelParentId) {
					// It's a reply, find the parent in our local state and add it
					const parentIndex = comments.findIndex(c => c.id === topLevelParentId);
					if (parentIndex !== -1) {
						if (!comments[parentIndex].replies) comments[parentIndex].replies = [];
						comments[parentIndex].replies = [...comments[parentIndex].replies, data.comment];
					}
				} else {
					comments = [data.comment, ...comments];
					commentsCount++;
				}
				
				newComment = '';
				replyToComment = null;
			}
		} catch (error) {
			console.error("Failed to post comment", error);
		} finally {
			isSubmittingComment = false;
		}
	}
</script>

<div class="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 border border-slate-100 dark:border-slate-700 transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
	<!-- Post Header -->
	<div class="flex items-center justify-between">
		<a href="/user/{post.authorUsername}" class="flex items-center gap-3 group/author">
			<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md uppercase group-hover/author:ring-2 ring-purple-500 transition-all">
				{post.authorName?.charAt(0) || post.authorUsername?.charAt(0)}
			</div>
			<div>
				<div class="flex items-center gap-1.5 flex-wrap">
					<p class="text-sm font-bold text-slate-900 dark:text-white group-hover/author:underline">
						{post.authorName}
					</p>
					<span class="text-xs font-normal text-slate-500 dark:text-slate-400 no-underline">@{post.authorUsername}</span>
					{#if isAuthorMe}
						<span class="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 leading-none">
							You
						</span>
					{/if}
				</div>
				<p class="text-xs text-slate-400 dark:text-slate-500">{formatTimeAgo(post.createdAt)}</p>
			</div>
		</a>
		<details class="relative">
			<summary class="list-none p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer [&::-webkit-details-marker]:hidden">
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
				</svg>
			</summary>
			<div class="absolute right-0 mt-1 w-40 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-10 py-1">
				<form 
					method="POST" 
					action="?/toggleSave" 
					use:enhance={() => {
						post.isSaved = !post.isSaved;
						return async ({ update }) => {
							await update({ reset: false });
						};
					}}
				>
					<input type="hidden" name="postId" value={post.id} />
					<button class="w-full text-left px-4 py-2.5 text-sm font-medium {post.isSaved ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'} hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors" onclick={(e) => {
						const details = e.currentTarget.closest('details');
						if (details) details.open = false;
					}}>
						<svg class="w-4 h-4" fill={post.isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
						</svg>
						{post.isSaved ? 'Unsave' : 'Save'}
					</button>
				</form>
				
				<button class="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors" onclick={sharePost}>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
					</svg>
					Share {sharesCount > 0 ? `(${sharesCount})` : ''}
				</button>

				{#if currentUser?.sub === post.authorId}
					<form 
						method="POST" 
						action="?/deletePost" 
						use:enhance={() => {
							return async ({ update }) => {
								await update();
							};
						}}
					>
						<input type="hidden" name="postId" value={post.id} />
						<button class="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors" onclick={(e) => {
							const details = e.currentTarget.closest('details');
							if (details) details.open = false;
						}}>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Delete
						</button>
					</form>
				{/if}
			</div>
		</details>
	</div>

	<!-- Post Content -->
	<div class="mt-4">
		<p class="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{post.content}</p>
		{#if post.media && post.media.length > 0}
			<div class="mt-3 grid gap-2 {post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}">
				{#each post.media as m}
					<div class="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
						{#if m.type === 'image'}
							<img 
								src={m.url} 
								alt="Post media" 
								class="w-full h-auto max-h-96 object-cover" 
								loading="lazy" 
								onerror={(e) => {
									const container = (e.currentTarget as HTMLElement).closest('.rounded-xl') as HTMLElement;
									if (container) container.style.display = 'none';
								}}
							/>
						{:else}
							<video src={m.url} controls class="w-full h-auto max-h-96 object-cover"></video>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Post Actions -->
	<div class="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
		<div class="flex items-center gap-1 group text-sm font-medium {isLiked ? 'text-red-500' : 'text-slate-500'}">
			<button type="button" onclick={toggleLike} class="p-1.5 rounded-full {isLiked ? 'bg-red-50 dark:bg-red-900/30' : 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'} transition-colors">
				<svg class="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
				</svg>
			</button>
			{#if likesCount > 0}
				<button type="button" onclick={showLikesModal} class="hover:underline cursor-pointer p-1">
					{likesCount}
				</button>
			{:else}
				<span class="p-1">{likesCount}</span>
			{/if}
		</div>
		<button type="button" onclick={toggleComments} class="flex items-center gap-2 {showComments ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'} transition-colors group text-sm font-medium">
			<div class="p-1.5 rounded-full {showComments ? 'bg-blue-50 dark:bg-blue-900/30' : 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'} transition-colors">
				<svg class="w-5 h-5" fill={showComments ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
				</svg>
			</div>
			<span>{commentsCount}</span>
		</button>
	</div>

	<!-- Comments Section -->
	{#if showComments}
		<div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
			<!-- Add Comment -->
			{#if replyToComment}
				<div class="mb-2 flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs">
					<span class="text-slate-600 dark:text-slate-400">
						Replying to <span class="font-bold">@{replyToComment.authorUsername}</span>
					</span>
					<button type="button" onclick={cancelReply} class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}
			<form onsubmit={submitComment} class="flex gap-3 mb-6">
				<div class="h-8 w-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400">
					{#if currentUser?.profilePictureUrl}
						<img src={currentUser.profilePictureUrl} alt="User" class="w-full h-full object-cover" />
					{:else}
						{currentUser?.name?.charAt(0) || '?'}
					{/if}
				</div>
				<div class="flex-1 flex items-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
					<textarea 
						bind:this={commentInputRef}
						bind:value={newComment} 
						placeholder={replyToComment ? `Reply to @${replyToComment.authorUsername}...` : "Write a comment..."} 
						class="w-full bg-transparent border-none focus:ring-0 resize-none text-sm px-3 py-1.5 max-h-32 min-h-[36px] text-slate-900 dark:text-white"
						rows="1"
						oninput={(e) => {
							e.currentTarget.style.height = 'auto';
							e.currentTarget.style.height = (e.currentTarget.scrollHeight) + 'px';
						}}
					></textarea>
					<button 
						type="submit" 
						disabled={!newComment.trim() || isSubmittingComment}
						class="shrink-0 h-8 w-8 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
					>
						<svg class="w-4 h-4 translate-x-[-1px] translate-y-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
						</svg>
					</button>
				</div>
			</form>

			<!-- Comments List -->
			<div class="space-y-4">
				{#if isLoadingComments}
					<div class="flex justify-center py-4">
						<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
					</div>
				{:else if comments.length === 0}
					<p class="text-center text-sm text-slate-500 py-4">No comments yet.</p>
				{:else}
					{#each comments as comment}
						<CommentItem {comment} {currentUser} {post} onReply={handleReply} />
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Likes Modal -->
{#if showLikes}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onclick={closeLikesModal}>
		<div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]" onclick={e => e.stopPropagation()}>
			<div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
				<h3 class="font-bold text-lg text-slate-900 dark:text-white">Likes</h3>
				<button type="button" onclick={closeLikesModal} class="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="p-4 overflow-y-auto flex-1">
				{#if isLoadingLikes}
					<div class="flex justify-center py-8">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				{:else if likesList.length === 0}
					<p class="text-center text-slate-500 dark:text-slate-400 py-8">No likes yet.</p>
				{:else}
					<div class="space-y-4">
						{#each likesList as user}
							<a href="/user/{user.username}" class="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-2xl transition-colors">
								<div class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
									{#if user.profilePictureUrl}
										<img src={user.profilePictureUrl} alt={user.fullName || user.username} class="w-full h-full object-cover" />
									{:else}
										{(user.fullName || user.username).charAt(0).toUpperCase()}
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<p class="font-bold text-sm text-slate-900 dark:text-white truncate">{user.fullName || user.username}</p>
									<p class="text-xs text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
