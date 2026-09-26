import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { fail } from '@sveltejs/kit';
import { handleActionError } from '$lib/presentation/utils/response';
import { postFileStorage } from '$lib/infrastructure/storage/LocalFileStorage';
import { validatePostMediaFile } from '$lib/infrastructure/storage/uploadValidator';
import { postRateLimiter } from '$lib/infrastructure/security/RateLimiter';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	setHeaders({
		'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
	});
	const posts = await container.getFeedUseCase.execute(locals.user?.sub);
	
	return {
		posts
	};
};

export const actions: Actions = {
	createPost: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return fail(401, { error: 'Unauthorized' });
		}

		// Anti-flood rate limiting for posts
		const rateCheck = postRateLimiter.consume(userId);
		if (!rateCheck.allowed) {
			return fail(429, {
				error: `You are posting too quickly. Please wait ${rateCheck.resetInSeconds} second${rateCheck.resetInSeconds === 1 ? '' : 's'}.`
			});
		}

		const data = await request.formData();
		const content = data.get('content')?.toString() || '';
		const files = data.getAll('media') as File[];

		if (!content.trim() && (!files.length || files[0].size === 0)) {
			return fail(400, { error: 'Post content cannot be empty', content });
		}

		const media: { url: string; type: 'image' | 'video' }[] = [];

		if (files.length > 0 && files[0].size > 0) {
			for (const file of files) {
				const validation = validatePostMediaFile(file);
				if (!validation.isValid) {
					return fail(400, { error: validation.error ?? 'Invalid media file', content });
				}
				const filename = `post_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${validation.safeExtension}`;
				const url = await postFileStorage.saveFile(file, filename);
				media.push({ url, type: validation.mediaType ?? 'image' });
			}
		}

		try {
			await container.createPostUseCase.execute({
				userId,
				content,
				media: media.length > 0 ? media : undefined
			});
			return { success: true };
		} catch (error) {
			return handleActionError(error, 'Failed to create post', { content });
		}
	},
	toggleSave: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const postId = data.get('postId')?.toString();

		if (!postId) {
			return fail(400, { error: 'Post ID is required' });
		}

		try {
			await container.toggleSavePostUseCase.execute(userId, postId);
			return { success: true };
		} catch (error) {
			return handleActionError(error, 'Failed to toggle save post');
		}
	},
	deletePost: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();
		const postId = data.get('postId')?.toString();

		if (!postId) return fail(400, { error: 'Post ID is required' });

		try {
			await container.deletePostUseCase.execute(postId, userId);
			return { success: true };
		} catch (error) {
			return handleActionError(error, 'Failed to delete post');
		}
	}
};
