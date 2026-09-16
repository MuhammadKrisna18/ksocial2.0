import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { container } from '$lib/infrastructure/config/container';

export const POST: RequestHandler = async ({ params, locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const commentId = params.id;
	if (!commentId) {
		return json({ error: 'Comment ID is required' }, { status: 400 });
	}

	try {
		const isSaved = await container.toggleSaveCommentUseCase.execute(userId, commentId);
		return json({ isSaved });
	} catch (error: any) {
		console.error('Toggle comment save error:', error);
		return json({ error: 'Failed to toggle comment save' }, { status: 500 });
	}
};
