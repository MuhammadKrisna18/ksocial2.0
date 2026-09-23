import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const friends = await container.getFriendsUseCase.execute(locals.user.sub);
		return json({ friends });
	} catch (error) {
		console.error('API /api/chat/friends error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch friends' },
			{ status: 500 }
		);
	}
};
