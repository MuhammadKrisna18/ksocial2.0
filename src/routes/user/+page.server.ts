import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { fail } from '@sveltejs/kit';
import { handleActionError } from '$lib/presentation/utils/response';
import { postFileStorage } from '$lib/infrastructure/storage/LocalFileStorage';

export const load: PageServerLoad = async ({ locals }) => {
	const posts = await container.getFeedUseCase.execute(locals.user?.sub);
	
	// Convert entities to JSON objects
	return {
		posts: posts.map(p => p.toJSON())
	};
};

export const actions: Actions = {
	createPost: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const content = data.get('content')?.toString() || '';
		const files = data.getAll('media') as File[];

		if (!content.trim() && (!files.length || files[0].size === 0)) {
			return fail(400, { error: 'Post content cannot be empty', content });
		}

		let media: { url: string; type: 'image' | 'video' }[] = [];

		if (files.length > 0 && files[0].size > 0) {
			for (const file of files) {
				const ext = file.name.split('.').pop() || '';
				const filename = `post_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
				const url = await postFileStorage.saveFile(file, filename);
				const type = file.type.startsWith('video/') ? 'video' : 'image';
				media.push({ url, type });
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
