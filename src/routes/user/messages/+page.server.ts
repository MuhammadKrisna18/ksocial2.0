import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		throw redirect(302, '/login');
	}

	try {
		const friends = await container.getFriendsUseCase.execute(userId);
		return {
			friends
		};
	} catch (error) {
		console.error('Failed to load friends for messages page:', error);
		return {
			friends: []
		};
	}
};
