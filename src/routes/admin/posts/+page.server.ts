import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { container } from '$lib/infrastructure/config/container';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const posts = await container.getFeedUseCase.execute();

	return {
		user: locals.user,
		posts
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		if (!locals.user.roles?.includes('admin')) {
			return fail(403, { error: true, message: 'Forbidden: Admin access required' });
		}

		const data = await request.formData();
		const postId = data.get('postId')?.toString();

		if (!postId) {
			return fail(400, { missingPostId: true, message: 'Post ID is required' });
		}

		try {
			await container.adminDeletePostUseCase.execute(postId, locals.user.sub);
			return { success: true, message: 'Post successfully deleted and notification sent to the user.' };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to delete post';
			return fail(400, { error: true, message });
		}
	}
};
