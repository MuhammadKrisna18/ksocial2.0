import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { fail, redirect } from '@sveltejs/kit';
import { handleActionError } from '$lib/presentation/utils/response';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		throw redirect(302, '/login');
	}

	const posts = await container.getSavedPostsUseCase.execute(userId);
	const comments = await container.getSavedCommentsUseCase.execute(userId);
	
	return {
		posts: posts.map(p => p.toJSON()),
		comments: comments.map(c => c.toJSON())
	};
};

export const actions: Actions = {
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
