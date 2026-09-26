<script lang="ts">
	import { enhance } from '$app/forms';
	import CommentItem from './CommentItem.svelte';

	let { comment, currentUser, post, onReply } = $props();

	let isLiked = $state(comment.isLiked || false);
	let likesCount = $state(comment.likesCount || 0);
	let isSaved = $state(comment.isSaved || false);
	let showReplies = $state(false);
	
	function formatTimeAgo(dateString: string | Date) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		
		if (diffInSeconds < 60) return 'Just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
		return `${Math.floor(diffInSeconds / 86400)}d`;
	}

	async function toggleLike(e: Event) {
		e.preventDefault();
		isLiked = !isLiked;
		likesCount += isLiked ? 1 : -1;
		
		try {
			const res = await fetch(`/api/comments/${comment.id}/like`, { method: 'POST' });
			if (!res.ok) {
				isLiked = !isLiked;
				likesCount += isLiked ? 1 : -1;
			}
		} catch (error) {
			isLiked = !isLiked;
			likesCount += isLiked ? 1 : -1;
		}
	}

	async function toggleSave(e: Event) {
		e.preventDefault();
		isSaved = !isSaved;
		
		try {
			const res = await fetch(`/api/comments/${comment.id}/save`, { method: 'POST' });
			if (!res.ok) {
				isSaved = !isSaved;
			}
		} catch (error) {
			isSaved = !isSaved;
		}
	}

	async function deleteComment(e: Event) {
		e.preventDefault();
		if (!confirm('Are you sure you want to delete this comment?')) return;
		
		try {
			const res = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
			if (res.ok) {
				window.location.reload();
			} else {
				console.error('Delete failed', res.status);
			}
		} catch (error) {
			console.error('Delete error', error);
		}
	}
</script>

<div class="flex gap-3 text-sm group/comment">
	<a href="/user/{comment.authorUsername}" class="h-8 w-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400">
		{#if comment.authorProfilePicture}
			<img src={comment.authorProfilePicture} alt={comment.authorName} class="w-full h-full object-cover" />
		{:else}
			{comment.authorName?.charAt(0) || comment.authorUsername?.charAt(0) || '?'}
		{/if}
	</a>
	<div class="flex-1">
		<div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-4 py-2.5 inline-block">
			<a href="/user/{comment.authorUsername}" class="font-bold text-slate-900 dark:text-white hover:underline mr-1 text-xs">{comment.authorName}</a>
			<span class="text-slate-700 dark:text-slate-300 break-words">
				{#each comment.content.split(/(\s+)/) as word}
					{#if word.startsWith('@')}
						<a href="/user/{word.substring(1)}" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">{word}</a>
					{:else}
						{word}
					{/if}
				{/each}
			</span>
		</div>
		<div class="px-4 mt-1 flex items-center gap-4">
			<span class="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
			
			<button type="button" onclick={toggleLike} class="text-xs font-semibold {isLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'} transition-colors">
				{likesCount > 0 ? `${likesCount} ` : ''}Like
			</button>
			
			<button type="button" onclick={() => onReply(comment)} class="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
				Reply
			</button>
			
			<button type="button" onclick={toggleSave} class="text-xs font-semibold {isSaved ? 'text-blue-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'} transition-colors">
				Save
			</button>

			{#if currentUser?.sub === comment.userId}
				<button type="button" onclick={deleteComment} class="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
					Delete
				</button>
			{/if}
		</div>
		
		{#if comment.replies && comment.replies.length > 0}
			<div class="mt-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
				{#if !showReplies}
					<button type="button" onclick={() => showReplies = true} class="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
						<div class="w-6 h-px bg-slate-300 dark:bg-slate-600"></div>
						View replies ({comment.replies.length})
					</button>
				{:else}
					<button type="button" onclick={() => showReplies = false} class="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-3">
						<div class="w-6 h-px bg-slate-300 dark:bg-slate-600"></div>
						Hide replies
					</button>
					<div class="space-y-3">
						{#each comment.replies as reply}
							<CommentItem comment={reply} {currentUser} {post} {onReply} />
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
