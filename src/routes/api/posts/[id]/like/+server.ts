import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { container } from '$lib/infrastructure/config/container';

export const POST: RequestHandler = async ({ params, locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const postId = params.id;
	if (!postId) {
		return json({ error: 'Post ID is required' }, { status: 400 });
	}

	try {
		const result = await container.toggleLikeUseCase.execute(userId, postId);
		return json(result);
	} catch (error: any) {
		console.error('Toggle like error:', error);
		return json({ error: 'Failed to toggle like' }, { status: 500 });
	}
};
